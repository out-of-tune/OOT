/** Backend that serves a node type or a connection. */
export type Endpoint = "graphql" | "spotify";

export interface SchemaNodeType {
  label: string;
  attributes: string[];
  endpoints?: Endpoint[];
}

/** One direction of an edge type. */
export interface EdgeDirection {
  from: string;
  to: string;
  /** Field name of the connection in the response, for example `genres`. */
  connectionName: string;
  endpoint?: "graphQl" | "spotify";
}

export interface SchemaEdgeType {
  label: string;
  inbound: EdgeDirection;
  outbound: EdgeDirection;
}

export interface Schema {
  nodeTypes: SchemaNodeType[];
  edgeTypes: SchemaEdgeType[];
}
