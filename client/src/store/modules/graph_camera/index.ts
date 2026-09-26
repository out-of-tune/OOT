import type { Module } from "vuex";
import type { NodeData, NodeId, Position } from "@/types/graph";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

/** A text label drawn over a node when the user zooms in. */
export interface NodeLabel {
  id: NodeId;
  coordinates: Position;
  colors: { textColor: string; backgroundColor: string };
  data: NodeData;
  dataKey: string;
}

export interface GraphCameraState {
  nodeLabels: Record<NodeId, NodeLabel>;
}

export const graph_camera: Module<GraphCameraState, RootState> = {
  state: () => ({ nodeLabels: {} }),
  actions,
  mutations,
};

export default graph_camera;
