import { markRaw } from "vue";
import type { MutationTree } from "vuex";
import type { MultiSelectOverlay } from "@/lib/select";
import type { Position } from "@/types/graph";
import type { EventsState } from "./index";

export const mutations = {
  SET_GROUP_MOVE_ACTIVE(state, active: boolean) {
    state.groupMoveActive = active;
  },
  SET_MOVE_ORIGIN_POSITION(state, position: Position | undefined) {
    state.moveOriginPosition = position
      ? { x: position.x, y: position.y }
      : undefined;
  },
  SET_AFFECTED_NODES_ORIGIN_POSITION(
    state,
    nodesWithPosition: EventsState["originNodePositions"],
  ) {
    state.originNodePositions = [...nodesWithPosition];
  },
  SET_MOUSE_PAUSED(state, paused: boolean) {
    state.mousePaused = paused;
  },
  SET_MULTI_SELECT_OVERLAY(
    state,
    multiSelectOverlay: MultiSelectOverlay | null,
  ) {
    state.multiSelectOverlay = multiSelectOverlay
      ? markRaw(multiSelectOverlay)
      : null;
  },
  SET_KEY_UP(state, keyId: number) {
    state.keysdown[keyId] = false;
  },
  SET_KEY_DOWN(state, keyId: number) {
    state.keysdown[keyId] = true;
  },
  SET_WAS_PAUSED(state, paused: boolean) {
    state.wasPaused = paused;
  },
  SET_GRAPH_OVERLAY_MOUSE_DOWN(state, down: boolean) {
    state.graphOverlayMouseDown = down;
  },
  SET_SHOW_TOUR(state, show: boolean) {
    state.showTour = show;
  },
} satisfies MutationTree<EventsState>;

export default mutations;
