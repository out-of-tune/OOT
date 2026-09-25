// Type declarations for untyped third party packages.
// They cover only the API surface that this app uses.

declare module "ngraph.graph" {
  import type { GraphLink, GraphNode, NodeData, NodeId } from "@/types/graph";

  export interface NgraphGraph {
    addNode(nodeId: NodeId, data?: NodeData): GraphNode;
    addLink(fromId: NodeId, toId: NodeId, data?: unknown): GraphLink;
    removeNode(nodeId: NodeId): boolean;
    removeLink(link: GraphLink): boolean;
    getNode(nodeId: NodeId): GraphNode | undefined;
    getLink(fromId: NodeId, toId: NodeId): GraphLink | null;
    getLinks(nodeId: NodeId): GraphLink[] | null;
    hasLink(fromId: NodeId, toId: NodeId): GraphLink | null;
    getNodesCount(): number;
    getLinksCount(): number;
    forEachNode(callback: (node: GraphNode) => boolean | void): void;
    forEachLink(callback: (link: GraphLink) => boolean | void): void;
    forEachLinkedNode(
      nodeId: NodeId,
      callback: (node: GraphNode, link: GraphLink) => boolean | void,
      oriented?: boolean,
    ): void;
    clear(): void;
    beginUpdate(): void;
    endUpdate(): void;
    on(event: "changed", callback: (changes: unknown[]) => void): NgraphGraph;
    off(event: "changed", callback: (changes: unknown[]) => void): NgraphGraph;
  }

  export default function createGraph(options?: {
    uniqueLinkId?: boolean;
  }): NgraphGraph;
}

declare module "ngraph.cw" {
  import type { NgraphGraph } from "ngraph.graph";
  import type { NodeId } from "@/types/graph";

  export interface ChineseWhisper {
    step(): void;
    getChangeRate(): number;
    getClass(nodeId: NodeId): unknown;
    /** Map of cluster class to the ids of the nodes in the cluster. */
    createClusterMap(): Map<unknown, NodeId[]>;
  }

  export default function createChineseWhisper(
    graph: NgraphGraph,
  ): ChineseWhisper;
}

declare module "vivagraphjs" {
  import type { NgraphGraph } from "ngraph.graph";
  import type { GraphLink, GraphNode, NodeId, Position } from "@/types/graph";

  export interface NodeUI {
    id: number;
    node: GraphNode;
    /** RGBA color as a 32 bit integer, for example 0x009ee8ff. */
    color: number;
    size: number;
    position: Position;
  }

  export interface LinkUI {
    id: number;
    link: GraphLink;
    color: number;
  }

  export interface WebglGraphics {
    getNodeUI(nodeId: NodeId): NodeUI;
    getLinkUI(linkId: string): LinkUI;
    updateSize(width?: number, height?: number): void;
    transformClientToGraphCoordinates(point: Position): Position;
    transformGraphToClientCoordinates(point: Position): Position;
    placeNode(
      callback: (ui: NodeUI, position: Position) => void,
    ): WebglGraphics;
    release(container: HTMLElement): void;
  }

  export interface Layout {
    getNodePosition(nodeId: NodeId): Position;
    setNodePosition(nodeId: NodeId, x: number, y: number): void;
    pinNode(node: GraphNode, isPinned: boolean): void;
    isNodePinned(node: GraphNode): boolean;
  }

  export interface Transform {
    scale: number;
    offsetX: number;
    offsetY: number;
  }

  export interface Renderer {
    run(iterationsCount?: number): Renderer;
    rerender(): void;
    dispose(): void;
    pause(): void;
    resume(): void;
    getGraphics(): WebglGraphics;
    getLayout(): Layout;
    getTransform(): Transform;
    moveTo(x: number, y: number): void;
    zoomIn(): number;
    zoomOut(): number;
    on(event: "scale", callback: (scale: number) => void): Renderer;
  }

  export interface InputEvents {
    mouseEnter(callback: (node: GraphNode) => void): InputEvents;
    mouseLeave(callback: (node: GraphNode) => void): InputEvents;
    mouseDown(
      callback: (node: GraphNode, event: MouseEvent) => void,
    ): InputEvents;
    mouseUp(
      callback: (node: GraphNode, event: MouseEvent) => void,
    ): InputEvents;
    mouseMove(
      callback: (node: GraphNode, event: MouseEvent) => void,
    ): InputEvents;
    click(callback: (node: GraphNode, event: MouseEvent) => void): InputEvents;
    dblClick(
      callback: (node: GraphNode, event: MouseEvent) => void,
    ): InputEvents;
  }

  export interface DragAndDrop {
    onStart(callback: (event: MouseEvent) => void): DragAndDrop;
    onDrag(callback: (event: MouseEvent) => void): DragAndDrop;
    onStop(callback: (event: MouseEvent) => void): DragAndDrop;
    release(): void;
  }

  export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  const Viva: {
    Graph: {
      graph(): NgraphGraph;
      View: {
        webglGraphics(options?: {
          clearColor?: boolean;
          clearColorValue?: Color;
        }): WebglGraphics;
        renderer(
          graph: NgraphGraph,
          options: {
            layout: Layout;
            container: HTMLElement;
            graphics: WebglGraphics;
          },
        ): Renderer;
      };
      Layout: {
        forceDirected(
          graph: NgraphGraph,
          options: {
            springLength: number;
            springCoeff: number;
            dragCoeff: number;
            gravity: number;
          },
        ): Layout;
      };
      webglInputEvents(
        graphics: WebglGraphics,
        graph: NgraphGraph,
      ): InputEvents;
      Utils: {
        dragndrop(element: HTMLElement): DragAndDrop;
      };
    };
  };
  export default Viva;
}
