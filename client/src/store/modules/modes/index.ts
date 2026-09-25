import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

export const modes: Module<Record<string, never>, RootState> = { actions };

export default modes;
