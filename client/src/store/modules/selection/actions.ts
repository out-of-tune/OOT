import type { ActionTree } from "vuex";
import { chunk, isEqual, uniq } from "lodash-es";
import {
  getAllLinks,
  getAllNodes,
  getNodePosition,
  getNodeUi,
} from "@/lib/graph";
import type { SelectedArea } from "@/lib/select";
import { handleTokenError } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { GraphLink, GraphNode, NodeId, Position } from "@/types/graph";
import type { SpotifyTrack } from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import type { SelectionState } from "./index";
import { withOpacity } from "@/lib/color";

type Ctx = Context<SelectionState>;

/** Two hex digits of alpha for the selection highlight. */
const OPACITY = { solid: "ff", half: "88", faded: "44" } as const;

/** Nodes whose screen position is inside the rectangle. Works for the 2D and the 3D view. */
function getNodesInArea(rootState: RootState, area: SelectedArea) {
  const renderer = rootState.mainGraph.renderState.Renderer;
  if (!renderer) return [];
  const graphics = renderer.getGraphics();
  return getAllNodes(rootState).filter((node) => {
    const point = graphics.toScreen(getNodeUi(rootState, node).position);
    return (
      point.visible &&
      point.x >= area.x &&
      point.x <= area.x + area.width &&
      point.y >= area.y &&
      point.y <= area.y + area.height
    );
  });
}

function getSelectedNodes(addToSelection: boolean, state: SelectionState) {
  return addToSelection
    ? uniq([...state.selectedNodes, ...state.temporarySelectedNodes])
    : state.temporarySelectedNodes;
}

function getSelectedLinkIds(nodes: GraphNode[]) {
  return nodes.flatMap((node) => (node.links ?? []).map((link) => link.id));
}

function countUnique(values: string[]) {
  const counts: Record<string, number> = {};
  values.forEach((value) => {
    counts[value] = (counts[value] ?? 0) + 1;
  });
  return counts;
}

/** Links between two selected nodes stay solid, links with one selected end are half faded. */
function categorizeLinks(
  links: GraphLink[],
  linkCounts: Record<string, number>,
) {
  const categories = {
    colored: [] as GraphLink[],
    halfTransparent: [] as GraphLink[],
    transparent: [] as GraphLink[],
  };
  links.forEach((link) => {
    const count = linkCounts[link.id] ?? 0;
    const category =
      count > 1 ? "colored" : count === 1 ? "halfTransparent" : "transparent";
    categories[category].push(link);
  });
  return categories;
}

export const actions = {
  /** Previews the rectangle selection: fades the nodes that leave it and shows the ones that enter it. */
  handleAreaSelected(
    { commit, dispatch, rootState }: Ctx,
    { area }: { area: SelectedArea },
  ) {
    const selectedNodes = getNodesInArea(rootState, area);
    const { temporarySelectedNodes, selectedNodes: currentSelection } =
      rootState.selection;
    if (isEqual(selectedNodes, temporarySelectedNodes)) return;

    if (temporarySelectedNodes.length === 0) {
      dispatch("markNodes", uniq([...currentSelection, ...selectedNodes]));
    }
    const isKept = (node: GraphNode) => currentSelection.includes(node);
    selectedNodes
      .filter((node) => !temporarySelectedNodes.includes(node) && !isKept(node))
      .forEach((node) =>
        dispatch("setNodeOpacity", { node, opacity: OPACITY.solid }),
      );
    temporarySelectedNodes
      .filter((node) => !selectedNodes.includes(node) && !isKept(node))
      .forEach((node) =>
        dispatch("setNodeOpacity", { node, opacity: OPACITY.faded }),
      );

    commit("SET_TEMPORARY_SELECTED", selectedNodes);
    commit("RERENDER_GRAPH");
  },

  selectionFinished(
    { commit, dispatch, state, rootState }: Ctx,
    { addToSelection }: { addToSelection: boolean },
  ) {
    const selectedNodes = getSelectedNodes(addToSelection, state);
    dispatch("setSelectedNodes", selectedNodes);
    dispatch("setEdgesTransparent");
    if (selectedNodes.length === 0) {
      dispatch("applyNodeColorConfiguration");
      dispatch("applyEdgeColorConfiguration");
    }
    commit("SET_TEMPORARY_SELECTED", []);
    if (rootState.appearance.highlight) dispatch("storeColors");
  },

  setLinkOpacity(
    { rootState, commit }: Ctx,
    { link, opacity }: { link: Pick<GraphLink, "id">; opacity: string },
  ) {
    const renderer = rootState.mainGraph.renderState.Renderer;
    if (!renderer) return;
    const color = renderer.getGraphics().getLinkUI(link.id).color;
    commit("SET_EDGE_COLOR", { link, color: withOpacity(color, opacity) });
  },

  setNodeOpacity(
    { rootState, commit }: Ctx,
    { node, opacity }: { node: { id: NodeId }; opacity: string },
  ) {
    const color = getNodeUi(rootState, node).color;
    commit("SET_NODE_COLOR", {
      node: node.id,
      color: withOpacity(color, opacity),
    });
  },

  setEdgesTransparent({ rootState, state, dispatch }: Ctx) {
    const linkCounts = countUnique(
      getSelectedLinkIds(getSelectedNodes(true, state)),
    );
    const categories = categorizeLinks(getAllLinks(rootState), linkCounts);
    categories.transparent.forEach((link) =>
      dispatch("setLinkOpacity", { link, opacity: OPACITY.faded }),
    );
    categories.halfTransparent.forEach((link) =>
      dispatch("setLinkOpacity", { link, opacity: OPACITY.half }),
    );
    categories.colored.forEach((link) =>
      dispatch("setLinkOpacity", { link, opacity: OPACITY.solid }),
    );
  },

  /** Fades every node, then shows the given nodes solid. */
  markNodes({ dispatch, rootState }: Ctx, nodes: GraphNode[]) {
    rootState.mainGraph.Graph.forEachNode((node) => {
      dispatch("setNodeOpacity", { node, opacity: OPACITY.faded });
    });
    nodes.forEach((node) =>
      dispatch("setNodeOpacity", { node, opacity: OPACITY.solid }),
    );
  },

  setSelectedNodes({ commit }: Ctx, nodes: GraphNode[]) {
    commit("SET_SELECTED_NODES", nodes);
  },

  changeSelectionModalState({ commit, state }: Ctx, open?: boolean) {
    commit("SET_SELECTION_MODAL_STATE", open ?? !state.modalOpen);
  },

  moveToNextNode({ dispatch, commit, state }: Ctx) {
    if (state.selectedNodeIndex < state.selectedNodes.length - 1) {
      dispatch("moveToNode", state.selectedNodes[state.selectedNodeIndex + 1]);
      commit("SET_SELECTED_INDEX", state.selectedNodeIndex + 1);
    } else {
      dispatch("moveToFirstNode");
    }
  },

  moveToPreviousNode({ dispatch, commit, state }: Ctx) {
    if (state.selectedNodeIndex > 0) {
      dispatch("moveToNode", state.selectedNodes[state.selectedNodeIndex - 1]);
      commit("SET_SELECTED_INDEX", state.selectedNodeIndex - 1);
    } else {
      dispatch("moveToLastNode");
    }
  },

  moveToFirstNode({ dispatch, commit, state }: Ctx) {
    if (state.selectedNodes.length === 0) return;
    dispatch("moveToNode", state.selectedNodes[0]);
    commit("SET_SELECTED_INDEX", 0);
  },

  moveToLastNode({ dispatch, commit, state }: Ctx) {
    if (state.selectedNodes.length === 0) return;
    dispatch("moveToNode", state.selectedNodes[state.selectedNodes.length - 1]);
    commit("SET_SELECTED_INDEX", state.selectedNodes.length - 1);
  },

  updateSelectionUI({ dispatch }: Ctx, nodes: GraphNode[]) {
    dispatch("markNodes", nodes);
    dispatch("setEdgesTransparent");
  },

  selectNodes({ dispatch }: Ctx, nodes: GraphNode[]) {
    dispatch("setSelectedNodes", nodes);
    dispatch("updateSelectionUI", nodes);
  },

  deselect({ dispatch }: Ctx) {
    dispatch("setSelectedNodes", []);
    dispatch("applyNodeColorConfiguration");
    dispatch("applyEdgeColorConfiguration");
    dispatch("setInfo", "Selection removed");
  },

  selectAll({ dispatch, rootState }: Ctx) {
    dispatch("setInfo", "Selected all nodes");
    dispatch("markNodes", getAllNodes(rootState));
    dispatch("setSelectedNodes", getAllNodes(rootState));
  },

  async expandSelectedNodes({ dispatch, state }: Ctx) {
    await dispatch("expandAction", { nodes: state.selectedNodes });
    dispatch("applyAllConfigurations");
    dispatch("markNodes", state.selectedNodes);
    dispatch("setEdgesTransparent");
  },

  collapseSelectedNodes({ dispatch, state }: Ctx) {
    state.selectedNodes.forEach((node) => dispatch("collapseAction", node));
  },

  /** Removes the selected nodes. Undo restores them with their links. */
  removeSelectedNodes({ commit, state, dispatch }: Ctx) {
    const nodes = state.selectedNodes;
    dispatch("setInfo", `${nodes.length} selected nodes removed`);
    dispatch("addChange", {
      data: {
        nodes: nodes.map((node) => ({
          id: node.id,
          data: { ...node.data },
          links: (node.links ?? []).map((link) => ({
            ...link,
            linkTypes: [...link.linkTypes],
          })),
        })),
        links: [],
      },
      type: "remove",
    });
    nodes.forEach((node) => commit("REMOVE_NODE", node));
    dispatch("setSelectedNodes", []);
    dispatch("applyAllConfigurations");
  },

  /** Loads the full data of the selected songs and adds them to the queue. */
  async addSelectedSongsToQueue({ commit, rootState, state, dispatch }: Ctx) {
    const songNodes = state.selectedNodes.filter(
      (node) => node.data.label === "song",
    );
    if (songNodes.length === 0) {
      dispatch("setInfo", "No songs selected");
      return;
    }
    const sids = songNodes.map((node) => String(node.data.sid));
    try {
      const results: { tracks: (SpotifyTrack | null)[] }[] = await Promise.all(
        chunk(sids, 50).map((ids) =>
          handleTokenError(
            (batch: string[], token: string) =>
              SpotifyService.getFullSongData(token, batch),
            [ids],
            dispatch,
            rootState,
          ),
        ),
      );
      const tracks = results.flatMap((result) => result.tracks);
      const updatedNodes = songNodes.flatMap((node, index) => {
        const track = tracks[index];
        if (!track) return [];
        return [
          {
            id: node.id,
            data: { ...node.data, ...track, images: track.album?.images ?? [] },
          },
        ];
      });
      commit("ADD_TO_GRAPH", { nodes: updatedNodes, links: [] });
      dispatch("applyAllConfigurations");
      // One after another, so the Spotify queue keeps the order of the selection.
      for (const node of updatedNodes)
        await dispatch("addToQueue", { ...node.data });
      dispatch("setSuccess", `Added ${updatedNodes.length} songs to queue`);
    } catch (error) {
      dispatch("setError", error);
    }
  },

  addSelectedSongsToPlaylist({ state, dispatch }: Ctx) {
    const songs = state.selectedNodes
      .filter((node) => node.data.label === "song")
      .map((node) => node.data);
    return dispatch("addSongsToPlaylist", songs);
  },

  pinNodes({ commit, dispatch }: Ctx, nodes: GraphNode[]) {
    nodes.forEach((node) => commit("PIN_NODE", node));
    dispatch("setInfo", `${nodes.length} nodes pinned`);
  },

  unpinNodes({ commit, dispatch }: Ctx, nodes: GraphNode[]) {
    nodes.forEach((node) => commit("UNPIN_NODE", node));
    dispatch("setInfo", `${nodes.length} nodes released`);
  },

  invertSelection({ rootState, dispatch }: Ctx) {
    if (rootState.selection.selectedNodes.length === 0) return;
    const selectedIds = new Set(
      rootState.selection.selectedNodes.map((node) => node.id),
    );
    const inverted = getAllNodes(rootState).filter(
      (node) => !selectedIds.has(node.id),
    );
    dispatch("setSelectedNodes", inverted);
    dispatch("updateSelectionUI", inverted);
  },

  /** Moves the selection by the distance that the dragged node moved. */
  moveSelection(
    { rootState, commit }: Ctx,
    {
      originNode,
      nodesWithPositionToMove,
      oldOriginPosition,
    }: {
      originNode: GraphNode;
      nodesWithPositionToMove: { node: { id: NodeId }; position: Position }[];
      oldOriginPosition: Position;
    },
  ) {
    const newPosition = getNodePosition(rootState, originNode);
    const dx = oldOriginPosition.x - newPosition.x;
    const dy = oldOriginPosition.y - newPosition.y;
    const dz = (oldOriginPosition.z ?? 0) - (newPosition.z ?? 0);
    nodesWithPositionToMove.forEach(({ node, position }) => {
      if (node.id === originNode.id) return;
      commit("SET_NODE_POSITION", {
        nodeId: node.id,
        xPosition: position.x - dx,
        yPosition: position.y - dy,
        ...(position.z === undefined ? {} : { zPosition: position.z - dz }),
      });
    });
  },
} satisfies ActionTree<SelectionState, RootState>;

export default actions;
