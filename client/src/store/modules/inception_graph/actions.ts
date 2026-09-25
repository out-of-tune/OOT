import type { ActionTree } from "vuex";
import { handleGraphqlTokenError } from "@/lib/token";
import GraphService from "@/services/GraphService";
import type { GraphItems } from "@/types/graph";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

interface GenreResult {
  id: string;
  name: string;
  subgenres: { id: string; name: string }[];
}

const INCEPTION_QUERY = `{ genre { id, name, subgenres { id, name } } }`;

function generateNodeAndLinks(queryResult: GenreResult[]): GraphItems {
  const nodes = queryResult.flatMap((element) => [
    { id: element.id, data: { name: element.name, label: "genre" } },
    ...element.subgenres.map((subgenre) => ({
      id: subgenre.id,
      data: { name: subgenre.name, label: "genre" },
    })),
  ]);
  const links = queryResult.flatMap((element) =>
    element.subgenres.map((subgenre) => ({
      fromId: element.id,
      toId: subgenre.id,
      linkName: "Genre_to_Genre",
    })),
  );
  return { nodes, links };
}

export const actions = {
  /** Loads every genre and its subgenres into the graph. */
  async generateInceptionGraph({ commit, dispatch, rootState }: Ctx) {
    const queryResult = await handleGraphqlTokenError(
      (query: string) => GraphService.getNodes<{ genre: GenreResult[] }>(query),
      [INCEPTION_QUERY],
      dispatch,
      rootState,
    );
    commit("ADD_TO_GRAPH", generateNodeAndLinks(queryResult.genre));
    dispatch("applyAllConfigurations");
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
