/** Backend that serves a node type or a connection. */
export type Endpoint = "graphql" | "spotify";

export interface SchemaNodeType {
  label: string;
  /** Attributes that the backends return. Queries ask for exactly these. */
  attributes: string[];
  /** Attributes that the client adds later, for example MusicBrainz metadata. Rules and the search can use them. */
  metadataAttributes?: string[];
  endpoints?: Endpoint[];
}

/** Every attribute of a node type that rules and the search can use. */
export const nodeTypeAttributes = (nodeType: SchemaNodeType | undefined) =>
  nodeType
    ? [...nodeType.attributes, ...(nodeType.metadataAttributes ?? [])]
    : [];

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
