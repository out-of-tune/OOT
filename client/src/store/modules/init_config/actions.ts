import type { ActionTree } from "vuex";
import type {
  ColorRule,
  Configuration,
  EdgeColorRule,
  NodeRuleset,
  SizeRule,
  TooltipRule,
} from "@/types/configuration";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

const defaultRule = (nodeLabel: string) => ({
  searchObject: {
    valid: true,
    errors: [],
    nodeType: nodeLabel,
    attributes: [],
  },
  searchString: nodeLabel,
});

const NODE_COLORS: Record<string, string> = {
  genre: "da6a1dff",
  artist: "1dcddaff",
  album: "43df33ff",
  song: "df339cff",
};

const EDGE_COLORS: EdgeColorRule[] = [
  { edgeLabel: "Genre_to_Genre", color: "1dcdda77" },
  { edgeLabel: "Artist_to_Genre", color: "fa8a3d77" },
  { edgeLabel: "Album_to_Artist", color: "43Df3377" },
  { edgeLabel: "Song_to_Album", color: "DF339C77" },
];

const ACTION_RULES = [
  { nodeType: "artist", edges: ["Artist_to_Genre", "Album_to_Artist"] },
  { nodeType: "genre", edges: ["Genre_to_Genre", "Artist_to_Genre"] },
  { nodeType: "album", edges: ["Album_to_Artist", "Song_to_Album"] },
  { nodeType: "song", edges: ["Song_to_Album"] },
];

/** The configuration of a new user. */
export function createDefaultConfiguration(
  nodeLabels: string[],
): Configuration {
  const tooltip: TooltipRule[] = ["artist", "genre", "album", "song"].map(
    (nodeLabel) => ({
      nodeLabel,
      attribute: "name",
    }),
  );
  const color: NodeRuleset<ColorRule>[] = Object.entries(NODE_COLORS).map(
    ([nodeLabel, value]) => ({
      nodeLabel,
      rules: [{ ...defaultRule(nodeLabel), color: value }],
    }),
  );
  const size: NodeRuleset<SizeRule>[] = nodeLabels.map((nodeLabel) => ({
    nodeLabel,
    rules: [{ ...defaultRule(nodeLabel), sizeType: "compare", size: 20 }],
  }));
  return {
    actionConfiguration: {
      expand: ACTION_RULES.map((rule) => ({ ...rule, edges: [...rule.edges] })),
      collapse: ACTION_RULES.map((rule) => ({
        ...rule,
        edges: [...rule.edges],
      })),
    },
    appearanceConfiguration: {
      nodeConfiguration: { color, size, tooltip },
      edgeConfiguration: {
        color: EDGE_COLORS.map((rule) => ({ ...rule })),
        size: [],
      },
    },
  };
}

export const actions = {
  initConfiguration({ commit, rootState }: Ctx) {
    const nodeLabels = rootState.schema.nodeTypes.map(
      (nodeType) => nodeType.label,
    );
    commit("SET_CONFIGURATION", createDefaultConfiguration(nodeLabels));
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
