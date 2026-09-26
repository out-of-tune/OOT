import { mutations } from "../mutations";

const {
  SET_CURRENT_SONG,
  SET_QUEUE_INDEX,
  ADD_TO_QUEUE,
  INSERT_IN_QUEUE,
  REMOVE_FROM_QUEUE,
} = mutations;

describe("SET_CURRENT_SONG", () => {
  let state;
  beforeEach(() => {
    state = {};
  });
  it("sets current song", () => {
    const song = { el: "A dummy song" };
    SET_CURRENT_SONG(state, song);
    expect(state.currentSong).toBe(song);
  });
});
describe("SET_QUEUE_INDEX", () => {
  let state;
  beforeEach(() => {
    state = {};
  });
  it("sets current song", () => {
    const index = 2;
    SET_QUEUE_INDEX(state, index);
    expect(state.queueIndex).toBe(2);
  });
});
describe("ADD_TO_QUEUE", () => {
  let state;
  beforeEach(() => {
    state = {
      queue: [],
    };
  });
  it("sets current song", () => {
    const song = { el: "A dummy song" };
    ADD_TO_QUEUE(state, song);
    expect(state.queue).toEqual([song]);
  });
});
describe("INSERT_IN_QUEUE", () => {
  let state;
  beforeEach(() => {
    state = {
      queue: [
        { el: "One dummy element ha ha ha" },
        { el: "Two dummy element ha ha ha" },
      ],
    };
  });
  it("sets current song", () => {
    const song = { el: "A dummy song" };
    const position = 1;
    INSERT_IN_QUEUE(state, { song, position });
    expect(state.queue).toEqual([
      { el: "One dummy element ha ha ha" },
      { el: "A dummy song" },
      { el: "Two dummy element ha ha ha" },
    ]);
  });
});

describe("REMOVE_FROM_QUEUE", () => {
  const song = (name: string) => ({ name, images: [], preview_url: name });
  const queueOf = (...names: string[]) => names.map(song);

  it("keeps the index on the playing song", () => {
    const queue = queueOf("a", "b", "c");
    const state = { queue, queueIndex: 2, currentSong: queue[2] };
    REMOVE_FROM_QUEUE(state as never, 0);
    expect(state.queueIndex).toBe(1);
    expect(state.currentSong.name).toBe("c");
  });

  it("plays the next song when the playing song is removed", () => {
    const queue = queueOf("a", "b", "c");
    const state = { queue, queueIndex: 1, currentSong: queue[1] };
    REMOVE_FROM_QUEUE(state as never, 1);
    expect(state.queue.map((entry) => entry.name)).toEqual(["a", "c"]);
    expect(state.queueIndex).toBe(1);
    expect(state.currentSong.name).toBe("c");
  });

  it("stops when the removed playing song was the last one", () => {
    const queue = queueOf("a", "b");
    const state = { queue, queueIndex: 1, currentSong: queue[1] };
    REMOVE_FROM_QUEUE(state as never, 1);
    expect(state.queueIndex).toBe(0);
    expect(state.currentSong.preview_url).toBe("");
  });

  it("does not start a song that was not playing", () => {
    const queue = queueOf("a", "b");
    const idle = song("");
    const state = { queue, queueIndex: 0, currentSong: idle };
    REMOVE_FROM_QUEUE(state as never, 0);
    expect(state.currentSong).toBe(idle);
  });
});
