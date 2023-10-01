import { mutations } from "../mutations";

const { SET_CURRENT_SONG, SET_QUEUE_INDEX, ADD_TO_QUEUE, INSERT_IN_QUEUE } =
  mutations;

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
