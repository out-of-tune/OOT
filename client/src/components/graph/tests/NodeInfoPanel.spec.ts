// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import type { Store } from "vuex";
import type { RootState } from "@/store/types";

vi.mock("@/services/SpotifyService");

/** The real store with a genre and two of its artists in the graph, and the genre in the panel. */
async function setup() {
  vi.resetModules();
  vi.stubGlobal("BroadcastChannel", undefined);
  const { store, key } = await import("@/store");
  const { default: NodeInfoPanel } = await import("../NodeInfoPanel.vue");
  const graph = store.state.mainGraph.Graph;
  graph.addNode("genre/rock", { label: "genre", name: "rock" });
  graph.addNode("artist/b", { label: "artist", name: "Band B" });
  graph.addNode("artist/a", { label: "artist", name: "Band A" });
  graph.addLink("artist/a", "genre/rock", { linkTypes: ["Artist_to_Genre"] });
  graph.addLink("artist/b", "genre/rock", { linkTypes: ["Artist_to_Genre"] });
  store.commit("SET_CURRENTNODE", graph.getNode("genre/rock"));
  const dispatch = vi
    .spyOn(store, "dispatch")
    .mockResolvedValue({ nodes: [], links: [] });
  const panel = mount(NodeInfoPanel, {
    global: { plugins: [[store, key] as [Store<RootState>, symbol]] },
  });
  return { store, panel, dispatch, graph };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the relations of the node info", () => {
  it("lists the neighbors in the graph for each relation of the node type", async () => {
    const { panel } = await setup();
    const relations = panel.text();
    expect(relations).toContain("Artists (2 in the graph)");
    expect(relations).toContain("Subgenres (0 in the graph)");
    const names = panel
      .findAll("li button[title^='Show ']")
      .map((button) => button.text());
    expect(names).toEqual(["Band A", "Band B"]);
  });

  it("only focuses a neighbor that is clicked", async () => {
    const { panel, dispatch, graph } = await setup();
    await panel
      .get("button[title='Show Band A in the graph']")
      .trigger("click");
    expect(dispatch).toHaveBeenCalledWith(
      "focusNode",
      graph.getNode("artist/a"),
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      "expandAction",
      expect.anything(),
    );
  });

  it("loads all artists of a genre", async () => {
    const { panel, dispatch, graph } = await setup();
    const load = panel
      .findAll("button")
      .find((button) => button.text() === "Load all artists");
    await load?.trigger("click");
    await flushPromises();
    expect(dispatch).toHaveBeenCalledWith("expandRelation", {
      node: graph.getNode("genre/rock"),
      edge: "Artist_to_Genre",
    });
  });
});
