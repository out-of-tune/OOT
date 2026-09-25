import type { Plugin } from "vuex";

const CHANNEL_NAME = "out-of-tune-mutations";

/**
 * Vuex plugin that repeats the listed mutations in the other tabs of the app.
 * The Settings page opens in its own tab and changes the configuration of the graph tab this way.
 */
export function shareMutations<S>(
  types: string[],
  channelName = CHANNEL_NAME,
): Plugin<S> {
  return (store) => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(channelName);
    let applyingRemote = false;

    store.subscribe((mutation) => {
      if (applyingRemote || !types.includes(mutation.type)) return;
      // A JSON copy drops the Vue proxies, which cannot be cloned into a message.
      const payload =
        mutation.payload === undefined
          ? undefined
          : JSON.parse(JSON.stringify(mutation.payload));
      channel.postMessage({ type: mutation.type, payload });
    });

    channel.onmessage = (
      event: MessageEvent<{ type: string; payload: unknown }>,
    ) => {
      if (!types.includes(event.data.type)) return;
      applyingRemote = true;
      try {
        store.commit(event.data.type, event.data.payload);
      } finally {
        applyingRemote = false;
      }
    };
  };
}
