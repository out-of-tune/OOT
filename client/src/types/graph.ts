/** Id of a node in the graph, for example `Artist/123` or `song/4uLU6hMCjMI75M1A2tKUQC`. */
export type NodeId = string;

/** Attributes of a node. `label` is the node type (artist, genre, album, song). */
export interface NodeData {
  label: string;
  name?: string;
  /** Spotify id of the entity, when the node comes from Spotify. */
  sid?: string;
  [attribute: string]: unknown;
}

/** A link as stored in the ngraph graph. */
export interface GraphLink {
  id: string;
  fromId: NodeId;
  toId: NodeId;
  data?: unknown;
  /** Edge types (schema edge labels) that this link represents. */
  linkTypes: string[];
}

/** A node as stored in the ngraph graph. `links` is `null` until the first link is added. */
export interface GraphNode<TData extends NodeData = NodeData> {
  id: NodeId;
  data: TData;
  links: GraphLink[] | null;
}

/** A node that is not in the graph yet. */
export interface NodeInput<TData extends NodeData = NodeData> {
  id: NodeId;
  data: TData;
  links?: GraphLink[] | null;
}

/** A link that is not in the graph yet. */
export interface LinkInput {
  fromId: NodeId;
  toId: NodeId;
  linkTypes?: string[];
  /** Single edge type. Used when `linkTypes` is not set. */
  linkName?: string;
}

export interface GraphItems {
  nodes: NodeInput[];
  links: LinkInput[];
}

export interface Position {
  x: number;
  y: number;
}

/** Serialized graph, used by download, IndexedDB and share. */
export interface GraphObject {
  nodesWithPositions: {
    node: NodeInput;
    position: Position;
    pinned: boolean;
  }[];
  links: LinkInput[];
}
