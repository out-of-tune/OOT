import type { ActionTree, Dispatch } from "vuex";
import { uniqBy } from "lodash-es";
import { checkNodesExistence } from "@/lib/graphql";
import { gqlString } from "@/lib/graphqlString";
import { getAllNodes, getNodesByLabel, searchGraph } from "@/lib/graph";
import searchObjectHelper from "@/lib/search/searchObject";
import { handleGraphqlTokenError, handleTokenError } from "@/lib/token";
import GraphService from "@/services/GraphService";
import SpotifyService from "@/services/SpotifyService";
import type { GraphNode, NodeInput } from "@/types/graph";
import type { SchemaNodeType } from "@/types/schema";
import type { SearchAttribute, SearchObject } from "@/types/search";
import type { SpotifySearchResult } from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import type { SearchState } from "./index";
import { nodeFromSpotify } from "@/lib/spotifyNode";

type Ctx = Context<SearchState>;

/** Number of results per node type of the simple search. */
const SEARCH_LIMIT = 50;

interface SearchParameter {
  attributeSearch: string;
  operator: string;
  attributeData: string | number;
}

const SPOTIFY_RESULT_LABELS: Record<string, string> = {
  tracks: "song",
  albums: "album",
  artists: "artist",
};

const fuzzyStringCompare = (a: unknown, b: string) =>
  String(a ?? "")
    .toLowerCase()
    .includes(b.toLowerCase());

function buildSearchQueryPart(
  nodeType: SchemaNodeType,
  searchParameters: SearchParameter[],
) {
  const filter = searchParameters
    .map(({ attributeSearch, attributeData }) => {
      const value =
        typeof attributeData === "number"
          ? attributeData
          : gqlString(attributeData);
      return `${attributeSearch}:${value}`;
    })
    .join(", ");
  return `${nodeType.label}(${filter}){${nodeType.attributes.join(",")}}`;
}

async function searchGraphql(
  searchParameters: (SearchParameter | SearchAttribute)[],
  graphQlNodeTypes: SchemaNodeType[],
  dispatch: Dispatch,
  rootState: RootState,
): Promise<NodeInput[]> {
  const query = `{${graphQlNodeTypes.map((nodeType) => buildSearchQueryPart(nodeType, searchParameters)).join(",")}}`;
  const result = await handleGraphqlTokenError(
    (text: string) =>
      GraphService.getNodes<Record<string, Record<string, unknown>[]>>(text),
    [query],
    dispatch,
    rootState,
  );
  // A field whose resolver failed is null.
  return Object.keys(result).flatMap((label) =>
    (result[label] ?? []).map(({ id, ...data }) => ({
      id: String(id),
      data: { label, ...data },
    })),
  );
}

async function searchSpotify(
  searchString: string,
  rootState: RootState,
  dispatch: Dispatch,
  spotifyNodeTypes: string[],
): Promise<NodeInput[]> {
  const [spotifyResult]: SpotifySearchResult[] = await handleTokenError(
    (text: string, types: string[], token: string) => [
      SpotifyService.searchByString(
        token,
        text,
        types.map((type) => (type === "song" ? "track" : type)),
      ),
    ],
    [searchString, spotifyNodeTypes],
    dispatch,
    rootState,
  );
  return (Object.keys(spotifyResult) as (keyof SpotifySearchResult)[]).flatMap(
    (key) =>
      (spotifyResult[key]?.items ?? []).map((item) =>
        nodeFromSpotify(
          SPOTIFY_RESULT_LABELS[key] ?? "",
          item as unknown as Record<string, unknown>,
        ),
      ),
  );
}

/**
 * Spotify search that does not fail the whole search. Without a working Spotify token
 * (for example no app credentials) the database results still show.
 */
async function searchSpotifyOrSkip(
  searchString: string,
  rootState: RootState,
  dispatch: Dispatch,
  spotifyNodeTypes: string[],
): Promise<NodeInput[]> {
  if (spotifyNodeTypes.length === 0) return [];
  try {
    return await searchSpotify(
      searchString,
      rootState,
      dispatch,
      spotifyNodeTypes,
    );
  } catch (error) {
    console.warn("Spotify search failed", error);
    dispatch(
      "setInfo",
      "Spotify is not reachable. Only database results are shown.",
    );
    return [];
  }
}

const nameAndLimit = (
  searchString: string,
  limit: number,
): SearchParameter[] => [
  { attributeSearch: "name", operator: "=", attributeData: searchString },
  { attributeSearch: "limit", operator: "=", attributeData: limit },
];

/** Registers unknown artists in the database. The result is not needed, so errors are only logged. */
function registerArtists(
  label: string,
  nodes: NodeInput[],
  rootState: RootState,
  dispatch: Dispatch,
) {
  const sids = nodes.map((node) => String(node.data.sid));
  if (sids.length === 0) return;
  Promise.resolve(
    checkNodesExistence(label, sids, rootState.schema, dispatch, rootState),
  ).catch((error: unknown) =>
    console.warn("Could not register the search results", error),
  );
}

async function queryAllNodeTypes(
  searchString: string,
  rootState: RootState,
  dispatch: Dispatch,
  limit: number,
): Promise<NodeInput[]> {
  const nodeTypes = rootState.schema.nodeTypes;
  const hasEndpoint = (
    nodeType: SchemaNodeType,
    endpoint: "graphql" | "spotify",
  ) => nodeType.endpoints?.includes(endpoint) ?? false;

  const spotifyTypes = nodeTypes
    .filter((nodeType) => hasEndpoint(nodeType, "spotify"))
    .map((nodeType) => nodeType.label);
  const graphQlTypes = nodeTypes.filter((nodeType) =>
    hasEndpoint(nodeType, "graphql"),
  );

  // Each endpoint keeps its results when the other one fails.
  const [spotifyNodes, graphQlNodes] = await Promise.all([
    searchSpotifyOrSkip(searchString, rootState, dispatch, spotifyTypes),
    searchGraphql(
      nameAndLimit(searchString, limit),
      graphQlTypes,
      dispatch,
      rootState,
    ).catch((error: unknown) => {
      console.warn("Database search failed", error);
      return [] as NodeInput[];
    }),
  ]);

  // A Spotify result that the database also found shows once, as the database node.
  const knownSids = new Set(graphQlNodes.map((node) => node.data.sid));
  const newSpotifyNodes = spotifyNodes.filter(
    (node) => !knownSids.has(node.data.sid),
  );
  registerArtists(
    "artist",
    newSpotifyNodes.filter((node) => node.data.label === "artist"),
    rootState,
    dispatch,
  );
  return [...newSpotifyNodes, ...graphQlNodes];
}

async function queryNodeType(
  nodeType: string,
  searchString: string,
  limit: number,
  rootState: RootState,
  dispatch: Dispatch,
): Promise<NodeInput[]> {
  const schemaNodeType = rootState.schema.nodeTypes.find(
    (type) => type.label === nodeType,
  );
  if (!schemaNodeType) throw new Error(`Node ${nodeType} not found in schema`);
  const [spotifyNodes, graphQlNodes] = await Promise.all([
    schemaNodeType.endpoints?.includes("spotify")
      ? searchSpotifyOrSkip(searchString, rootState, dispatch, [
          schemaNodeType.label,
        ])
      : [],
    schemaNodeType.endpoints?.includes("graphql")
      ? searchGraphql(
          nameAndLimit(searchString, limit),
          [schemaNodeType],
          dispatch,
          rootState,
        ).catch((error: unknown) => {
          // With a Spotify endpoint too, the Spotify results still show.
          if (!schemaNodeType.endpoints?.includes("spotify")) throw error;
          console.warn("Database search failed", error);
          return [] as NodeInput[];
        })
      : [],
  ]);
  if (schemaNodeType.label === "artist")
    registerArtists("artist", spotifyNodes, rootState, dispatch);
  return [...spotifyNodes, ...graphQlNodes];
}

function findNodesInGraph(
  nodeType: string,
  searchString: string,
  rootState: RootState,
): GraphNode[] {
  const nodes =
    nodeType === "any"
      ? getAllNodes(rootState)
      : getNodesByLabel(nodeType, rootState);
  return nodes.filter(
    (node) =>
      searchString === "" ||
      node.id === searchString ||
      fuzzyStringCompare(node.data.name, searchString),
  );
}

export const actions = {
  generateSearchObject: (_context: Ctx, input: string) =>
    searchObjectHelper.generateSearchObject(input),

  /** Adds the database nodes that match the advanced search to the graph. */
  async startGraphQlSearch({ commit, rootState, dispatch }: Ctx) {
    if (!rootState.searchObject.valid) return;
    try {
      const nodeType = rootState.schema.nodeTypes.find(
        (type) => type.label === rootState.searchObject.nodeType,
      );
      if (!nodeType) return;
      const nodes = nodeType.endpoints?.includes("graphql")
        ? await searchGraphql(
            rootState.searchObject.attributes,
            [nodeType],
            dispatch,
            rootState,
          )
        : [];
      commit("ADD_TO_GRAPH", { nodes, links: [] });
    } catch (error) {
      dispatch("setError", error);
    }
  },

  /** Selects the graph nodes that match the advanced search. */
  startAdvancedGraphSearch(
    { dispatch, rootState }: Ctx,
    { addToSelection }: { addToSelection: boolean },
  ) {
    if (!rootState.searchObject.valid) return;
    if (
      !searchObjectHelper.validateSearchObject(
        rootState.searchObject,
        rootState.schema,
      )
    ) {
      dispatch("setError", new Error("search parameters not in schema"));
      return;
    }
    const filteredNodes = searchGraph(rootState.searchObject, rootState);
    dispatch(
      filteredNodes.length > 0 ? "setSuccess" : "setInfo",
      `${filteredNodes.length} nodes found`,
    );
    const nodesToSelect = addToSelection
      ? uniqBy(
          [...filteredNodes, ...rootState.selection.selectedNodes],
          (node) => node.id,
        )
      : filteredNodes;
    dispatch("selectNodes", nodesToSelect);
    dispatch("fitGraphToSelection");
  },

  /**
   * Searches the graph, the database and Spotify by name, adds the results to the graph
   * and selects every match.
   */
  async startSimpleGraphSearch(
    { dispatch, rootState }: Ctx,
    { nodeType, searchString }: { nodeType: string; searchString: string },
  ) {
    const graphNodes = findNodesInGraph(nodeType, searchString, rootState);
    let databaseNodes: NodeInput[] = [];
    if (searchString !== "") {
      dispatch("addPendingRequest");
      try {
        databaseNodes =
          nodeType === "any"
            ? await queryAllNodeTypes(
                searchString,
                rootState,
                dispatch,
                SEARCH_LIMIT,
              )
            : await queryNodeType(
                nodeType,
                searchString,
                SEARCH_LIMIT,
                rootState,
                dispatch,
              );
      } catch (error) {
        dispatch("setError", error);
      } finally {
        dispatch("removePendingRequest");
      }
    }
    dispatch("addToGraph", { nodes: databaseNodes, links: [] });
    dispatch("applyNodeColorConfiguration");
    dispatch("applyNodeSizeConfiguration");
    // Selection needs a `links` array. A node found twice is selected once.
    const found = [
      ...graphNodes,
      ...databaseNodes.map((node) => ({ ...node, links: [] })),
    ];
    const selected = uniqBy(found, (node) => node.id);
    dispatch("selectNodes", selected);
    // New nodes appear at random places. Moving the camera to them makes the result visible.
    if (selected.length > 0) dispatch("fitGraphToSelection");
  },

  setSearchString({ commit }: Ctx, searchString: string) {
    commit("SET_SEARCH_STRING", searchString);
  },

  setSearchObject({ commit }: Ctx, searchObject: SearchObject) {
    commit("SET_SEARCH_OBJECT", searchObject);
  },

  setAdvancedOpen({ commit }: Ctx, advancedOpen: boolean) {
    commit("SET_ADVANCED_OPEN", advancedOpen);
  },

  setSearch({ commit }: Ctx, input: string) {
    commit("SET_SEARCH_STRING", input);
    commit("SET_SEARCH_OBJECT", searchObjectHelper.generateSearchObject(input));
  },
} satisfies ActionTree<SearchState, RootState>;

export default actions;
