import { createStore } from "vuex";
import { shareMutations } from "../sharedMutations";

const createCounterStore = (channel: string) =>
  createStore({
    state: () => ({ count: 0, local: 0 }),
    mutations: {
      SET_COUNT: (state: { count: number }, value: number) => {
        state.count = value;
      },
      SET_LOCAL: (state: { local: number }, value: number) => {
        state.local = value;
      },
    },
    plugins: [shareMutations(["SET_COUNT"], channel)],
  });

const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("shareMutations", () => {
  it("repeats the listed mutations in the other store", async () => {
    const first = createCounterStore("test-share");
    const second = createCounterStore("test-share");
    first.commit("SET_COUNT", 5);
    first.commit("SET_LOCAL", 7);
    await flush();
    expect(second.state.count).toBe(5);
    expect(second.state.local).toBe(0);
  });

  it("does not echo a received mutation back", async () => {
    const first = createCounterStore("test-echo");
    const second = createCounterStore("test-echo");
    const spy = vi.fn();
    first.subscribe(spy);
    first.commit("SET_COUNT", 1);
    await flush();
    expect(second.state.count).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
