import type { ActionTree } from "vuex";
import {
  axisRange,
  axisValue,
  compassPositions,
  type CompassAxis,
} from "@/lib/compass";
import {
  getNodePosition,
  getNodesByLabel,
  getNodeUi,
  getPinnedState,
} from "@/lib/graph";
import { COVER_SIDE } from "@/lib/view/contract";
import type { NodeMove } from "@/store/modules/history";
import type { Context, RootState } from "@/store/types";
import type { ActiveCompass, CompassState } from "./index";

type Ctx = Context<CompassState>;

/** Space between node centers, relative to the side of the largest cover. */
const SPACING = 1.25;
/** Side of the plane for each node on it, relative to the spacing. A sparse plane reads better. */
const AREA_PER_NODE = 2.2;
/** Smallest side of the plane, in graph units. */
const MIN_SIDE = 400;

export const actions = {
  /**
   * Pins the nodes of one type on two axes, like a map: each node goes to its values.
   * Undo puts the nodes back where they were.
   */
  applyCompass(
    { commit, dispatch, rootState }: Ctx,
    {
      nodeLabel,
      xAxis,
      yAxis,
    }: { nodeLabel: string; xAxis: CompassAxis; yAxis: CompassAxis },
  ) {
    const nodes = getNodesByLabel(nodeLabel, rootState);
    if (nodes.length === 0) {
      dispatch("setInfo", `There are no ${nodeLabel} nodes in the graph`);
      return;
    }
    const largest = Math.max(
      ...nodes.map((node) => getNodeUi(rootState, node).size),
    );
    const spacing = largest * COVER_SIDE[rootState.viewMode] * SPACING;
    const side = Math.max(
      MIN_SIDE,
      Math.sqrt(nodes.length) * spacing * AREA_PER_NODE,
    );
    const up = rootState.viewMode === "3d" ? 1 : -1;
    const items = nodes.map((node) => ({
      id: node.id,
      name: String(node.data.name ?? node.id),
      x: axisValue(xAxis, node.data),
      y: axisValue(yAxis, node.data),
    }));
    const placed = items.filter(
      (item) => item.x !== undefined && item.y !== undefined,
    );
    const positions = compassPositions(items, xAxis, yAxis, {
      width: side,
      height: side,
      spacing,
      up,
    });
    const moves: NodeMove[] = nodes.map((node) => {
      const position = positions.get(node.id) ?? { x: 0, y: 0 };
      return {
        nodeId: node.id,
        from: {
          ...getNodePosition(rootState, node),
          pinned: getPinnedState(rootState, node),
        },
        to: {
          x: position.x,
          y: position.y,
          ...(up === 1 ? { z: 0 } : {}),
          pinned: true,
        },
      };
    });
    const compass: ActiveCompass = {
      nodeLabel,
      xAxis,
      yAxis,
      xRange: axisRange(
        placed.map((item) => item.x as number),
        xAxis,
      ),
      yRange: axisRange(
        placed.map((item) => item.y as number),
        yAxis,
      ),
      width: side,
      height: side,
      up,
      // Nodes that were pinned before stay pinned on release.
      nodeIds: moves
        .filter((move) => !move.from.pinned)
        .map((move) => move.nodeId),
    };
    dispatch("applyMoves", { moves, direction: "to" });
    dispatch("addChange", {
      type: "move",
      data: { nodes: [], links: [] },
      moves,
      compass,
    });
    commit("SET_COMPASS", compass);
    dispatch("fitGraphToNodes", nodes);
  },

  /** Unpins the nodes that the compass pinned, so the layout moves them again, and removes the axes. */
  releaseCompass({ commit, state, rootState }: Ctx) {
    const graph = rootState.mainGraph.Graph;
    state.active?.nodeIds.forEach((nodeId) => {
      if (graph.getNode(nodeId)) commit("UNPIN_NODE", { id: nodeId });
    });
    commit("SET_COMPASS", null);
  },
} satisfies ActionTree<CompassState, RootState>;

export default actions;
