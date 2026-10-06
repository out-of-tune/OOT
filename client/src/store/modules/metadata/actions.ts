import type { ActionTree, Dispatch } from "vuex";
import { chunk } from "lodash-es";
import { getAllNodes } from "@/lib/graph";
import { handleGraphqlTokenError, handleTokenError } from "@/lib/token";
import {
  METADATA_ATTRIBUTES,
  METADATA_FIELDS,
  toNodeData,
  metadataSettled,
  releaseYear,
  type MetadataKind,
  type MusicMetadata,
} from "@/lib/metadata";
import GraphService from "@/services/GraphService";
import SpotifyService from "@/services/SpotifyService";
import type { NodeRule } from "@/types/configuration";
import type { GraphNode } from "@/types/graph";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

/** Ids in one metadata query. The API takes up to 200. */
const QUERY_SIZE = 200;
/** Wait after the graph changed before metadata loads, so one load covers a whole expand. */
const LOAD_DELAY = 400;
/**
 * The server reads MusicBrainz at one request per second for all users, so a big graph
 * takes minutes. Pending metadata is asked for again after FIRST_RETRY, then after twice the
 * wait each time up to MAX_RETRY, and not after GIVE_UP. A change of the graph starts again.
 */
export const FIRST_RETRY = 3000;
export const MAX_RETRY = 30_000;
export const GIVE_UP = 10 * 60_000;
/** Artists whose Spotify images load in one pass. Spotify answers one artist per request. */
const IMAGE_BATCH = 40;

let loadTimer: ReturnType<typeof setTimeout> | undefined;
/** Number of retries since the graph last changed. */
let retry = 0;
/** Time of the first load after the graph last changed. */
let loadStart = 0;
/** Goes up on each load. A load that sees another number stops. */
let loadRun = 0;

const KINDS: MetadataKind[] = ["artist", "album"];

/** Nodes of the kind whose metadata has no answer yet. */
const unsettled = (rootState: RootState, kind: MetadataKind) =>
  getAllNodes(rootState).filter(
    (node) =>
      node.data.label === kind && node.data.sid && !metadataSettled(node.data),
  );

async function queryMetadata(
  dispatch: Dispatch,
  rootState: RootState,
  kind: MetadataKind,
  sids: string[],
  urgent = false,
) {
  const field = `${kind}Metadata`;
  const response = (await handleGraphqlTokenError(
    GraphService.getNodes.bind(GraphService),
    [
      `query($sids: [ID!]!, $urgent: Boolean) { ${field}(sids: $sids, urgent: $urgent) { ${METADATA_FIELDS} } }`,
      { sids, urgent },
    ],
    dispatch,
    rootState,
  )) as Record<string, MusicMetadata[]> | undefined;
  return response?.[field] ?? [];
}

/** True when a color or size rule reads an attribute that metadata sets. Tooltips read the data when they show. */
function rulesUseMetadata(rootState: RootState) {
  const keys = new Set(Object.values(METADATA_ATTRIBUTES).flat());
  const { nodeConfiguration } =
    rootState.configurations.appearanceConfiguration;
  const rules: NodeRule[] = [
    ...nodeConfiguration.color.flatMap((ruleset) => ruleset.rules),
    ...nodeConfiguration.size.flatMap((ruleset) => ruleset.rules),
  ];
  return rules.some((rule) =>
    rule.searchObject.attributes.some((attribute) =>
      keys.has(attribute.attributeSearch),
    ),
  );
}

/**
 * Spotify images of artists that came without one (database artists may have none).
 * Only while covers show, and IMAGE_BATCH artists per pass. Returns true when more wait.
 */
async function loadArtistImages(
  dispatch: Dispatch,
  rootState: RootState,
  commit: Ctx["commit"],
) {
  if (!rootState.appearance.covers) return false;
  const waiting = getAllNodes(rootState).filter(
    (node) =>
      node.data.label === "artist" &&
      node.data.sid &&
      !node.data.imagesLoaded &&
      !(Array.isArray(node.data.images) && node.data.images.length > 0),
  );
  const artists = waiting.slice(0, IMAGE_BATCH);
  if (artists.length === 0) return false;
  const { artists: found } = await handleTokenError(
    (sids: string[], token: string) =>
      SpotifyService.getArtistsById(token, sids),
    [artists.map((node) => String(node.data.sid))],
    dispatch,
    rootState,
  );
  // Marked only after the answer, so that a failed request is tried again.
  artists.forEach((node, index) => {
    const images = found[index]?.images;
    commit("MERGE_NODE_DATA", {
      nodeId: node.id,
      data: images?.length
        ? { images, imagesLoaded: true }
        : { imagesLoaded: true },
    });
  });
  dispatch("applyNodeImages");
  return waiting.length > artists.length;
}

/** Merges answers into the nodes with their Spotify id. Returns the number of pending answers. */
function mergeAnswers(
  commit: Ctx["commit"],
  bySid: Map<string, GraphNode[]>,
  answers: MusicMetadata[],
) {
  let pending = 0;
  for (const metadata of answers) {
    if (metadata.status === "PENDING") pending += 1;
    bySid.get(metadata.sid)?.forEach((node) =>
      commit("MERGE_NODE_DATA", {
        nodeId: node.id,
        // A pending answer only marks the node as queued.
        data:
          metadata.status === "PENDING"
            ? { mbStatus: "PENDING" }
            : toNodeData(metadata),
      }),
    );
  }
  return pending;
}

export const actions = {
  /** Loads metadata a moment after the graph changed. Calls in between move the load on. */
  scheduleMetadata({ dispatch }: Ctx) {
    clearTimeout(loadTimer);
    retry = 0;
    loadStart = Date.now();
    loadTimer = setTimeout(() => dispatch("loadMetadata"), LOAD_DELAY);
  },

  /**
   * Adds MusicBrainz metadata to the artist and album nodes that have none, and Spotify
   * images to artists without one. Asks again for pending ids, with growing waits.
   */
  async loadMetadata({ dispatch, commit, rootState }: Ctx) {
    clearTimeout(loadTimer);
    // A newer load replaces this one: only the newest merges late answers and plans a retry.
    const run = ++loadRun;
    // The Spotify release year needs no request.
    getAllNodes(rootState)
      .filter(
        (node) =>
          node.data.label === "album" && node.data.releaseYear === undefined,
      )
      .forEach((node) =>
        commit("MERGE_NODE_DATA", {
          nodeId: node.id,
          data: { releaseYear: releaseYear(node.data.release_date) },
        }),
      );
    let pending = 0;
    let merged = 0;
    for (const kind of KINDS) {
      const nodes = unsettled(rootState, kind);
      const bySid = new Map<string, GraphNode[]>();
      nodes.forEach((node) => {
        const sid = String(node.data.sid);
        bySid.set(sid, [...(bySid.get(sid) ?? []), node]);
      });
      for (const sids of chunk([...bySid.keys()], QUERY_SIZE)) {
        let answers: MusicMetadata[];
        try {
          answers = await queryMetadata(dispatch, rootState, kind, sids);
          if (run !== loadRun) return;
        } catch (error) {
          // The other batches still load, and these ids count as pending, so a retry comes.
          console.error(error);
          pending += sids.length;
          continue;
        }
        const waiting = mergeAnswers(commit, bySid, answers);
        pending += waiting;
        merged += answers.length - waiting;
      }
    }
    if (run !== loadRun) return;
    const moreImages = await loadArtistImages(
      dispatch,
      rootState,
      commit,
    ).catch((error) => {
      // The artists stay unmarked, so the retry below tries them again.
      console.error(error);
      return true;
    });
    if (run !== loadRun) return;
    // The genres of artists and albums can change the theme that matches the graph.
    if (merged > 0) dispatch("matchThemeToGraph");
    if (merged > 0 && rulesUseMetadata(rootState)) {
      dispatch("applyNodeColorConfiguration");
      dispatch("applyNodeSizeConfiguration");
    }
    if ((pending > 0 || moreImages) && Date.now() - loadStart < GIVE_UP) {
      loadTimer = setTimeout(
        () => dispatch("loadMetadata"),
        Math.min(FIRST_RETRY * 2 ** retry, MAX_RETRY),
      );
      retry += 1;
    }
  },

  /**
   * Asks for the metadata of one node at once, ahead of the queue of the server. The node
   * info calls it for the node it shows.
   */
  async loadNodeMetadata(
    { dispatch, commit, rootState }: Ctx,
    node: { id: GraphNode["id"]; data: GraphNode["data"] },
  ) {
    const kind = node.data.label;
    if ((kind !== "artist" && kind !== "album") || !node.data.sid) return;
    if (metadataSettled(node.data)) return;
    const graphNode = rootState.mainGraph.Graph.getNode(node.id);
    if (!graphNode) return;
    try {
      const answers = await queryMetadata(
        dispatch,
        rootState,
        kind,
        [String(node.data.sid)],
        true,
      );
      mergeAnswers(
        commit,
        new Map([[String(node.data.sid), [graphNode]]]),
        answers,
      );
    } catch (error) {
      console.error(error);
    }
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
