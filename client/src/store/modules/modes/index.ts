import type { Module } from "vuex";
import type { ActiveMode, RootState } from "@/store/types";
import actions from "./actions";

/** The click modes in the order of the tool rail. The keys 1 to 4 choose them. */
export const ACTIVE_MODES: ActiveMode[] = [
  "expand",
  "collapse",
  "explore",
  "queue",
];

export const modes: Module<Record<string, never>, RootState> = { actions };

export default modes;
