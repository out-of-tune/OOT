import type { Dispatch } from "vuex";
import { chunk, sample } from "lodash-es";
import { findNodesBySid } from "@/lib/graph";
import {
  hasSongs,
  nodeFromSpotify,
  songFromTrack,
  spotifyImages,
} from "@/lib/spotifyNode";
import { handleTokenError } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { GraphItems, NodeData, NodeInput } from "@/types/graph";
import type { Song, SpotifyTrack } from "@/types/spotify";
import type { NodeRef, RootState } from "@/store/types";

// Songs of graph nodes: full Spotify tracks, songs of artists and albums, and song nodes
// with their neighbors. The player, the playlists and the selection share them.

/** Nodes whose songs load at the same time. */
const PARALLEL_NODES = 8;
/** Spotify accepts at most 50 ids per batch request. */
const SONG_BATCH_SIZE = 50;

/** The full songs of the Spotify ids, in their order. A song that Spotify does not know is `null`. */
export async function fullSongs(
  dispatch: Dispatch,
  rootState: RootState,
  sids: string[],
) {
  const results = await Promise.all(
    chunk(sids, SONG_BATCH_SIZE).map((batch) =>
      handleTokenError(
        (ids: string[], token: string) =>
          SpotifyService.getFullSongData(token, ids),
        [batch],
        dispatch,
        rootState,
      ),
    ),
  );
  return results.flatMap((result) => result.tracks);
}

export async function retrieveFullSongData(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
) {
  const [track] = await fullSongs(dispatch, rootState, [String(node.data.sid)]);
  if (!track) throw new Error("Spotify has no data for this song");
  return { node, data: songFromTrack(track) as Partial<NodeData> };
}

/** The songs of an artist (those that Spotify finds for the artist) or the tracks of an album. */
export function songsOf(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
) {
  return handleTokenError(
    (sid: string, token: string): Promise<SpotifyTrack[]> =>
      node.data.label === "artist"
        ? SpotifyService.getSongSamplesFromArtist(
            token,
            sid,
            String(node.data.name ?? ""),
          ).then((data) => data.tracks)
        : SpotifyService.getSongsFromAlbum(token, sid).then(
            (data) => data.items,
          ),
    [String(node.data.sid)],
    dispatch,
    rootState,
  );
}

/** A random song of an artist or of an album node, or `null` when Spotify has none. */
export async function randomSongOf(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
): Promise<Song | null> {
  const tracks = await songsOf(dispatch, rootState, node);
  const track = sample(tracks.filter((item) => item?.uri));
  return track ? songFromTrack(track, spotifyImages(node.data.images)) : null;
}

/**
 * One song for each node, in the order of the nodes: the song of a song node, a random
 * song of an artist (from the songs that Spotify finds for the artist) or a random song
 * of an album. Other nodes, and nodes that Spotify has no song for, give no song.
 */
export async function songsForNodes(
  dispatch: Dispatch,
  rootState: RootState,
  nodes: NodeRef[],
): Promise<Song[]> {
  const playable = nodes.filter((node) => node.data.sid && hasSongs(node));
  const songSids = playable
    .filter((node) => node.data.label === "song")
    .map((node) => String(node.data.sid));
  const tracks = new Map<string, SpotifyTrack | null>();
  if (songSids.length > 0) {
    const loaded = await fullSongs(dispatch, rootState, songSids);
    songSids.forEach((sid, index) => tracks.set(sid, loaded[index] ?? null));
  }
  const songs: (Song | null)[] = [];
  for (const batch of chunk(playable, PARALLEL_NODES)) {
    songs.push(
      ...(await Promise.all(
        batch.map((node) => {
          if (node.data.label !== "song")
            return randomSongOf(dispatch, rootState, node).catch(() => null);
          const track = tracks.get(String(node.data.sid));
          return track
            ? songFromTrack(track, spotifyImages(node.data.images))
            : null;
        }),
      )),
    );
  }
  return songs.filter((song): song is Song => song !== null);
}

/**
 * The song node of the Spotify id. When the song is not in the graph, adds it with its
 * album, artists and genres. Undefined when Spotify does not know the song.
 */
export async function findOrAddSongNode(
  dispatch: Dispatch,
  rootState: RootState,
  sid: string,
) {
  const [existing] = findNodesBySid(rootState, "song", sid);
  if (existing) return existing;
  const [track] = await fullSongs(dispatch, rootState, [sid]);
  if (!track) return undefined;
  await addSongsWithNeighbors(dispatch, [track]);
  return findNodesBySid(rootState, "song", sid)[0];
}

const nodesOf = (result: unknown): NodeInput[] =>
  (result as GraphItems | undefined)?.nodes ?? [];

/**
 * Adds song nodes to the graph, then their albums, the artists of those albums and the
 * genres of those artists. Playlists, liked songs and recently played songs use it.
 */
export async function addSongsWithNeighbors(
  dispatch: Dispatch,
  tracks: (SpotifyTrack | null | undefined)[],
) {
  const songNodes: NodeInput[] = tracks
    .filter((track): track is SpotifyTrack => Boolean(track?.id))
    .map((track) => ({
      ...nodeFromSpotify("song", track as unknown as Record<string, unknown>),
      links: [],
    }));

  dispatch("addToGraph", { nodes: songNodes, links: [] });

  const albums = await dispatch("expandAction", {
    nodes: songNodes,
    expandConfiguration: [{ nodeType: "song", edges: ["Song_to_Album"] }],
  });
  const artists = await dispatch("expandAction", {
    nodes: nodesOf(albums).filter((node) => node.data.label === "album"),
    expandConfiguration: [{ nodeType: "album", edges: ["Album_to_Artist"] }],
  });
  await dispatch("expandAction", {
    nodes: nodesOf(artists).filter((node) => node.data.label === "artist"),
    expandConfiguration: [{ nodeType: "artist", edges: ["Artist_to_Genre"] }],
  });
}
