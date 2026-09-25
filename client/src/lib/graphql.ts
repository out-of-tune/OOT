import GraphService from "@/services/GraphService";
import {
  handleGraphqlTokenError,
  type TokenDispatch,
  type TokenState,
} from "@/lib/token";
import type { NodeInput } from "@/types/graph";
import type { Schema } from "@/types/schema";
import { gqlString } from "./graphqlString";

/** Merges several query fields into one query document with aliases `query0`, `query1`, ... */
export function mergeGraphQlQueries(queries: string[]): string {
  if (queries.length <= 1) return `{ ${queries[0] ?? ""} }`;
  return `{ ${queries.map((query, index) => `query${index}: ${query}`).join(", ")} }`;
}

/**
 * Looks up nodes by Spotify id in the database.
 * The result has one entry per sid, in the same order. An entry is `null` if the database has no match.
 */
export async function checkNodesExistence(
  nodeLabel: string,
  sids: string[],
  schema: Schema,
  dispatch: TokenDispatch,
  rootState: TokenState,
): Promise<(NodeInput | null)[] | null> {
  const nodeType = schema.nodeTypes.find((type) => type.label === nodeLabel);
  if (!nodeType || sids.length === 0) return null;
  const attributes = nodeType.attributes.join(",");
  const queries = sids.map(
    (sid) => `${nodeLabel}(sid: ${gqlString(sid)}){ ${attributes} }`,
  );
  const response = await handleGraphqlTokenError(
    GraphService.getNodes.bind(GraphService),
    [mergeGraphQlQueries(queries)],
    dispatch,
    rootState,
  );
  const nodes = Object.values(
    response as Record<string, Record<string, unknown>[]>,
  ).map((results) => {
    const first = results[0];
    if (!first) return null;
    const { id, ...data } = first;
    return { id: String(id), data: { ...data, label: nodeLabel } };
  });
  return nodes.length > 0 ? nodes : null;
}
