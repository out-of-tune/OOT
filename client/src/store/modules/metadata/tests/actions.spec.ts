import createGraph from "ngraph.graph";
import GraphService from "@/services/GraphService";
import SpotifyService from "@/services/SpotifyService";
import mutations from "@/store/mutations";
import { FIRST_RETRY, GIVE_UP, MAX_RETRY, actions } from "../actions";

vi.mock("@/services/GraphService");
vi.mock("@/services/SpotifyService");

const answer = (sid: string, status = "FOUND", extra = {}) => ({
  sid,
  status,
  mbid: status === "FOUND" ? `mb-${sid}` : null,
  url: null,
  rating: status === "FOUND" ? 4 : null,
  ratingVotes: status === "FOUND" ? 5 : null,
  genres: [],
  tags: [],
  type: null,
  secondaryTypes: [],
  country: null,
  area: null,
  beginYear: null,
  endYear: null,
  ...extra,
});

/** A context whose commits run the real root mutations on a real graph. */
function setup({ covers = false } = {}) {
  const graph = createGraph();
  const rootState = {
    mainGraph: { Graph: graph, currentNode: { id: 0, data: {} } },
    appearance: { covers },
    configurations: {
      appearanceConfiguration: { nodeConfiguration: { color: [], size: [] } },
    },
    spotify: { accessToken: "token" },
    authentication: { loginState: false },
  };
  const commit = vi.fn((type: string, payload: unknown) =>
    (mutations as Record<string, (state: unknown, payload: unknown) => void>)[
      type
    ](rootState, payload),
  );
  const dispatch = vi.fn();
  const ctx = { commit, dispatch, rootState } as never;
  return { graph, rootState, commit, dispatch, ctx };
}

/** Answers each metadata query with the answers of its sids. */
function answerWith(byStatus: (sid: string) => string) {
  vi.mocked(GraphService.getNodes).mockImplementation((async (
    query: string,
    variables: { sids: string[] },
  ) => {
    const field = query.includes("artistMetadata")
      ? "artistMetadata"
      : "albumMetadata";
    return {
      [field]: variables.sids.map((sid) => answer(sid, byStatus(sid))),
    };
  }) as never);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("loadMetadata", () => {
  it("merges answers into the node data in place and adds the Spotify release year", async () => {
    const { graph, ctx } = setup();
    const artist = graph.addNode("artist/a", { label: "artist", sid: "a" });
    const album = graph.addNode("album/b", {
      label: "album",
      sid: "b",
      release_date: "1998-04-20",
    });
    const data = artist.data;
    answerWith(() => "FOUND");
    await actions.loadMetadata(ctx);
    expect(artist.data).toBe(data);
    expect(artist.data).toMatchObject({ mbStatus: "FOUND", mbRating: 4 });
    expect(album.data).toMatchObject({ mbStatus: "FOUND", releaseYear: 1998 });
  });

  it("asks only for nodes without an answer", async () => {
    const { graph, ctx } = setup();
    graph.addNode("artist/a", { label: "artist", sid: "a", mbStatus: "FOUND" });
    graph.addNode("artist/b", {
      label: "artist",
      sid: "b",
      mbStatus: "PENDING",
    });
    graph.addNode("genre/g", { label: "genre" });
    answerWith(() => "FOUND");
    await actions.loadMetadata(ctx);
    expect(GraphService.getNodes).toHaveBeenCalledTimes(1);
    expect(vi.mocked(GraphService.getNodes).mock.calls[0][1]).toEqual({
      sids: ["b"],
      urgent: false,
    });
  });

  it("marks pending nodes and asks again with growing waits until it gives up", async () => {
    const { graph, ctx, dispatch } = setup();
    const artist = graph.addNode("artist/a", { label: "artist", sid: "a" });
    answerWith(() => "PENDING");
    actions.scheduleMetadata(ctx);
    await actions.loadMetadata(ctx);
    expect(artist.data.mbStatus).toBe("PENDING");
    dispatch.mockClear();
    vi.advanceTimersByTime(FIRST_RETRY);
    expect(dispatch).toHaveBeenCalledWith("loadMetadata");
    await actions.loadMetadata(ctx);
    dispatch.mockClear();
    vi.advanceTimersByTime(FIRST_RETRY * 2 - 1);
    expect(dispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(dispatch).toHaveBeenCalledWith("loadMetadata");
    // Much later the wait is capped, and after GIVE_UP the loads stop.
    vi.setSystemTime(Date.now() + GIVE_UP);
    dispatch.mockClear();
    await actions.loadMetadata(ctx);
    vi.advanceTimersByTime(MAX_RETRY);
    expect(dispatch).not.toHaveBeenCalledWith("loadMetadata");
  });

  it("recolors only when a rule reads a metadata attribute", async () => {
    const { graph, ctx, dispatch, rootState } = setup();
    graph.addNode("artist/a", { label: "artist", sid: "a" });
    answerWith(() => "FOUND");
    await actions.loadMetadata(ctx);
    expect(dispatch).not.toHaveBeenCalledWith("applyNodeColorConfiguration");
    graph.addNode("artist/b", { label: "artist", sid: "b" });
    rootState.configurations.appearanceConfiguration.nodeConfiguration.size = [
      {
        nodeLabel: "artist",
        rules: [
          { searchObject: { attributes: [{ attributeSearch: "mbRating" }] } },
        ],
      },
    ] as never;
    await actions.loadMetadata(ctx);
    expect(dispatch).toHaveBeenCalledWith("applyNodeSizeConfiguration");
  });

  it("loads missing artist images only while covers show, a batch at a time", async () => {
    answerWith(() => "FOUND");
    vi.mocked(SpotifyService.getArtistsById).mockImplementation((async (
      _token: string,
      sids: string[],
    ) => ({
      artists: sids.map((sid) => ({
        id: sid,
        images: [{ url: `${sid}.jpg` }],
      })),
    })) as never);
    const off = setup({ covers: false });
    off.graph.addNode("artist/a", { label: "artist", sid: "a", images: [] });
    await actions.loadMetadata(off.ctx);
    expect(SpotifyService.getArtistsById).not.toHaveBeenCalled();

    const on = setup({ covers: true });
    for (let index = 0; index < 45; index++)
      on.graph.addNode(`artist/${index}`, {
        label: "artist",
        sid: String(index),
        images: [],
      });
    await actions.loadMetadata(on.ctx);
    expect(
      vi.mocked(SpotifyService.getArtistsById).mock.calls[0][1],
    ).toHaveLength(40);
    expect(on.graph.getNode("artist/0")?.data.images).toEqual([
      { url: "0.jpg" },
    ]);
    expect(on.dispatch).toHaveBeenCalledWith("applyNodeImages");
  });
});

describe("loadNodeMetadata", () => {
  it("asks for one node ahead of the queue and updates the info panel", async () => {
    const { graph, ctx, rootState } = setup();
    const album = graph.addNode("album/b", { label: "album", sid: "b" });
    rootState.mainGraph.currentNode = {
      id: "album/b",
      data: album.data,
    } as never;
    answerWith(() => "FOUND");
    await actions.loadNodeMetadata(ctx, album);
    expect(vi.mocked(GraphService.getNodes).mock.calls[0][1]).toEqual({
      sids: ["b"],
      urgent: true,
    });
    expect(rootState.mainGraph.currentNode.data).toMatchObject({ mbRating: 4 });
  });

  it("does not ask for a node with an answer or of another type", async () => {
    const { graph, ctx } = setup();
    const settled = graph.addNode("album/b", {
      label: "album",
      sid: "b",
      mbStatus: "NOT_FOUND",
    });
    const genre = graph.addNode("genre/g", { label: "genre", sid: "g" });
    await actions.loadNodeMetadata(ctx, settled);
    await actions.loadNodeMetadata(ctx, genre);
    expect(GraphService.getNodes).not.toHaveBeenCalled();
  });
});

it("goes on with the other kind and retries when a query fails", async () => {
  const { graph, ctx, dispatch } = setup();
  graph.addNode("artist/a", { label: "artist", sid: "a" });
  const album = graph.addNode("album/b", { label: "album", sid: "b" });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.mocked(GraphService.getNodes).mockImplementation((async (
    query: string,
  ) => {
    if (query.includes("artistMetadata")) throw new Error("network");
    return { albumMetadata: [answer("b")] };
  }) as never);
  actions.scheduleMetadata(ctx);
  await actions.loadMetadata(ctx);
  expect(album.data.mbStatus).toBe("FOUND");
  dispatch.mockClear();
  vi.advanceTimersByTime(FIRST_RETRY);
  expect(dispatch).toHaveBeenCalledWith("loadMetadata");
});

it("a newer load replaces an older one that still waits for its answer", async () => {
  const { graph, ctx } = setup();
  const artist = graph.addNode("artist/a", { label: "artist", sid: "a" });
  let answerOld: (value: unknown) => void = () => undefined;
  vi.mocked(GraphService.getNodes)
    .mockImplementationOnce(
      () => new Promise((resolve) => (answerOld = resolve)) as never,
    )
    .mockResolvedValueOnce({
      artistMetadata: [answer("a", "FOUND", { rating: 3 })],
    } as never);
  const older = actions.loadMetadata(ctx);
  await actions.loadMetadata(ctx);
  answerOld({ artistMetadata: [answer("a", "FOUND", { rating: 1 })] });
  await older;
  expect(artist.data.mbRating).toBe(3);
});

it("tries artist images again after a failed request", async () => {
  answerWith(() => "FOUND");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.mocked(SpotifyService.getArtistsById).mockRejectedValueOnce(
    new Error("429"),
  );
  const { graph, ctx, dispatch } = setup({ covers: true });
  const artist = graph.addNode("artist/a", {
    label: "artist",
    sid: "a",
    images: [],
  });
  actions.scheduleMetadata(ctx);
  await actions.loadMetadata(ctx);
  expect(artist.data.imagesLoaded).toBeUndefined();
  dispatch.mockClear();
  vi.advanceTimersByTime(FIRST_RETRY);
  expect(dispatch).toHaveBeenCalledWith("loadMetadata");
});
