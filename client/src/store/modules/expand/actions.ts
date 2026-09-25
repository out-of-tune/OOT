import type { ActionTree, Commit, Dispatch } from "vuex";
import { chunk } from "lodash-es";
import { checkNodesExistence, mergeGraphQlQueries } from "@/lib/graphql";
import { gqlString } from "@/lib/graphqlString";
import { getAllNodes } from "@/lib/graph";
import { handleGraphqlTokenError, handleTokenError } from "@/lib/token";
import GraphService from "@/services/GraphService";
import SpotifyService from "@/services/SpotifyService";
import type { ActionRule } from "@/types/configuration";
import type { GraphItems, LinkInput, NodeInput } from "@/types/graph";
import type { EdgeDirection, Schema, SchemaEdgeType } from "@/types/schema";
import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
} from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import type { ExpandState } from "./index";
import { nodeFromSpotify } from "@/lib/spotifyNode";

type Ctx = Context<ExpandState>;

/** A node that expands, with the connections to follow. */
interface NodeWithConnections {
  node: NodeInput;
  connections: EdgeDirection[];
}

/** One connection to follow from one node. */
export interface Connection extends EdgeDirection {
  node: NodeInput;
}

interface FailedConnection {
  connection: Connection;
  reason: unknown;
}

/** Items that one connection returned, or the error of its request. */
interface ConnectionResult<T = Record<string, unknown>> {
  items: T[];
  error?: FailedConnection;
}

/** How often a failed expand is retried. */
const MAX_EXPAND_RETRIES = 3;
/** Wait before a failed expand is retried, in milliseconds. */
const EXPAND_RETRY_DELAY = 10000;
/** Wait after a network error without a `retry-after` header, in milliseconds. */
const NETWORK_RETRY_DELAY = 7000;
/** Spotify accepts at most 50 ids per batch request. */
const SPOTIFY_BATCH_SIZE = 50;

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function getRelevantConfiguredConnections(
  expandConfiguration: ActionRule[],
  node: NodeInput,
) {
  return expandConfiguration
    .filter((configuration) => configuration.nodeType === node.data.label)
    .flatMap((configuration) => configuration.edges);
}

/** The direction of each edge type that starts at the node type. */
function getDirectedConnections(
  connections: SchemaEdgeType[],
  nodeLabel: string,
) {
  return connections.map((connection) =>
    connection.inbound.from === nodeLabel
      ? connection.inbound
      : connection.outbound,
  );
}

function getMatchingEdgeTypes(
  schema: Schema,
  key: string,
  clickedNode: NodeInput,
) {
  return schema.edgeTypes.filter(
    (edgeType) =>
      (key === edgeType.inbound.connectionName &&
        clickedNode.data.label === edgeType.inbound.from) ||
      (key === edgeType.outbound.connectionName &&
        clickedNode.data.label === edgeType.outbound.from),
  );
}

function lookUpNodeLabel(
  schema: Schema,
  key: string,
  clickedNode: NodeInput,
): string | undefined {
  const edgeType = getMatchingEdgeTypes(schema, key, clickedNode)[0];
  if (!edgeType) return undefined;
  if (key === edgeType.inbound.connectionName) return edgeType.inbound.to;
  if (key === edgeType.outbound.connectionName) return edgeType.outbound.to;
  return undefined;
}

function lookUpConnectionLabel(
  schema: Schema,
  key: string,
  clickedNode: NodeInput,
) {
  return getMatchingEdgeTypes(schema, key, clickedNode)[0]?.label;
}

/** Converts one GraphQL result of a clicked node into nodes and links. */
function queryResolver(
  responseData: Record<string, { id: string; [key: string]: unknown }[]>,
  schema: Schema,
  clickedNode: NodeInput,
): GraphItems {
  const keys = Object.keys(responseData);
  const nodes = keys.flatMap((key) => {
    const label = lookUpNodeLabel(schema, key, clickedNode) ?? "";
    return responseData[key].map(({ id, ...data }) => ({
      id,
      data: { ...data, label },
    }));
  });
  const links = keys.flatMap((key) => {
    const linkType = lookUpConnectionLabel(schema, key, clickedNode);
    return responseData[key].map((node) => ({
      fromId: clickedNode.id,
      toId: node.id,
      linkTypes: linkType ? [linkType] : [],
    }));
  });
  return { nodes, links };
}

/**
 * The connections of the schema that expand follows for a node.
 * `expandConfiguration` lists the edges per node type, for example
 * `[{ nodeType: "artist", edges: ["Artist_to_Genre"] }]`. It defaults to the user configuration.
 */
function getConnections(
  rootState: RootState,
  node: NodeInput,
  expandConfiguration: ActionRule[] | null = null,
) {
  const config =
    expandConfiguration ?? rootState.configurations.actionConfiguration.expand;
  const configured = getRelevantConfiguredConnections(config, node);
  const matched = rootState.schema.edgeTypes.filter((edgeType) =>
    configured.includes(edgeType.label),
  );
  return getDirectedConnections(matched, node.data.label);
}

async function getGraphQlResult(
  rootState: RootState,
  nodes: NodeWithConnections[],
  dispatch: Dispatch,
): Promise<GraphItems[]> {
  const queries = nodes.map(({ node, connections }) => {
    const parts = rootState.schema.nodeTypes.flatMap((nodeType) =>
      connections
        .filter((connection) => connection.to === nodeType.label)
        .map(
          (connection) =>
            `${connection.connectionName}{${nodeType.attributes.join(",")}}`,
        ),
    );
    return `${node.data.label}(id:${gqlString(node.id)}){${parts.join(",")}}`;
  });
  const response = await handleGraphqlTokenError(
    GraphService.getNodes.bind(GraphService),
    [mergeGraphQlQueries(queries)],
    dispatch,
    rootState,
  );
  return Object.values(response as Record<string, Record<string, never>[]>).map(
    (result, index) =>
      queryResolver(result[0] ?? {}, rootState.schema, nodes[index].node),
  );
}

/**
 * Calls a Spotify request. On "429 Too Many Requests" it waits for `retry-after` and retries.
 * On a network error it waits a fixed time and retries. It gives up after three retries.
 */
async function handleTooManyRequestsError<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  args: TArgs,
  tries = 0,
): Promise<TResult> {
  try {
    return await fn(...args);
  } catch (error) {
    const response = (
      error as {
        response?: { status: number; headers: Record<string, string> };
      }
    ).response;
    if (response && response.status !== 429) throw error;
    if (tries >= MAX_EXPAND_RETRIES) throw error;
    await sleep(
      response
        ? parseInt(response.headers["retry-after"] ?? "1", 10) * 1000
        : NETWORK_RETRY_DELAY,
    );
    return handleTooManyRequestsError(fn, args, tries + 1);
  }
}

type ArtistResult = SpotifyArtist | { id: string; error: unknown };

async function getArtistsById(
  token: string,
  ids: string[],
): Promise<{ artists: (ArtistResult | null)[] }> {
  try {
    return await handleTooManyRequestsError(
      SpotifyService.getArtistsById.bind(SpotifyService),
      [token, ids],
    );
  } catch (error) {
    return { artists: ids.map((id) => ({ id, error })) };
  }
}

/** The artists of each album, in one batch request per 50 artists. */
async function getArtistsFromAlbum(connections: Connection[], token: string) {
  const artistSids = connections.flatMap((connection) =>
    ((connection.node.data.artists as { id: string }[] | undefined) ?? []).map(
      (artist) => artist.id,
    ),
  );
  const results = await Promise.all(
    chunk(artistSids, SPOTIFY_BATCH_SIZE).map((ids) =>
      getArtistsById(token, ids),
    ),
  );
  const byId: Record<string, ArtistResult> = {};
  results
    .flatMap((result) => result.artists)
    .forEach((artist, index) => {
      const resolved = artist ?? {
        id: artistSids[index],
        error: new Error("artist is null"),
      };
      byId[resolved.id] = resolved;
    });
  return byId;
}

function convertArtistsFromAlbum(
  artistResults: Record<string, ArtistResult>,
  connections: Connection[],
): ConnectionResult[] {
  return connections.map((connection) => {
    const items = (
      (connection.node.data.artists as { id: string }[] | undefined) ?? []
    ).map((artist) => artistResults[artist.id]);
    const failed = items.find((item) => item && "error" in item) as
      { error: unknown } | undefined;
    return failed
      ? { items: [], error: { connection, reason: failed.error } }
      : { items: items as unknown as Record<string, unknown>[] };
  });
}

/** The album of each song, in one batch request per 50 songs. */
async function getAlbumFromSong(
  connections: Connection[],
  token: string,
): Promise<ConnectionResult[]> {
  const batches = await Promise.all(
    chunk(connections, SPOTIFY_BATCH_SIZE).map(async (batch) => {
      const sids = batch.map((connection) => String(connection.node.data.sid));
      try {
        const data = await handleTooManyRequestsError(
          (songToken: string, ids: string[]) =>
            SpotifyService.getFullSongData(songToken, ids),
          [token, sids],
        );
        return data.tracks.map((track, index): ConnectionResult =>
          track?.album
            ? { items: [track.album as unknown as Record<string, unknown>] }
            : {
                items: [],
                error: {
                  connection: batch[index],
                  reason: new Error("track is null"),
                },
              },
        );
      } catch (error) {
        return batch.map((connection): ConnectionResult => ({
          items: [],
          error: { connection, reason: error },
        }));
      }
    }),
  );
  return batches.flat();
}

/** Runs a paged Spotify request per connection. A failed request becomes an error entry. */
function getPerConnection<T>(
  connections: Connection[],
  token: string,
  request: (token: string, sid: string) => Promise<{ items: T[] }>,
): Promise<ConnectionResult[]> {
  return Promise.all(
    connections.map(async (connection) => {
      try {
        const data = await handleTooManyRequestsError(request, [
          token,
          String(connection.node.data.sid),
        ]);
        return { items: data.items as unknown as Record<string, unknown>[] };
      } catch (error) {
        return { items: [], error: { connection, reason: error } };
      }
    }),
  );
}

interface CategorizedConnections {
  getArtistsFromAlbum: Connection[];
  getSongsFromAlbum: Connection[];
  getAlbumsFromArtist: Connection[];
  getAlbumFromSong: Connection[];
}

type SpotifyResults = Record<
  keyof CategorizedConnections,
  ConnectionResult[] | null
>;

async function fetchData(
  cc: CategorizedConnections,
  token: string,
): Promise<SpotifyResults> {
  const [albumFromSong, albumsFromArtist, artistsFromAlbum, songsFromAlbum] =
    await Promise.all([
      cc.getAlbumFromSong.length > 0
        ? getAlbumFromSong(cc.getAlbumFromSong, token)
        : null,
      cc.getAlbumsFromArtist.length > 0
        ? getPerConnection<SpotifyAlbum>(
            cc.getAlbumsFromArtist,
            token,
            SpotifyService.getAlbumsFromArtist.bind(SpotifyService),
          )
        : null,
      cc.getArtistsFromAlbum.length > 0
        ? getArtistsFromAlbum(cc.getArtistsFromAlbum, token)
        : null,
      cc.getSongsFromAlbum.length > 0
        ? getPerConnection<SpotifyTrack>(
            cc.getSongsFromAlbum,
            token,
            SpotifyService.getSongsFromAlbum.bind(SpotifyService),
          )
        : null,
    ]);
  return {
    getAlbumFromSong: albumFromSong,
    getAlbumsFromArtist: albumsFromArtist,
    getArtistsFromAlbum: artistsFromAlbum
      ? convertArtistsFromAlbum(artistsFromAlbum, cc.getArtistsFromAlbum)
      : null,
    getSongsFromAlbum: songsFromAlbum,
  };
}

function categorizeConnections(
  nodes: NodeWithConnections[],
): CategorizedConnections {
  const connections: Connection[] = nodes.flatMap(
    ({ node, connections: directions }) =>
      directions.map((direction) => ({ ...direction, node })),
  );
  const category = (from: string, to: string) =>
    connections.filter(
      (connection) => connection.from === from && connection.to === to,
    );
  return {
    getArtistsFromAlbum: category("album", "artist"),
    getSongsFromAlbum: category("album", "song"),
    getAlbumsFromArtist: category("artist", "album"),
    getAlbumFromSong: category("song", "album"),
  };
}

function buildLink(
  toNodeId: string,
  fromNode: NodeInput,
  schema: Schema,
  connectionName: string,
): LinkInput {
  const linkType = lookUpConnectionLabel(schema, connectionName, fromNode);
  return {
    fromId: fromNode.id,
    toId: toNodeId,
    linkTypes: linkType ? [linkType] : [],
  };
}

/**
 * Converts the Spotify results of one connection category to nodes and links.
 * Artists that exist in the database keep their database id.
 */
async function generateNodesAndLinks(
  data: ConnectionResult[] | null,
  connections: Connection[],
  schema: Schema,
  dispatch: Dispatch,
  rootState: RootState,
): Promise<{ node: NodeInput; link: LinkInput }[]> {
  if (!data) return [];
  const itemsWithConnections = connections.flatMap((connection, index) => {
    const result = data[index];
    if (result.error)
      dispatch("addFailedExpandedConnections", result.error.connection);
    return result.items.map((item) => ({ item, connection }));
  });
  const dbNodes =
    connections[0]?.to === "artist" && itemsWithConnections.length > 0
      ? await checkNodesExistence(
          "artist",
          itemsWithConnections.map(({ item }) => String(item.id)),
          schema,
          dispatch,
          rootState,
        )
      : null;
  return itemsWithConnections.map(({ item, connection }, index) => {
    const node = dbNodes?.[index] ?? nodeFromSpotify(connection.to, item);
    return {
      node,
      link: buildLink(
        node.id,
        connection.node,
        schema,
        connection.connectionName,
      ),
    };
  });
}

async function getSpotifyResult(
  rootState: RootState,
  nodes: NodeWithConnections[],
  dispatch: Dispatch,
): Promise<GraphItems[]> {
  const schema = rootState.schema;
  const categorized = categorizeConnections(nodes);
  const data: SpotifyResults = await handleTokenError(
    fetchData,
    [categorized],
    dispatch,
    rootState,
  );
  const categories = Object.keys(
    categorized,
  ) as (keyof CategorizedConnections)[];
  const results = (
    await Promise.all(
      categories.map((category) =>
        generateNodesAndLinks(
          data[category],
          categorized[category],
          schema,
          dispatch,
          rootState,
        ),
      ),
    )
  ).flat();
  return [
    {
      nodes: results.map((result) => result.node),
      links: results.map((result) => result.link),
    },
  ];
}

function getNodesWithConnections(
  endpoint: EdgeDirection["endpoint"],
  nodes: NodeInput[],
  rootState: RootState,
  expandConfiguration: ActionRule[] | null,
): NodeWithConnections[] {
  return nodes
    .map((node) => ({
      node,
      connections: getConnections(rootState, node, expandConfiguration).filter(
        (connection) => connection.endpoint === endpoint,
      ),
    }))
    .filter((node) => node.connections.length > 0);
}

const addResults = (results: GraphItems[]): GraphItems => ({
  nodes: results.flatMap((result) => result.nodes),
  links: results.flatMap((result) => result.links),
});

/** Places new nodes on a curve around the average position of their neighbors. */
function setNodesToNearPosition(
  rootState: RootState,
  commit: Commit,
  links: LinkInput[],
) {
  const layout = rootState.mainGraph.renderState.layout;
  if (!layout) return;
  const xOffset = (Math.round(Math.random() * 100) + 1) / 10;
  links.forEach((link, index) => {
    const toNode = rootState.mainGraph.Graph.getNode(link.toId);
    const neighborLinks = toNode?.links ?? [];
    if (neighborLinks.length === 0) return;
    const positions = neighborLinks.map((neighborLink) =>
      layout.getNodePosition(
        neighborLink.fromId === link.toId
          ? neighborLink.toId
          : neighborLink.fromId,
      ),
    );
    const sum = positions.reduce(
      (acc, position) => ({ x: acc.x + position.x, y: acc.y + position.y }),
      {
        x: 0,
        y: 0,
      },
    );
    commit("SET_NODE_POSITION", {
      nodeId: link.toId,
      xPosition:
        sum.x / positions.length + Math.cos((index + 1) / xOffset) * 200,
      yPosition: sum.y / positions.length + Math.sin((index + 1) / 5) * 200,
    });
  });
}

export const actions = {
  /**
   * Loads the neighbors of the nodes from the database and from Spotify and adds them to the graph.
   * Only follows the connections of the configuration. Returns every node and link it found.
   */
  async expandAction(
    { rootState, dispatch }: Ctx,
    {
      nodes,
      expandConfiguration = null,
      tries = 0,
    }: {
      nodes: NodeInput[];
      expandConfiguration?: ActionRule[] | null;
      tries?: number;
    },
  ): Promise<GraphItems> {
    dispatch("setFailedExpandedConnections", []);
    dispatch("addPendingRequest");
    const getResult = (
      endpoint: EdgeDirection["endpoint"],
    ): Promise<GraphItems[]> | GraphItems[] => {
      const nodesWithConnections = getNodesWithConnections(
        endpoint,
        nodes,
        rootState,
        expandConfiguration,
      );
      if (nodesWithConnections.length === 0) return [{ nodes: [], links: [] }];
      return endpoint === "graphQl"
        ? getGraphQlResult(rootState, nodesWithConnections, dispatch)
        : getSpotifyResult(rootState, nodesWithConnections, dispatch);
    };
    let result: GraphItems;
    try {
      result = addResults([
        ...(await getResult("graphQl")),
        ...(await getResult("spotify")),
      ]);
    } catch (error) {
      dispatch("setError", error);
      return { nodes: [], links: [] };
    } finally {
      dispatch("removePendingRequest");
    }
    dispatch("addToGraph", result);

    const failed = rootState.expand.failedExpandedConnections;
    if (failed.length > 0 && tries < MAX_EXPAND_RETRIES) {
      dispatch(
        "setInfo",
        `${failed.length} requests failed. Trying again in 10 seconds.`,
      );
      await sleep(EXPAND_RETRY_DELAY);
      dispatch("expandAction", {
        nodes: rootState.expand.failedExpandedConnections.map(
          (connection) => connection.node,
        ),
        expandConfiguration,
        tries: tries + 1,
      });
    } else if (failed.length > 0) {
      dispatch("setInfo", `${failed.length} requests failed.`);
    }
    return result;
  },

  /** Adds the nodes and links that are not in the graph yet and records the change for undo. */
  addToGraph(
    { commit, dispatch, rootState }: Ctx,
    { nodes, links }: GraphItems,
  ) {
    const existingIds = new Set(getAllNodes(rootState).map((node) => node.id));
    const newNodes = nodes.filter((node) => !existingIds.has(node.id));
    const newLinks = links.filter((link) => {
      const existing = rootState.mainGraph.Graph.getLink(
        link.fromId,
        link.toId,
      );
      return existing
        ? !existing.linkTypes.includes(link.linkTypes?.[0] ?? "")
        : true;
    });
    dispatch("addChange", {
      data: { nodes: newNodes, links: newLinks },
      type: "add",
    });
    commit("ADD_TO_GRAPH", { nodes: newNodes, links: newLinks });
    setNodesToNearPosition(rootState, commit, newLinks);
    dispatch("applyAllConfigurations");
    dispatch("rerenderGraph");
  },

  applyAllConfigurations({ dispatch }: Ctx) {
    dispatch("applyEdgeColorConfiguration");
    dispatch("applyNodeColorConfiguration");
    dispatch("applyNodeSizeConfiguration");
  },

  setFailedExpandedConnections({ commit }: Ctx, connections: Connection[]) {
    commit("SET_FAILED_EXPANDED_CONNECTIONS", connections);
  },

  addFailedExpandedConnections({ commit, state }: Ctx, connection: Connection) {
    commit("SET_FAILED_EXPANDED_CONNECTIONS", [
      ...state.failedExpandedConnections,
      connection,
    ]);
  },
} satisfies ActionTree<ExpandState, RootState>;

export default actions;
