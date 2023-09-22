import GraphService from "@/store/services/GraphService";
import SpotifyService from "../../services/SpotifyService";
import {
  handleGraphqlTokenError,
  handleTokenError,
} from "@/assets/js/TokenHelper.js";
import { getAllNodes, getAllLinks } from "@/assets/js/graphHelper.js";
import {
  checkNodesExistence,
  mergeGraphQlQueries,
} from "@/assets/js/graphQlHelper.js";

var fp = require("lodash/fp");

function getRelevantConfiguredConnections(expandConfiguration, node) {
  return expandConfiguration
    .filter((configuration) => configuration.nodeType === node.data.label)
    .flatMap((configuration) => configuration.edges);
}
function lookUpEdgeTypes(rootState, connections) {
  return rootState.schema.edgeTypes.filter((edgeType) =>
    connections.includes(edgeType.label),
  );
}
function getDirectedConnections(connections, nodeLabel) {
  return connections.map((connection) =>
    connection.inbound.from === nodeLabel
      ? connection.inbound
      : connection.outbound,
  );
}
function buildQuery(clickedNode, connectedNodeTypes) {
  const queryParts = connectedNodeTypes.map((connectedNodeType) => {
    const attrs = connectedNodeType.attributes.join(",");
    return `${connectedNodeType.connectionName}{${attrs}}`;
  });
  const queryPartString = queryParts.join(",");
  return `${clickedNode.data.label}(id:"${clickedNode.id}"){${queryPartString}}`;
}

function lookUpNodeLabel(schema, key, clickedNode) {
  return getMatchingEdgeTypes(schema, key, clickedNode).map((edgeType) => {
    return key === edgeType.inbound.connectionName
      ? edgeType.inbound.to
      : key === edgeType.outbound.connectionName
      ? edgeType.outbound.to
      : null;
  })[0];
}

function lookUpConnectionLabel(schema, key, clickedNode) {
  return getMatchingEdgeTypes(schema, key, clickedNode).map(
    (edgeType) => edgeType.label,
  )[0];
}

function getMatchingEdgeTypes(schema, key, clickedNode) {
  return schema.edgeTypes.filter((edgeType) => {
    return (
      (key === edgeType.inbound.connectionName &&
        clickedNode.data.label === edgeType.inbound.from) ||
      (key == edgeType.outbound.connectionName &&
        clickedNode.data.label === edgeType.outbound.from)
    );
  });
}

function extractNodesFromResponse(responseData, schema, clickedNode) {
  return Object.keys(responseData).flatMap((key) => {
    const lookedUpLabel = lookUpNodeLabel(schema, key, clickedNode);
    return responseData[key].map((node) => {
      const { id, ...data } = node;
      return { id: id, data: { ...data, label: lookedUpLabel } };
    });
  });
}

function extractLinksFromResponse(responseData, schema, clickedNode) {
  return Object.keys(responseData).flatMap((key) => {
    const lookedUpConnectionLabel = lookUpConnectionLabel(
      schema,
      key,
      clickedNode,
    );
    return responseData[key].map((node) => {
      return {
        fromId: clickedNode.id,
        toId: node.id,
        linkTypes: [lookedUpConnectionLabel],
      };
    });
  });
}

function queryResolver(responseData, schema, clickedNode) {
  const nodes = extractNodesFromResponse(responseData, schema, clickedNode);
  const links = extractLinksFromResponse(responseData, schema, clickedNode);
  return { nodes: nodes, links: links };
}

/**
 * gets all connections from schema.edgeTypes which should be expanded according to the expandConfiguration
 * @param {*} rootState rootState is needed to lookup edgeTypes and the expandConfiguration if none is given
 * @param {*} node the node that should be expanded: node.data.label is required
 * @param {*} expandConfiguration states all edges that should be expanded for a nodeType e.g. [{ nodeType: "artist", edges:[ "Artist_to_Genre" ] }]
 */
function getConnections(rootState, node, expandConfiguration = null) {
  const config = expandConfiguration
    ? expandConfiguration
    : rootState.configurations.actionConfiguration.expand;
  const configuredConnections = getRelevantConfiguredConnections(config, node);
  const matchedConnections = lookUpEdgeTypes(rootState, configuredConnections);
  const connections = getDirectedConnections(
    matchedConnections,
    node.data.label,
  );
  return connections;
}

function getGraphQlConnectionsToQuery(rootState, graphQlConnections) {
  return rootState.schema.nodeTypes.flatMap((nodeType) => {
    return graphQlConnections
      .filter((graphQlConnection) => graphQlConnection.to === nodeType.label)
      .map((graphQlConnection) => {
        return {
          connectionName: graphQlConnection.connectionName,
          attributes: nodeType.attributes,
        };
      });
  });
}

function filterConnections(connections, endpoint) {
  return connections.filter((connection) => connection.endpoint === endpoint);
}

async function getGraphQlResult(rootState, nodes, dispatch) {
  const queries = nodes.map((n) => {
    const graphQlQueryObjects = getGraphQlConnectionsToQuery(
      rootState,
      n.connections,
    );
    const query = buildQuery(n.node, graphQlQueryObjects);
    return query;
  });
  const query = mergeGraphQlQueries(queries);
  const response = await handleGraphqlTokenError(
    (query, token) => {
      return GraphService.getNodes(query, token);
    },
    [query],
    dispatch,
    rootState,
  );
  const data = Object.values(response);
  const endresult = data.map((result, index) =>
    queryResolver(result[0], rootState.schema, nodes[index].node),
  );
  return endresult;
}

async function handleGetArtistsByIdError(token, chunk) {
  const boundGetArtistsById =
    SpotifyService.getArtistsById.bind(SpotifyService);
  try {
    const data = await handleTooManyRequestsError(boundGetArtistsById, [
      token,
      chunk,
    ]);
    return data;
  } catch (error) {
    return { artists: chunk.map((artistId) => ({ id: artistId, error })) };
  }
}

async function getArtistsFromAlbum(connections, token) {
  const artistSids = connections.flatMap((c) => {
    return c.node.data.artists.map((artist) => artist.id);
  });

  const chunks = fp.chunk(50)(artistSids);

  const promises = chunks.map((chunk) => {
    return handleGetArtistsByIdError(token, chunk);
  });
  const result = (await Promise.all(promises))
    .flatMap((chunk) => chunk.artists)
    .map((artist, index) =>
      artist
        ? artist
        : { id: artistSids[index], error: new Error("artist is null") },
    )
    .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});
  return result;
}

async function handleGetFullSongDataError(token, chunk) {
  const sids = chunk.map((connection) => connection.node.data.sid);

  const boundGetAlbumFromSong =
    SpotifyService.getFullSongData.bind(SpotifyService);
  try {
    const data = await handleTooManyRequestsError(boundGetAlbumFromSong, [
      token,
      sids,
    ]);
    return data;
  } catch (error) {
    return {
      tracks: chunk.map((connection) => ({
        error: { connection, reason: error },
      })),
    };
  }
}

async function getAlbumFromSong(connections, token) {
  const chunks = fp.chunk(50)(connections);
  const promises = chunks.map((chunk) => {
    const data = handleGetFullSongDataError(token, chunk);
    return data;
  });
  const result = (await Promise.all(promises))
    .flatMap((chunk) => chunk.tracks)
    .map((track, index) => {
      return track
        ? track.album
          ? { items: [track.album] }
          : { items: [], error: track.error }
        : {
            items: [],
            error: {
              connection: connections[index],
              reason: new Error("track is null"),
            },
          };
    });
  return result;
}

async function handleGetAlbumsFromArtistError(token, connection) {
  const boundGetAlbumsFromArtist =
    SpotifyService.getAlbumsFromArtist.bind(SpotifyService);
  try {
    const data = await handleTooManyRequestsError(boundGetAlbumsFromArtist, [
      token,
      connection.node.data.sid,
    ]);
    return data;
  } catch (error) {
    return { items: [], error: { connection, reason: error } };
  }
}

async function getAlbumsFromArtist(connections, token) {
  return await Promise.all(
    connections.map((connection) =>
      handleGetAlbumsFromArtistError(token, connection),
    ),
  );
}

async function handleGetSongsFromAlbumError(token, connection) {
  const boundGetSongsFromAlbum =
    SpotifyService.getSongsFromAlbum.bind(SpotifyService);
  try {
    const data = await handleTooManyRequestsError(boundGetSongsFromAlbum, [
      token,
      connection.node.data.sid,
    ]);
    return data;
  } catch (error) {
    return { items: [], error: { connection, reason: error } };
  }
}

async function getSongsFromAlbum(connections, token) {
  return await Promise.all(
    connections.map((connection) =>
      handleGetSongsFromAlbumError(token, connection),
    ),
  );
}

function convertGetArtistFromAlbumResult(artistResults, connections) {
  return connections.map((connection) => {
    const items = connection.node.data.artists.map(
      (artist) => artistResults[artist.id],
    );
    const failedArtist = items.find((item) => item.error);
    return failedArtist
      ? { items: [], error: { connection, reason: failedArtist.error } }
      : { items };
  });
}
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function handleTooManyRequestsError(fn, args, tries = 0) {
  const promise = fn(...args);
  // const p = (promises instanceof Array) ? Promise.all(promises) : Promise.resolve(promises)
  const data = await promise.catch(async (error) => {
    if (error.response) {
      if (error.response.status === 429) {
        await sleep(parseInt(error.response.headers["retry-after"]) * 1000);
        if (tries < 3) return handleTooManyRequestsError(fn, args, tries + 1);
        else throw error;
      } else throw error;
    } else {
      await sleep(7000);
      if (tries < 3) return handleTooManyRequestsError(fn, args, tries + 1);
      else throw error;
    }
  });
  return data;
}

async function fetchData(categorizedConnections, token) {
  const cc = categorizedConnections;

  const getAlbumFromSongResult =
    cc.getAlbumFromSong.length > 0
      ? getAlbumFromSong(cc.getAlbumFromSong, token)
      : null;
  const getAlbumsFromArtistResult =
    cc.getAlbumsFromArtist.length > 0
      ? getAlbumsFromArtist(cc.getAlbumsFromArtist, token)
      : null;
  const getArtistsFromAlbumResult =
    cc.getArtistsFromAlbum.length > 0
      ? await getArtistsFromAlbum(cc.getArtistsFromAlbum, token)
      : null;
  const getSongsFromAlbumResult =
    cc.getSongsFromAlbum.length > 0
      ? getSongsFromAlbum(cc.getSongsFromAlbum, token)
      : null;

  const convertedArtistsFromAlbumResult = getArtistsFromAlbumResult
    ? convertGetArtistFromAlbumResult(
        getArtistsFromAlbumResult,
        cc.getArtistsFromAlbum,
      )
    : null;
  const result = {
    getAlbumFromSong: await getAlbumFromSongResult,
    getAlbumsFromArtist: await getAlbumsFromArtistResult,
    getArtistsFromAlbum: await convertedArtistsFromAlbumResult,
    getSongsFromAlbum: await getSongsFromAlbumResult,
  };
  return result;
}
function categorizeConnections(nodes) {
  const connections = nodes.flatMap((n) =>
    n.connections.map((c) => ({ ...c, node: n.node })),
  );
  const getConnectionCategory = (from, to) =>
    connections.filter((c) => c.from === from && c.to === to);
  return {
    getArtistsFromAlbum: getConnectionCategory("album", "artist"),
    getSongsFromAlbum: getConnectionCategory("album", "song"),
    getAlbumsFromArtist: getConnectionCategory("artist", "album"),
    getAlbumFromSong: getConnectionCategory("song", "album"),
  };
}

/**
 * Retrieves the data from Spotify
 * @param {*} rootState
 * @param {*} nodes array of nodes with connections [{node, connections}]
 * @param {*} dispatch
 */
async function getSpotifyData(rootState, nodes, dispatch) {
  const categorizedConnections = categorizeConnections(nodes);
  const data = await handleTokenError(
    fetchData,
    [categorizedConnections],
    dispatch,
    rootState,
  );
  return { data, categorizedConnections };
}

/**
 * Builds node with nodeData and the neccessary meta information.
 * @param {*} label label/nodeType of the node that will be built
 * @param {*} nodeData data the node will have  + id (e.g. )
 */
function buildNode(label, nodeData) {
  const { id, ...data } = nodeData;
  const newId = label + "/" + id;
  return { id: newId, data: { sid: id, ...data, label } };
}
function buildLink(toNodeId, fromNode, schema, connectionName) {
  return {
    fromId: fromNode.id,
    toId: toNodeId,
    linkTypes: [lookUpConnectionLabel(schema, connectionName, fromNode)],
  };
}

function getDbNodes(itemsWithConnections, label, schema, dispatch, rootState) {
  const sids = itemsWithConnections.map((i) => i.item.id);
  return checkNodesExistence(label, sids, schema, dispatch, rootState);
}

/**
 * converts the Spotify data to nodes and links
 * @param {*} data array of objects with items which will be converted to nodes: [{items: [ dataObject ]}]
 * @param {*} connections array of connections which initiated the requests: [{ connectionName, from, to, endpoint, node }]
 */
async function generateNodesAndLinks(
  data,
  connections,
  schema,
  dispatch,
  rootState,
) {
  if (data) {
    const itemsWithConnections = connections.flatMap((connection, index) => {
      if (data[index].error) {
        //count errors
        dispatch("addFailedExpandedConnections", data[index].error.connection);
      }
      return data[index].items.map((item) => ({ item, connection }));
    });
    const dbNodes =
      connections[0].to === "artist" && itemsWithConnections.length > 0
        ? await getDbNodes(
            itemsWithConnections,
            "artist",
            schema,
            dispatch,
            rootState,
          )
        : null;

    const result = itemsWithConnections.map((data, index) => {
      const node =
        dbNodes && dbNodes[index]
          ? dbNodes[index]
          : buildNode(data.connection.to, data.item);
      return {
        node,
        link: buildLink(
          node.id,
          data.connection.node,
          schema,
          data.connection.connectionName,
        ),
      };
    });
    return result;
  } else return [];
}

/**
 * Retrieves data for one node from Spotify and converts it to nodes and links
 * @param {*} connections connections to other nodeTypes which will be queried
 * @param {*} rootState rootState is needed to get the token for the API
 * @param {*} nodes the nodes which will be exapnded
 * @param {*} dispatch dispatch is needed to store the nodes where the expand action has failed.
 */
async function getSpotifyResult(rootState, nodes, dispatch) {
  const schema = rootState.schema;
  const spotifyData = await getSpotifyData(rootState, nodes, dispatch);
  const { data, categorizedConnections } = spotifyData;
  // data: {
  //     getArtistsFromAlbum: {[id]: Artist, [id]: Artist, ...}
  //     getSongsFromAlbum: [{items: [Song]}]
  //     getAlbumsFromArtist: [{items: [Album]}]
  //     getAlbumFromSong: [{items: [Album]}]
  // }
  // categorizedConnections: {
  //     getArtistsFromAlbum: [connection]
  //     getSongsFromAlbum: [connection]
  //     getAlbumsFromArtist: [connection]
  //     getAlbumFromSong: [connection]
  // }
  // connection: {
  //     connectionName: String
  //     from: nodeLabel
  //     to: nodeLabel
  //     endpoint: String
  //     node: fromNode
  // }
  // fromNode of type album: {
  //     artists: [{
  //       id
  //     }]
  // }
  // convertedArtists: [{items: [Artist]}]

  const nodesAndLinks = (
    await Promise.all([
      ...(await generateNodesAndLinks(
        data.getArtistsFromAlbum,
        categorizedConnections.getArtistsFromAlbum,
        schema,
        dispatch,
        rootState,
      )),
      ...(await generateNodesAndLinks(
        data.getSongsFromAlbum,
        categorizedConnections.getSongsFromAlbum,
        schema,
        dispatch,
        rootState,
      )),
      ...(await generateNodesAndLinks(
        data.getAlbumsFromArtist,
        categorizedConnections.getAlbumsFromArtist,
        schema,
        dispatch,
        rootState,
      )),
      ...(await generateNodesAndLinks(
        data.getAlbumFromSong,
        categorizedConnections.getAlbumFromSong,
        schema,
        dispatch,
        rootState,
      )),
    ])
  ).reduce(
    (acc, prev) => {
      return {
        nodes: [...acc.nodes, prev.node],
        links: [...acc.links, prev.link],
      };
    },
    { nodes: [], links: [] },
  );

  return [nodesAndLinks];
}

const getNodesWithConnections = (
  endpoint,
  nodes,
  rootState,
  expandConfiguration,
) => {
  return nodes
    .map((node) => {
      return {
        node: node,
        connections: filterConnections(
          getConnections(rootState, node, expandConfiguration),
          endpoint,
        ),
      };
    })
    .filter((node) => node.connections.length > 0);
};

const addResults = (results) =>
  results.reduce(
    (prev, curr) => {
      return {
        nodes: [...prev.nodes, ...curr.nodes],
        links: [...prev.links, ...curr.links],
      };
    },
    { nodes: [], links: [] },
  );

/**
 * Retrieves data for given Node array, converts the result and adds it to the Graph.
 * Only affects connections which are set in the configuration
 * @param {*} vueParams vue specific params
 * @param {Node[]} nodes Array of nodes which will be expanded
 */
const expandAction = async (
  { rootState, dispatch },
  { nodes, expandConfiguration = null, tries = 0 },
) => {
  dispatch("setFailedExpandedConnections", []);
  dispatch("addPendingRequest");
  const getResult = (endpoint) => {
    const nodesWithConnections = getNodesWithConnections(
      endpoint,
      nodes,
      rootState,
      expandConfiguration,
    );
    return nodesWithConnections.length > 0
      ? endpoint === "graphQl"
        ? getGraphQlResult(rootState, nodesWithConnections, dispatch)
        : getSpotifyResult(rootState, nodesWithConnections, dispatch)
      : [{ nodes: [], links: [] }];
  };
  const result = addResults([
    ...(await getResult("graphQl")),
    ...(await getResult("spotify")),
  ]);
  dispatch("removePendingRequest");
  dispatch("addToGraph", result);
  if (rootState.expand.failedExpandedConnections.length > 0 && tries < 3) {
    dispatch(
      "setInfo",
      rootState.expand.failedExpandedConnections.length +
        " requests failed. Trying again in 10 seconds.",
    );
    await sleep(10000);
    const nodes = rootState.expand.failedExpandedConnections.map(
      (connection) => connection.node,
    );
    dispatch("expandAction", { nodes, expandConfiguration, tries: tries + 1 });
  } else if (rootState.expand.failedExpandedConnections.length > 0) {
    dispatch(
      "setInfo",
      rootState.expand.failedExpandedConnections.length + " requests failed.",
    );
  }
};

const addToGraph = ({ commit, dispatch, rootState }, { nodes, links }) => {
  const allNodeIds = getAllNodes(rootState).map((node) => node.id);
  const newNodes = nodes.filter((node) => !allNodeIds.includes(node.id));
  const newLinks = links.filter((link) => {
    const existingLink = rootState.mainGraph.Graph.getLink(
      link.fromId,
      link.toId,
    );
    return !!existingLink
      ? !existingLink.linkTypes.includes(link.linkTypes[0])
      : true;
  });

  dispatch("addChange", {
    data: { nodes: newNodes, links: newLinks },
    type: "add",
  });

  commit("ADD_TO_GRAPH", {
    nodes: newNodes,
    links: newLinks,
  });

  setNodesToNearPosition(rootState, commit, newLinks);

  dispatch("applyAllConfigurations");
  dispatch("rerenderGraph");
};

function setNodesToNearPosition(rootState, commit, links) {
  const xOffset = (Math.round(Math.random() * 100) + 1) / 10;
  links.forEach((link, index) => {
    const toNode = rootState.mainGraph.Graph.getNode(link.toId);
    const positions = toNode.links.map((link) => {
      return link.fromId === toNode.id
        ? rootState.mainGraph.renderState.layout.getNodePosition(link.toId)
        : rootState.mainGraph.renderState.layout.getNodePosition(link.fromId);
    });
    const sumPosition = positions.reduce(
      (prev, curr) => {
        return { x: prev.x + curr.x, y: prev.y + curr.y };
      },
      { x: 0, y: 0 },
    );
    const position = {
      x: sumPosition.x / positions.length,
      y: sumPosition.y / positions.length,
    };
    commit("SET_NODE_POSITION", {
      nodeId: link.toId,
      xPosition: position.x + Math.cos((index + 1) / xOffset) * 200,
      yPosition: position.y + Math.sin((index + 1) / 5) * 200,
    });
  });
}

const applyAllConfigurations = ({ dispatch }) => {
  dispatch("applyEdgeColorConfiguration");
  dispatch("applyNodeColorConfiguration");
  dispatch("applyNodeSizeConfiguration");
};

const setFailedExpandedConnections = ({ commit }, connections) => {
  commit("SET_FAILED_EXPANDED_CONNECTIONS", connections);
};

const addFailedExpandedConnections = ({ commit, state }, connections) => {
  commit("SET_FAILED_EXPANDED_CONNECTIONS", [
    ...state.failedExpandedConnections,
    connections,
  ]);
};

export const actions = {
  expandAction,
  addToGraph,
  applyAllConfigurations,
  setFailedExpandedConnections,
  addFailedExpandedConnections,
};

export default actions;
