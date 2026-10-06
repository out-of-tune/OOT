import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

/** MusicBrainz metadata and Spotify images for the nodes of the graph. */
export const metadata: Module<Record<string, never>, RootState> = { actions };

export default metadata;
