import type { ActionTree } from "vuex";
import type { Context, RootState } from "@/store/types";
import type { SnackbarState, SnackColor } from "./index";

type Ctx = Context<SnackbarState>;

/** Text of an error. Accepts an `Error`, a plain `{ message }` object or a string. */
const errorText = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error)
    return String(error.message);
  return "Something went wrong";
};

export const actions = {
  setError({ dispatch }: Ctx, error: unknown) {
    dispatch("setSnackColor", "error");
    dispatch("setMessage", errorText(error));
  },
  setInfo({ dispatch }: Ctx, message: string) {
    dispatch("setSnackColor", "info");
    dispatch("setMessage", message);
  },
  setSuccess({ dispatch }: Ctx, message: string) {
    dispatch("setSnackColor", "success");
    dispatch("setMessage", message);
  },
  setMessage({ commit }: Ctx, message: string) {
    commit("SET_MESSAGE", message);
  },
  setSnackColor({ commit }: Ctx, color: SnackColor) {
    commit("SET_SNACK_COLOR", color);
  },
} satisfies ActionTree<SnackbarState, RootState>;

export default actions;
