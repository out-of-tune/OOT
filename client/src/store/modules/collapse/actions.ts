import type { ActionTree } from "vuex";
import { getConnectedNodesAndLinks, type NodeWithLink } from "@/lib/graph";
import type { GraphNode } from "@/types/graph";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

/** Edge types that collapse removes for the type of this node. */
function getEdgeConfigurationForNode(
  rootState: RootState,
  node: GraphNode,
): string[] {
  return rootState.configurations.actionConfiguration.collapse
    .filter((configuration) => configuration.nodeType === node.data.label)
    .flatMap((configuration) => configuration.edges);
}

const remainingTypes = ({ link }: NodeWithLink, edgeTypesToRemove: string[]) =>
  link.linkTypes.filter((linkType) => !edgeTypesToRemove.includes(linkType));

function getConnectedNodesAndLinksToChange(
  rootState: RootState,
  node: GraphNode,
) {
  const edgeTypesToRemove = getEdgeConfigurationForNode(rootState, node);
  const nodesWithLink = getConnectedNodesAndLinks({
    graph: rootState.mainGraph.Graph,
    node,
  });

  const removed = nodesWithLink.filter(
    (entry) => remainingTypes(entry, edgeTypesToRemove).length === 0,
  );
  const kept = nodesWithLink.filter(
    (entry) => remainingTypes(entry, edgeTypesToRemove).length !== 0,
  );

  return {
    edgeTypesToRemove,
    linksToRemove: removed.map((entry) => entry.link),
    linksToUpdate: kept.map((entry) => ({
      ...entry.link,
      linkTypes: remainingTypes(entry, edgeTypesToRemove),
    })),
    // A neighbor goes away too when the removed link was its only link.
    nodesToRemove: removed
      .filter(
        (entry) =>
          (rootState.mainGraph.Graph.getLinks(entry.node.id)?.length ?? 0) ===
          1,
      )
      .map((entry) => entry.node),
  };
}

export const actions = {
  /** Removes the configured edges of a node, and the neighbors that have no other link. */
  collapseAction({ commit, rootState, dispatch }: Ctx, node: GraphNode) {
    const { linksToUpdate, linksToRemove, nodesToRemove } =
      getConnectedNodesAndLinksToChange(rootState, node);
    linksToUpdate.forEach((link) => commit("UPDATE_LINKTYPES", link));
    linksToRemove.forEach((link) => commit("REMOVE_LINK", link));
    nodesToRemove.forEach((removedNode) => commit("REMOVE_NODE", removedNode));
    dispatch("addChange", {
      data: {
        nodes: nodesToRemove,
        links: [...linksToRemove, ...linksToUpdate],
      },
      type: "remove",
    });
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
