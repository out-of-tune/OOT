// The calls that the store and the components make on the graph renderer.
// vivaView.ts (2D) and threeView.ts (3D) implement them.
import type { NgraphGraph } from "ngraph.graph";
import type { GraphNode, NodeId, Position } from "@/types/graph";

export type ViewMode = "2d" | "3d";

/** Style of one node. Setting `color` or `size` changes the node on screen. */
export interface NodeUI {
  node: GraphNode;
  /** RGBA color as a 32 bit integer, for example 0x009ee8ff. */
  color: number;
  size: number;
  /** Position in graph coordinates. `z` is only set in 3D. */
  position: Position;
}

export interface LinkUI {
  /** RGBA color as a 32 bit integer. */
  color: number;
}

/** A point on the screen, in client coordinates. */
export interface ScreenPoint {
  x: number;
  y: number;
  /** False when the point is behind the camera (3D only). */
  visible: boolean;
}

export interface GraphGraphics {
  getNodeUI(nodeId: NodeId): NodeUI;
  getLinkUI(linkId: string): LinkUI;
  updateSize(width: number, height: number): void;
  /** Projects a point in graph coordinates to the screen. */
  toScreen(position: Position): ScreenPoint;
  /** Calls the callback for each node on each frame, for example to place DOM labels. */
  placeNode(callback: (ui: NodeUI, position: Position) => void): void;
}

export interface GraphLayout {
  getNodePosition(nodeId: NodeId): Position;
  setNodePosition(nodeId: NodeId, x: number, y: number, z?: number): void;
  pinNode(node: { id: NodeId }, isPinned: boolean): void;
  isNodePinned(node: { id: NodeId }): boolean;
}

export interface GraphInputEvents {
  mouseEnter(callback: (node: GraphNode) => void): GraphInputEvents;
  mouseLeave(callback: (node: GraphNode) => void): GraphInputEvents;
  click(callback: (node: GraphNode) => void): GraphInputEvents;
  mouseDown(callback: (node: GraphNode) => void): GraphInputEvents;
  mouseMove(callback: (node: GraphNode) => void): GraphInputEvents;
  mouseUp(callback: (node: GraphNode) => void): GraphInputEvents;
}

export interface GraphRenderer {
  readonly mode: ViewMode;
  run(): void;
  rerender(): void;
  dispose(): void;
  /** Stops the layout. The camera still works. */
  pause(): void;
  resume(): void;
  getGraphics(): GraphGraphics;
  getLayout(): GraphLayout;
  createInputEvents(): GraphInputEvents;
  /** Moves and zooms the camera so that all given nodes are on screen. */
  fitToNodes(nodes: GraphNode[]): void;
  /** Centers the view on a point in graph coordinates. */
  moveTo(x: number, y: number, z?: number): void;
  /** Zoom factor. Larger means closer. */
  getTransform(): { scale: number };
  zoomIn(): number;
  zoomOut(): number;
  on(event: "scale", callback: (scale: number) => void): void;
}

export interface LayoutOptions {
  springLength: number;
  springCoeff: number;
  dragCoeff: number;
  gravity: number;
}

export interface ViewFactoryOptions {
  graph: NgraphGraph;
  container: HTMLElement;
  layoutOptions: LayoutOptions;
}

export type ViewFactory = (options: ViewFactoryOptions) => GraphRenderer;
