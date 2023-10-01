import ShareService from "@/store/services/ShareService";
import { handleGraphqlTokenError } from "@/assets/js/TokenHelper";
import pako from "pako";
import { getGraphObject } from "@/assets/js/graphHelper";

const changeShareModalState = ({ state, commit }) => {
  const modalState = !state.shareModalOpen;
  commit("SET_SHARE_MODAL_STATE", modalState);
};

const generateShareLink = async ({ commit, rootState, dispatch }, type) => {
  const object =
    type === "graph" ? getGraphObject(rootState) : rootState.configurations;
  const compressed = pako.deflate(JSON.stringify(object), { to: "string" }).toString();
  const response = await handleGraphqlTokenError(
    ShareService.getShareLink.bind(ShareService),
    [type, compressed],
    dispatch,
    rootState,
  );
  console.log(response);
  commit(
    "SET_SHARE_LINK",
    `${import.meta.env.VITE_PROXY_URI}/#/graph?uri=${response.uri}&type=${type}`,
  );
};

const importSharedObject = async ({ dispatch, rootState }, { uri, type }) => {
  const binaryString = await handleGraphqlTokenError(
    ShareService.getSharedObject.bind(ShareService),
    [uri],
    dispatch,
    rootState,
  );

  const jsonString = pako.inflate(binaryString, { to: "string" });
  console.log(jsonString);
  if (type === "graph") {
    dispatch("importGraph", jsonString);
  } else {
    dispatch("importConfiguration", jsonString);
  }
};

export const actions = {
  changeShareModalState,
  generateShareLink,
  importSharedObject,
};

export default actions;
