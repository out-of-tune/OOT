import { getAllLinks } from "@/assets/js/graphHelper";

function categorizeLinks(rootState, newLinks) {
  const newLinkIds = newLinks.map((link) => link.fromId + "👉 " + link.toId);

  const allChangedLinks = getAllLinks(rootState).filter((link) =>
    newLinkIds.includes(link.id),
  );
  const links = allChangedLinks.map((link) => {
    const newLinkTypes = newLinks
      .filter((newLink) => newLink.fromId + "👉 " + newLink.toId === link.id)
      .flatMap((newLink) => newLink.linkTypes);
    const linkTypes = link.linkTypes.filter(
      (linkType) => !newLinkTypes.includes(linkType),
    );
    return { ...link, linkTypes };
  });

  const linksToRemove = links.filter((link) => link.linkTypes.length == 0);
  const linksToUpdate = links.filter((link) => link.linkTypes.length != 0);

  return { linksToRemove, linksToUpdate };
}

function remove(rootState, currentChange, commit) {
  const linkCategories = categorizeLinks(rootState, currentChange.data.links);
  currentChange.data.nodes.forEach((node) => commit("REMOVE_NODE", node));
  linkCategories.linksToRemove.forEach((link) => commit("REMOVE_LINK", link));
  linkCategories.linksToUpdate.forEach((link) =>
    commit("UPDATE_LINKTYPES", link),
  );
}

function add(currentChange, commit, dispatch) {
  const newLinks =
    currentChange.data.links.length == 0
      ? currentChange.data.nodes
          .flatMap((node) => node.links)
          .filter((link) => link != null)
      : currentChange.data.links;
  commit("ADD_TO_GRAPH", {
    nodes: currentChange.data.nodes,
    links: newLinks,
  });
  dispatch("applyAllConfigurations");
}

const undo = ({ state, commit, dispatch, rootState }) => {
  if (state.historyIndex >= 0) {
    const currentChange = state.changes[state.historyIndex];
    if (currentChange.type === "add") {
      remove(rootState, currentChange, commit);
    } else if (currentChange.type === "remove") {
      add(currentChange, commit, dispatch);
    }
    commit("SET_HISTORY_INDEX", state.historyIndex - 1);
    dispatch("setSuccess", "undo successfull");
  }
};

const redo = ({ state, commit, dispatch, rootState }) => {
  if (state.historyIndex < state.changes.length - 1) {
    commit("SET_HISTORY_INDEX", state.historyIndex + 1);
    const currentChange = state.changes[state.historyIndex];
    if (currentChange.type === "add") {
      add(currentChange, commit, dispatch);
    } else if (currentChange.type === "remove") {
      remove(rootState, currentChange, commit);
    }
    dispatch("setSuccess", "reverted");
  }
};

const addChange = ({ state, commit }, change) => {
  const newChanges = [
    ...state.changes.slice(0, state.historyIndex + 1),
    change,
  ];
  commit("SET_CHANGES", newChanges);
  commit("SET_HISTORY_INDEX", state.historyIndex + 1);
};

const addToClickHistory = ({ rootState, commit }, { node, action }) => {
  const timestamp = new Date().getTime();
  const data = {
    node: node,
    timestamp,
    action,
    configuration: rootState.configurations,
  };
  commit("ADD_TO_CLICK_HISTORY", { node, data });
};

export const actions = {
  undo,
  redo,
  addChange,
  addToClickHistory,
};

export default actions;
