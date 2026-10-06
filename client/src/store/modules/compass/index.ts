import type { Module } from "vuex";
import type { CompassAxis } from "@/lib/compass";
import type { NodeId } from "@/types/graph";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

/** The compass that is on the graph: its node type, its axes and the size of its plane. */
export interface ActiveCompass {
  nodeLabel: string;
  xAxis: CompassAxis;
  yAxis: CompassAxis;
  /** Smallest and largest value on each axis, for the labels of the axis ends. */
  xRange: [number, number];
  yRange: [number, number];
  width: number;
  height: number;
  /** +1 when larger graph y is higher on screen (3D), -1 when it is lower (2D). */
  up: 1 | -1;
  /** The nodes that the compass pinned and that were not pinned before. Release unpins them. */
  nodeIds: NodeId[];
}

export interface CompassState {
  active: ActiveCompass | null;
}

export const compass: Module<CompassState, RootState> = {
  state: () => ({ active: null }),
  actions,
  mutations,
};

export default compass;
