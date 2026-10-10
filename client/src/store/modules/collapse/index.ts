import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

export const collapse: Module<Record<string, never>, RootState> = { actions };

export default collapse;
