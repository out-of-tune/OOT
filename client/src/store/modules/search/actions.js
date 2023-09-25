import GraphService from "@/store/services/GraphService";
import SpotifyService from "@/store/services/SpotifyService";
import _ from "lodash";
import {
  getNodesByLabel,
  getAllNodes,
  searchGraph,
} from "@/assets/js/graphHelper";
import {
  generateSearchObject,
  validateSearchObject,
} from "@/assets/js/searchObjectHelper";
import {
  handleGraphqlTokenError,
  handleTokenError,
} from "@/assets/js/TokenHelper.js";
import { checkNodesExistence } from "@/assets/js/graphQlHelper.js";

const startGraphQlSearch = async ({ commit, rootState, dispatch }) => {
  if (rootState.searchObject.valid) {
    try {
      const searchedNodeType = rootState.searchObject.nodeType;
      const matchingNodeType = rootState.schema.nodeTypes.filter(
        (nt) => nt.label === searchedNodeType,
      )[0];
      if (matchingNodeType) {
        const graphqlNodes = matchingNodeType.endpoints.includes("graphql")
          ? await searchGraphql(
              rootState.searchObject.attributes,
              [matchingNodeType],
              dispatch,
              rootState,
            )
          : [];
        commit("ADD_TO_GRAPH", { nodes: graphqlNodes, links: [] });
      }
    } catch (error) {
      alert(error);
    }
  }
};

const startAdvancedGraphSearch = (
  { dispatch, rootState },
  { addToSelection },
) => {
  if (rootState.searchObject.valid) {
    if (validateSearchObject(rootState.searchObject, rootState.schema)) {
      const filteredNodes = searchGraph(rootState.searchObject, rootState);
      if (filteredNodes.length > 0)
        dispatch("setSuccess", filteredNodes.length + " nodes found");
      if (filteredNodes.length == 0)
        dispatch("setInfo", filteredNodes.length + " nodes found");
      const nodesToSelect = addToSelection
        ? _.uniq([...filteredNodes, ...rootState.selection.selectedNodes])
        : filteredNodes;
      dispatch("selectNodes", nodesToSelect);
      dispatch("fitGraphToSelection");
    } else {
      dispatch("setError", new Error("search parameters not in schema"));
    }
  }
};

function buildNode(label, nodeData) {
  const { id, ...data } = nodeData;
  const newId = label + "/" + id;
  return { id: newId, data: { sid: id, ...data, label: label } };
}
const formatToLowercase = (input) => input.toString().toLowerCase();
const fuzzyStringCompare = (a, b) =>
  formatToLowercase(a).includes(formatToLowercase(b));

async function getNodesFromDatabase(
  nodeType,
  searchString,
  limit,
  rootState,
  dispatch,
) {
  return nodeType === "any"
    ? await queryAllNodeTypes(searchString, rootState, dispatch, limit)
    : await queryNodeType(nodeType, searchString, limit, rootState, dispatch);
}
async function searchSpotify(
  searchString,
  rootState,
  dispatch,
  spotifyNodeTypes,
) {
  const spotifyResult = (
    await handleTokenError(
      (searchString, types, token) => {
        const convertedTypes = types.map((type) =>
          type == "song" ? "track" : type,
        );
        return [
          SpotifyService.searchByString(token, searchString, convertedTypes),
        ];
      },
      [searchString, spotifyNodeTypes],
      dispatch,
      rootState,
    )
  )[0];
  return Object.keys(spotifyResult).flatMap((key) => {
    return convertSpotifyResult(spotifyResult, key);
  });
}

function buildSearchQuery(nodeTypes, searchParameters) {
  const queryParts = nodeTypes
    .map((nodeType) => buildSearchQueryPart(nodeType, searchParameters))
    .join(",");
  return `{${queryParts}}`;
}
function buildSearchQueryPart(nodeType, searchParameters) {
  const searchQueryName = nodeType.label;
  const stringAttributes = nodeType.attributes.join(",");
  const stringifiedFilter = searchParameters
    .map((searchParameter) => {
      //TODO implement operators
      const convertedData =
        typeof searchParameter.attributeData === "number"
          ? searchParameter.attributeData
          : `"${searchParameter.attributeData}"`;
      return searchParameter.attributeSearch + ":" + `${convertedData}`;
    })
    .join(", ");
  return `${searchQueryName}(${stringifiedFilter}){${stringAttributes}}`;
}
function convertGraphQlNodetoGraphNode(node, label) {
  const { id: id, ...restData } = node;
  return {
    id: id,
    data: {
      label: label,
      ...restData,
    },
  };
}

async function getFromGraphQl(
  nodeTypes,
  searchParameters,
  dispatch,
  rootState,
) {
  const query = buildSearchQuery(nodeTypes, searchParameters);
  return await handleGraphqlTokenError(
    GraphService.getNodes.bind(GraphService),
    [query],
    dispatch,
    rootState,
  );
}
async function searchGraphql(
  searchParameters,
  graphQlNodeTypes,
  dispatch,
  rootState,
) {
  const result = await getFromGraphQl(
    graphQlNodeTypes,
    searchParameters,
    dispatch,
    rootState,
  );
  return Object.keys(result).flatMap((key) => {
    return result[key].map((graphQlNode) => {
      return convertGraphQlNodetoGraphNode(graphQlNode, key);
    });
  });
}
async function queryAllNodeTypes(searchString, rootState, dispatch, limit) {
  //TODO: refactor this function
  const fetchFromGraphQlThenSpotify = async () => {
    const graphQlNodes = await searchGraphql(
      [
        { attributeSearch: "name", operator: "=", attributeData: searchString },
        { attributeSearch: "limit", operator: "=", attributeData: limit },
      ],
      graphQlAndSpotifyNodeTypes,
      dispatch,
      rootState,
    );
    const result =
      (await graphQlNodes.length) > 0
        ? graphQlNodes
        : (async () => {
            const spotifyResult = await searchSpotify(
              searchString,
              rootState,
              dispatch,
              graphQlAndSpotifyNodeTypes.map((type) => type.label),
            );
            checkNodesExistence(
              "artist",
              spotifyResult.map((node) => node.data.sid),
              rootState.schema,
              dispatch,
              rootState,
            );
            return spotifyResult;
          })();
    return result;
  };
  const spotifyNodes = await searchSpotify(searchString, rootState, dispatch, [
    "album",
    "song",
  ]);

  const graphQlNodeTypes = rootState.schema.nodeTypes.filter((nodeType) => {
    return (
      nodeType.endpoints.includes("graphql") &&
      !nodeType.endpoints.includes("spotify")
    );
  });

  const graphQlAndSpotifyNodeTypes = rootState.schema.nodeTypes.filter(
    (nodeType) => {
      return (
        nodeType.endpoints.includes("graphql") &&
        nodeType.endpoints.includes("spotify")
      );
    },
  );

  const graphQlNodes = await searchGraphql(
    [
      { attributeSearch: "name", operator: "=", attributeData: searchString },
      { attributeSearch: "limit", operator: "=", attributeData: 50 },
    ],
    graphQlNodeTypes,
    dispatch,
    rootState,
  );

  const graphQlAndSpotifyNodes = await fetchFromGraphQlThenSpotify();

  return [...spotifyNodes, ...graphQlNodes, ...graphQlAndSpotifyNodes];
}
async function queryNodeType(
  nodeType,
  searchString,
  limit,
  rootState,
  dispatch,
) {
  const fetchFromGraphQlThenSpotify = async () => {
    const graphQlNodes = await searchGraphql(
      [
        { attributeSearch: "name", operator: "=", attributeData: searchString },
        { attributeSearch: "limit", operator: "=", attributeData: limit },
      ],
      [schemaNodeType],
      dispatch,
      rootState,
    );
    const result =
      (await graphQlNodes.length) > 0
        ? graphQlNodes
        : (async () => {
            const spotifyResult = await searchSpotify(
              searchString,
              rootState,
              dispatch,
              spotifyNodeTypes,
            );
            console.log(spotifyResult);
            checkNodesExistence(
              "artist",
              spotifyResult.map((node) => node.data.sid),
              rootState.schema,
              dispatch,
              rootState,
            );
            return spotifyResult;
          })();
    return result;
  };
  const schemaNodeType = rootState.schema.nodeTypes.filter(
    (type) => nodeType === type.label,
  )[0];

  const spotifyNodeTypes = schemaNodeType.endpoints.includes("spotify")
    ? [schemaNodeType.label]
    : [];

  const nodes =
    schemaNodeType.endpoints.includes("graphql") &&
    schemaNodeType.endpoints.includes("spotify")
      ? await fetchFromGraphQlThenSpotify()
      : schemaNodeType.endpoints.includes("graphql")
      ? await searchGraphql(
          [
            {
              attributeSearch: "name",
              operator: "=",
              attributeData: searchString,
            },
            { attributeSearch: "limit", operator: "=", attributeData: limit },
          ],
          [schemaNodeType],
          dispatch,
          rootState,
        )
      : await searchSpotify(
          searchString,
          rootState,
          dispatch,
          spotifyNodeTypes,
        );

  return nodes;
}
function convertSpotifyResult(spotifyQueryResults, key) {
  if (key != undefined) {
    return spotifyQueryResults[key].items.map((item) => {
      const label =
        key == "tracks"
          ? "song"
          : key == "albums"
          ? "album"
          : key == "artists"
          ? "artist"
          : "";
      return buildNode(label, item);
    });
  }
  return [];
}
function findNodesInGraph(nodeType, searchString, rootState) {
  const filteredNodes =
    nodeType === "any"
      ? getAllNodes(rootState)
      : getNodesByLabel(nodeType, rootState);
  return filteredNodes.filter(
    (node) =>
      searchString == "" ||
      node.id === searchString ||
      fuzzyStringCompare(node.data.name, searchString),
  );
}
const startSimpleGraphSearch = async (
  { dispatch, rootState },
  { nodeType, searchString },
) => {
  const graphNodes = findNodesInGraph(nodeType, searchString, rootState);
  const databaseNodes =
    searchString != ""
      ? await getNodesFromDatabase(
          nodeType,
          searchString,
          50,
          rootState,
          dispatch,
        )
      : [];
  dispatch("addToGraph", { nodes: databaseNodes, links: [] });
  //Needed for selection, because it requires links (which are empty by default)
  const linkedDatabaseNodes = databaseNodes.map((databaseNode) => {
    return { ...databaseNode, links: [] };
  });
  dispatch("applyNodeColorConfiguration");
  dispatch("applyNodeSizeConfiguration");

  dispatch("selectNodes", [...graphNodes, ...linkedDatabaseNodes]);
};

const setSearchString = ({ commit }, searchString) => {
  commit("SET_SEARCH_STRING", searchString);
};
const setSearchObject = ({ commit }, searchObject) => {
  commit("SET_SEARCH_OBJECT", searchObject);
};

const setAdvancedOpen = ({ commit }, advancedOpen) => {
  commit("SET_ADVANCED_OPEN", advancedOpen);
};

const setSearch = ({ commit }, input) => {
  const searchObject = generateSearchObject(input);
  commit("SET_SEARCH_STRING", input);
  commit("SET_SEARCH_OBJECT", searchObject);
};

export const actions = {
  generateSearchObject,
  startGraphQlSearch,
  startAdvancedGraphSearch,
  startSimpleGraphSearch,
  setSearchString,
  setSearchObject,
  setAdvancedOpen,
  setSearch,
};

export default actions;
