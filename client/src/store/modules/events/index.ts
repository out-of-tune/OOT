import type { Module } from "vuex";
import type { MultiSelectOverlay } from "@/lib/select";
import type { NodeId, Position } from "@/types/graph";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface EventsState {
  /** Group move mode: dragging a selected node moves the whole selection. */
  groupMoveActive: boolean;
  moveOriginPosition: Position | undefined;
  originNodePositions: { node: { id: NodeId }; position: Position }[];
  mousePaused: boolean;
  /** Pressed keys, by key code. */
  keysdown: Record<number, boolean>;
  multiSelectOverlay: MultiSelectOverlay | null;
  graphOverlayMouseDown: boolean;
  wasPaused: boolean;
  showTour: boolean;
}

export const events: Module<EventsState, RootState> = {
  state: () => ({
    groupMoveActive: false,
    moveOriginPosition: undefined,
    originNodePositions: [],
    mousePaused: false,
    keysdown: {},
    multiSelectOverlay: null,
    graphOverlayMouseDown: false,
    wasPaused: false,
    showTour: true,
  }),
  actions,
  mutations,
};

export default events;
