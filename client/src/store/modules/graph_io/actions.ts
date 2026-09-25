import type { ActionTree } from "vuex";
import { getGraphObject } from "@/lib/graph";
import IndexedDbService from "@/services/IndexedDbService";
import type { GraphObject } from "@/types/graph";
import type { Context, RootState } from "@/store/types";
import type { GraphIoState } from "./index";
import schema from "./schema";
import { parseJsonWithSchema } from "@/lib/json";

type Ctx = Context<GraphIoState>;

export const actions = {
  downloadGraph({ commit, rootState }: Ctx) {
    const file = new Blob([JSON.stringify(getGraphObject(rootState))], {
      type: "application/json",
    });
    commit("SET_GRAPH_URL", URL.createObjectURL(file));
  },

  async storeGraph({ rootState, dispatch, state, commit }: Ctx, name: string) {
    if (!name) {
      dispatch("setError", new Error("Enter a name for the graph"));
      return;
    }
    try {
      await IndexedDbService.saveGraph(name, getGraphObject(rootState));
      commit(
        "SET_STORED_GRAPH_NAMES",
        state.storedGraphNames.includes(name)
          ? state.storedGraphNames
          : [...state.storedGraphNames, name],
      );
      dispatch("setSuccess", "save complete");
    } catch {
      dispatch(
        "setError",
        new Error("Graph could not be saved, please download it."),
      );
    }
  },

  async loadGraphFromIndexedDb({ dispatch }: Ctx, name: string) {
    try {
      const graph = await IndexedDbService.getGraph(name);
      dispatch("loadGraph", graph);
    } catch (error) {
      dispatch("setError", error);
    }
  },

  async removeGraphFromIndexedDb(
    { commit, dispatch, state }: Ctx,
    name: string,
  ) {
    try {
      await IndexedDbService.deleteGraph(name);
      commit(
        "SET_STORED_GRAPH_NAMES",
        state.storedGraphNames.filter((graphName) => graphName !== name),
      );
      dispatch("setSuccess", "Graph deleted");
    } catch (error) {
      dispatch("setError", error);
    }
  },

  importGraph({ dispatch }: Ctx, graphString: string) {
    try {
      const graph = parseJsonWithSchema<GraphObject>(graphString, schema);
      dispatch("loadGraph", graph);
    } catch (error) {
      dispatch("setError", error);
    }
  },

  loadGraph({ commit, dispatch }: Ctx, graph: GraphObject | undefined) {
    if (!graph) {
      dispatch("setError", new Error("Graph couldn't be loaded"));
      return;
    }
    commit("CLEAR_GRAPH");
    commit("ADD_TO_GRAPH", {
      nodes: graph.nodesWithPositions.map((entry) => entry.node),
      links: graph.links,
    });
    graph.nodesWithPositions.forEach((entry) => {
      commit("SET_NODE_POSITION", {
        nodeId: entry.node.id,
        xPosition: entry.position.x,
        yPosition: entry.position.y,
      });
      if (entry.pinned) commit("PIN_NODE", entry.node);
    });
    dispatch("applyAllConfigurations");
    dispatch("setSuccess", "Graph loaded");
  },
} satisfies ActionTree<GraphIoState, RootState>;

export default actions;
