import type { ActionTree, Commit, Dispatch } from "vuex";
import { getAllLinks } from "@/lib/graph";
import type { GraphLink, LinkInput } from "@/types/graph";
import type { ActiveMode, Context, NodeRef, RootState } from "@/store/types";
import type { GraphChange, HistoryState } from "./index";

type Ctx = Context<HistoryState>;

/** ngraph link ids have the form `fromId👉 toId`. */
const linkId = (link: Pick<LinkInput, "fromId" | "toId">) =>
  `${link.fromId}👉 ${link.toId}`;

/** Splits the links of a change into links to remove and links that keep other edge types. */
function categorizeLinks(
  rootState: RootState,
  changedLinks: (LinkInput | GraphLink)[],
) {
  const changedIds = changedLinks.map(linkId);
  const links = getAllLinks(rootState)
    .filter((link) => changedIds.includes(link.id))
    .map((link) => {
      const removedTypes = changedLinks
        .filter((changed) => linkId(changed) === link.id)
        .flatMap((changed) => changed.linkTypes ?? []);
      return {
        ...link,
        linkTypes: link.linkTypes.filter(
          (type) => !removedTypes.includes(type),
        ),
      };
    });
  return {
    linksToRemove: links.filter((link) => link.linkTypes.length === 0),
    linksToUpdate: links.filter((link) => link.linkTypes.length !== 0),
  };
}

function remove(rootState: RootState, change: GraphChange, commit: Commit) {
  const { linksToRemove, linksToUpdate } = categorizeLinks(
    rootState,
    change.data.links,
  );
  change.data.nodes.forEach((node) => commit("REMOVE_NODE", node));
  linksToRemove.forEach((link) => commit("REMOVE_LINK", link));
  linksToUpdate.forEach((link) => commit("UPDATE_LINKTYPES", link));
}

function add(change: GraphChange, commit: Commit, dispatch: Dispatch) {
  // A "remove" change of selected nodes stores the links on the nodes themselves.
  const links =
    change.data.links.length === 0
      ? change.data.nodes
          .flatMap((node) => node.links ?? [])
          .filter((link) => link != null)
      : change.data.links;
  commit("ADD_TO_GRAPH", { nodes: change.data.nodes, links });
  dispatch("applyAllConfigurations");
}

export const actions = {
  undo({ state, commit, dispatch, rootState }: Ctx) {
    if (state.historyIndex < 0) return;
    const change = state.changes[state.historyIndex];
    if (change.type === "add") remove(rootState, change, commit);
    else if (change.type === "remove") add(change, commit, dispatch);
    commit("SET_HISTORY_INDEX", state.historyIndex - 1);
    dispatch("setSuccess", "Undone");
  },

  redo({ state, commit, dispatch, rootState }: Ctx) {
    if (state.historyIndex >= state.changes.length - 1) return;
    commit("SET_HISTORY_INDEX", state.historyIndex + 1);
    const change = state.changes[state.historyIndex];
    if (change.type === "add") add(change, commit, dispatch);
    else if (change.type === "remove") remove(rootState, change, commit);
    dispatch("setSuccess", "Redone");
  },

  /** Records a change and drops the changes that were undone before it. */
  addChange({ state, commit }: Ctx, change: GraphChange) {
    commit("SET_CHANGES", [
      ...state.changes.slice(0, state.historyIndex + 1),
      change,
    ]);
    commit("SET_HISTORY_INDEX", state.historyIndex + 1);
  },

  addToClickHistory(
    { rootState, commit }: Ctx,
    { node, action }: { node: NodeRef; action: ActiveMode },
  ) {
    const data = {
      node,
      timestamp: Date.now(),
      action,
      configuration: rootState.configurations,
    };
    commit("ADD_TO_CLICK_HISTORY", { node, data });
  },
} satisfies ActionTree<HistoryState, RootState>;

export default actions;
