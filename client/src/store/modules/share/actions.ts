import type { ActionTree } from "vuex";
import { getGraphObject } from "@/lib/graph";
import { decodeShared, encodeShared } from "@/lib/shareCodec";
import { handleGraphqlTokenError } from "@/lib/token";
import ShareService, {
  type ShareResponse,
  type ShareType,
} from "@/services/ShareService";
import type { Context, RootState } from "@/store/types";
import type { ShareState } from "./index";

type Ctx = Context<ShareState>;

export const actions = {
  changeShareModalState({ state, commit }: Ctx, open?: boolean) {
    commit("SET_SHARE_MODAL_STATE", open ?? !state.shareModalOpen);
  },

  async generateShareLink(
    { commit, rootState, dispatch }: Ctx,
    type: ShareType,
  ) {
    try {
      const object =
        type === "graph" ? getGraphObject(rootState) : rootState.configurations;
      const response: ShareResponse = await handleGraphqlTokenError(
        ShareService.getShareLink.bind(ShareService),
        [type, encodeShared(object)],
        dispatch,
        rootState,
      );
      commit(
        "SET_SHARE_LINK",
        `${import.meta.env.VITE_PROXY_URI}/#/graph?uri=${encodeURIComponent(response.uri)}&type=${type}`,
      );
    } catch (error) {
      dispatch("setError", error);
    }
  },

  async importSharedObject(
    { dispatch, rootState }: Ctx,
    { uri, type }: { uri: string; type: string },
  ) {
    try {
      const payload: string = await handleGraphqlTokenError(
        ShareService.getSharedObject.bind(ShareService),
        [uri],
        dispatch,
        rootState,
      );
      const jsonString = decodeShared(payload);
      dispatch(
        type === "graph" ? "importGraph" : "importConfiguration",
        jsonString,
      );
    } catch (error) {
      dispatch("setError", new Error(`The shared ${type} could not be loaded`));
      console.error(error);
    }
  },
} satisfies ActionTree<ShareState, RootState>;

export default actions;
