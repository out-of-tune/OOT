import { getGraphObject } from "@/assets/js/graphHelper";
import IndexedDbService from "@/store/services/IndexedDbService";
import schema from "@/store/modules/graph_io/schema";
import { Validator } from "jsonschema";

const downloadGraph = ({ commit, rootState }) => {
  const graph = getGraphObject(rootState);
  const file = new Blob([JSON.stringify(graph)], { type: "JSON" });
  const url = URL.createObjectURL(file);
  commit("SET_GRAPH_URL", url);
};

const storeGraph = ({ rootState, dispatch, state, commit }, name) => {
  const graph = getGraphObject(rootState);
  try {
    IndexedDbService.saveGraph(name, graph);
    const graphNames = state.storedGraphNames.includes(name)
      ? state.storedGraphNames
      : [...state.storedGraphNames, name];
    commit("SET_STORED_GRAPH_NAMES", graphNames);
    dispatch("setSuccess", "save complete");
  } catch (e) {
    dispatch(
      "setError",
      new Error("Graph could not be saved, please download it."),
    );
  }
};

const loadGraphFromIndexedDb = async ({ dispatch }, name) => {
  try {
    const graph = await IndexedDbService.getGraph(name);
    dispatch("loadGraph", graph);
    dispatch("setSuccess", "Graph loaded");
  } catch (error) {
    dispatch("setError", error);
  }
};
const removeGraphFromIndexedDb = async ({ commit, dispatch, state }, name) => {
  try {
    await IndexedDbService.deleteGraph(name);
    const graphNames = state.storedGraphNames.filter(
      (graphName) => graphName !== name,
    );
    commit("SET_STORED_GRAPH_NAMES", graphNames);
    dispatch("setSuccess", "Graph deleted");
  } catch (error) {
    dispatch("setError", error);
  }
};
const importGraph = ({ dispatch }, graphString) => {
  try {
    const validator = new Validator();
    const unverifiedGraph = JSON.parse(graphString);
    const checkedGraph = validator.validate(unverifiedGraph, schema);
    if (checkedGraph.errors.length == 0) {
      dispatch("setSuccess", "Loaded graph successfully");
      dispatch("loadGraph", checkedGraph.instance);
    } else {
      const errorStrings = checkedGraph.errors.map((error) => {
        return "error at " + error.property;
      });
      throw new Error(errorStrings.join("\n"));
    }
  } catch (error) {
    dispatch("setError", error);
  }
};
const loadGraph = ({ commit, dispatch }, graph) => {
  if (graph) {
    const nodes = graph.nodesWithPositions.map((n) => n.node);
    commit("CLEAR_GRAPH");
    commit("ADD_TO_GRAPH", {
      nodes: nodes,
      links: graph.links,
    });

    graph.nodesWithPositions.forEach((n) => {
      commit("SET_NODE_POSITION", {
        nodeId: n.node.id,
        xPosition: n.position.x,
        yPosition: n.position.y,
      });
      if (n.pinned) {
        commit("PIN_NODE", n.node);
      }
    });

    dispatch("applyAllConfigurations");
    dispatch("setSuccess", "Graph loaded");
  } else {
    dispatch("setError", new Error("Graph couldn't be loaded"));
  }
};

export const actions = {
  downloadGraph,
  storeGraph,
  loadGraph,
  loadGraphFromIndexedDb,
  importGraph,
  removeGraphFromIndexedDb,
};

export default actions;
