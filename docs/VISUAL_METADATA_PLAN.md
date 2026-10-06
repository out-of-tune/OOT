# Plan: covers on nodes, MusicBrainz metadata and the compass layout

This branch builds on `refactor/typescript-modernization` (PR #108). It answers the second round of ideas from the review conversation:

- The reviewer likes the images on the nodes.
- The reviewer wants more metadata for the node info, the layout and the node appearance. The data must come from open music data, not from AI. MusicBrainz is the proposed source, with its JSON dumps. The data must be matched to the Spotify ids.
- A graph that becomes a playlist is a good idea. The reviewer notes that "add selection to queue or playlist" already does most of it.
- The reference picture: an "IDM compass" where album covers sit on two axes (nerd to raver, tender to abrasive), with a star rating under each cover.

No data in this plan is generated. Every value comes from Spotify or from MusicBrainz, a community database, and the app shows where it comes from.

This document describes what the branch builds. A second agent reviewed the first version of the plan against the code. Section 7 lists its findings and what changed because of them.

## 1. Facts this plan rests on

Each fact was checked on 2026-10-06 with a request, not read from documentation alone.

| Fact                                                                                                                                                                                                     | How it was checked                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| In Spotify development mode an artist has only `external_urls, href, id, images, name, type, uri`. Genres, popularity and followers are gone.                                                            | `GET /v1/artists/{id}` with the app token                                                                             |
| A full album still has `external_ids.upc`, a full track `external_ids.isrc`. Simplified albums (from `artists/{id}/albums`) have neither.                                                                | `GET /v1/albums/{id}`, `GET /v1/tracks/{id}`                                                                          |
| Spotify cover URLs (`i.scdn.co`) send `access-control-allow-origin: *`, so WebGL can use them as textures.                                                                                               | `curl -I -H Origin`                                                                                                   |
| `GET /ws/2/url?resource=A&resource=B&inc=artist-rels` maps up to 100 Spotify URLs to MusicBrainz entities in one request. Unknown URLs are left out. One unknown URL alone answers 404.                  | Requests for artists and albums                                                                                       |
| The URL lookup of an album gives the release, not the release group. `GET /ws/2/release-group?release={id}&inc=genres+tags+ratings` gives the release group with rating, genres and tags in one request. | Requests for "Music Has the Right to Children"                                                                        |
| Tags and ratings cannot come with the URL lookup: `inc=genres` on a URL answers 400. Each entity takes one more request.                                                                                 | Request                                                                                                               |
| The API allows one request per second per application and needs a User-Agent with contact data.                                                                                                          | Documentation and response headers                                                                                    |
| The JSON dumps are JSON lines, one entity per line, with relations (Spotify URLs included), tags, genres and rating. `artist.tar.xz` is 2 GB, `release-group.tar.xz` 1 GB, `release.tar.xz` 22 GB.       | Listing of `json-dumps/20261003-001001`, first 3 MB of `artist.tar.xz` decoded: 317 of 559 artists have a Spotify URL |

Licence: MusicBrainz core data is CC0. Tags, genres and ratings are "supplementary data" under CC BY-NC-SA 3.0. The node info credits MusicBrainz and links to the entity. out-of-tune is non-commercial, so the licence fits, but a maintainer must make sure that this is correct before a release.

## 2. Features

### A. Covers on nodes

Artists show their photo in a circle, albums their cover in a rounded square. A song shows the cover of its album only while the album node is not in the graph. Next to the album node, the same picture shows twice. A ring in the node color goes around each cover, so color rules stay visible. A button in the tool rail and the key `V` turn covers on and off. The choice stays in local storage. Selection and highlight fade covers like dots, and size rules scale them.

1. The renderer contract has one new call: `getGraphics().setNodeImage(nodeId, url | null, shape)`. The store decides the URL and the shape (`applyNodeImages`, which runs with `applyAllConfigurations`).
2. 2D: a canvas on top of the WebGL canvas, with `pointer-events: none`. The 2D view wraps `webglGraphics.endRender`, so the canvas draws right after each WebGL frame. A cover is 1.6 times the side of the node square (side = `size × zoom` pixels). This stays inside the area where Viva finds the node under the pointer. Covers smaller than 6 px and covers off screen are not drawn. A loaded image asks for one new frame. Nodes that leave the graph let their image go.
3. 3D: each node with an image gets a `Sprite` as a child of its sphere. The sphere hides after the texture loads but stays the target of the pointer. Nodes with the same URL share one texture, and the last node that uses it disposes it. Artists get a circular alpha mask.
4. Image choice: the smallest Spotify image that is at least 160 px wide. If no image is that wide, the largest image.
5. Some database artists have no image. While covers show, the metadata module loads the Spotify images of up to 40 such artists per pass.

### B. MusicBrainz metadata (API)

```graphql
type MusicTag {
  name: String!
  count: Int!
}
enum MetadataStatus {
  FOUND
  NOT_FOUND
  PENDING
}
type MusicMetadata {
  sid: ID!
  status: MetadataStatus!
  mbid: String
  url: String
  rating: Float
  ratingVotes: Int
  genres: [MusicTag!]!
  tags: [MusicTag!]!
  type: String
  secondaryTypes: [String!]!
  country: String
  area: String
  beginYear: Int
  endYear: Int
}
type Query {
  artistMetadata(sids: [ID!]!, urgent: Boolean = false): [MusicMetadata!]!
  albumMetadata(sids: [ID!]!, urgent: Boolean = false): [MusicMetadata!]!
}
```

1. Storage: the ArangoDB collections `musicbrainz_artist` and `musicbrainz_album`, keyed by Spotify id. A "not found" answer is asked again after 30 days, a found one after 90 days, so that new links, tags and ratings show.
2. A query answers from storage at once. Ids that are not stored come back as `PENDING` and go into a queue. Urgent ids go before the rest of the queue: the client sends the node that the node info shows as urgent. The responses are never cached, because a pending answer changes.
3. One `MusicBrainzClient` per process sends at most one request per 1.1 s, with the User-Agent `out-of-tune/1.0 ( <MUSICBRAINZ_CONTACT> )`. It retries 429, 500, 502, 503, 504 and network errors with back-off and `Retry-After`. It fails at once on 400 and 404.
4. Artists: the URL lookup of up to 100 Spotify artist URLs, then one lookup per artist with `inc=genres+tags+ratings`.
5. Albums: the URL lookup of the Spotify album URLs gives a release. For albums without a link, the API reads the UPC from Spotify with its app token. Then it searches 25 barcodes per request, with and without the leading zero. Then one browse per album: `release-group?release=…&inc=genres+tags+ratings`. Album metadata is release group metadata, so the rating belongs to the album, not to one pressing.
6. Each entity keeps its 15 most voted tags.
7. Bulk import: `api/scripts/import-musicbrainz-artists.ts` reads the artist dump from standard input and stores the artists with a Spotify link. With it, artists need no live requests:

   ```
   xz -dc artist.tar.xz | tar -xO mbdump/artist | npx tsx scripts/import-musicbrainz-artists.ts
   ```

   Albums stay live, because the Spotify links are on releases, and the release dump is 22 GB.

### C. Metadata in the client

1. The store module `metadata` loads metadata for the artist and album nodes without an answer, a moment after the graph changes, 200 ids per query. While ids are pending, it asks again after 3 s. Each wait is twice the one before, up to 30 s, and the polling stops after 10 minutes. A failed query does not stop the other batches.
2. It merges the answers into the node data. The keys start with `mb` (`mbRating`, `mbVotes`, `mbGenres`, `mbTags`, `mbType` and others). The plain keys are `country`, `area`, `beginYear` and `endYear`. A new data object makes the renderer build the node again, so the merge changes the object in place. Albums also get `releaseYear` from the Spotify `release_date`. Database artists keep their own `mbid` attribute.
3. The schema lists these attributes as `metadataAttributes` of artists and albums, apart from `attributes`. GraphQL queries ask for exactly the `attributes`, so the API never sees the new names. Color, size and tooltip rules and the graph search use both lists.
4. Saved graphs, downloads and share links leave the metadata keys out. The server keeps the answers, so the next load adds them again.
5. The node info has an "About" block. It shows stars with the rating and the number of votes, and up to 8 genres (or tags). It also shows the type, the place, the years and a link to the MusicBrainz page. Before an answer it says that the node is in the MusicBrainz queue. Without a match it says "Not on MusicBrainz yet" and links to the page that adds it.
6. If you zoom in, labels show the rating under the name: `★ 4.2`.

### D. Compass layout

A "Compass" popover in the tool rail places the albums or the artists on two axes and pins them, as in the reference picture.

1. An axis is a number (year, rating, votes, tracks, active since) or a tag pair "from tag A to tag B". On a tag axis the value of a node is `share(B) - share(A)`. Here `share(T)` is the count of tag T divided by the count of the most given tag of the node. A node with neither tag has no value: in the middle it reads as "balanced", which it is not.
2. Presets: "Timeline" (year across, rating up) and "Tag compass". The tag compass picks two pairs of common tags that split the nodes best: the most nodes that have one tag of the pair but not both. Spellings of one tag ("synth-pop", "synthpop") are never a pair.
3. Placement (`compassPositions`) maps the values to a square plane whose side grows with the number of nodes. Then it pushes nodes apart until no two are closer than 1.25 covers. Nodes without a value wait in rows under the plane, sorted by name. In 3D the plane is z = 0 and larger y is up. In 2D larger y is down.
4. An SVG overlay draws the two axes with arrows. Number axes name their range at the ends ("Year 1974", "2017"), tag axes name their tags. The overlay projects the axis ends with `toScreen` on each frame, so it follows pan and zoom in both views.
5. The compass records a "move" change in the history. Undo puts each node back where it was, with its pin state, and takes the axes away. Redo places the nodes and shows the axes again. "Release" unpins the nodes that the compass pinned. Nodes that were pinned before stay pinned. A cleared graph drops the axes.

The compass does not build on `applyNodeCoordinateSystemMap`, the map layout of saved configurations. That layout has no UI and takes numbers only. It does not separate nodes, it places nodes without values at the minimum, and it pulls neighbors near. A change of the saved layouts unpins all nodes. So a compass and a saved layout do not mix: the newer one wins.

### E. Export the graph as a playlist

The playlist window has a "From graph" button next to "Create". It creates a private playlist with the songs of the graph and a random song of each artist and album. It uses `songsForNodes` and `createPlaylist` from PR #108. Each artist and album costs one Spotify request. For a graph with more than 100 such nodes, the button asks for a selection and "Add to playlist" instead.

## 3. Order of commits

1. Node images: contract, both views, store, switch.
2. The MusicBrainz data source, queue, storage, queries and dump import in the API.
3. The client metadata module, schema attributes, node info and rating labels.
4. The compass.
5. "From graph" playlists.
6. Help page, intro tour, sample data fixes and this plan.

## 4. Tests

- Pure functions: image choice, song cover rule, tag shares, axis values and ranges, tag pairs, compass positions, separation, metadata merge data, export filter.
- API client: it keeps the interval between requests and retries 503 after `Retry-After`. It fails at once on 400 and 404, and it keeps its queue after a failure.
- API data source: it answers pending and stored ids in order and stores NOT_FOUND. It asks again after 30 days and puts urgent ids first. It finds albums by URL and by barcode. The parsers read a real dump line, and the schema mock server answers both queries.
- Client store, metadata: merge in place, polling and giving up, and a recolor only for rules on metadata. Artist images load per batch and only with covers. The shown node gets an urgent query.
- Client store, layout: compass placement and its undo, and move undo and redo.
- Client store, the rest: node images, "From graph" with its limit, and rating labels. The graph search takes metadata attributes, and GraphQL queries leave them out.
- Views: 3D sprites, shared textures and their disposal, and the 2D cover layer with a canvas stand-in.
- End to end with `docker compose up` and the sample data: covers in 2D and 3D, and metadata in the node info for real artists and albums. Also the queue state of a new album, the timeline and the tag compass, and the dump import of 560 real artists.

## 5. Risks and limits

- MusicBrainz coverage: popular artists have links and tags. Small artists often have none, and the node info says so.
- Rate limit: one request per second for all users together. Storage makes each entity a one-time cost, and the dump import removes the cost for artists. A graph with 100 new albums takes about two minutes.
- The 2D cover canvas draws on each WebGL frame. Covers off screen and under 6 px are skipped.
- Spotify bans an app for many hours after a burst of requests. During the tests of this branch, the app token got a `Retry-After` of about 23 hours. The barcode step had sent a few hundred album requests in a burst, next to the expands of the client. The barcode step therefore sends one album request per 250 ms. After a failure, barcodes rest for 30 minutes.
- Licence of tags and ratings (CC BY-NC-SA): attribution in the node info and the help page, and a maintainer check before a release.
- The compass in 3D keeps the camera direction, so the plane can show at an angle.

## 6. Not in this plan

- Recording (song) metadata by ISRC. Songs inherit from their album and artists for now.
- The release dump import.
- Any generated or inferred descriptions.

## 7. Review of the first plan

| Finding                                                                           | Change                                                                                       |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A URL lookup with `inc=release-rels` does not return the release group.           | Albums use the browse `release-group?release=…` (B.5).                                       |
| The 2D view test mocks `webglGraphics` without `endRender`.                       | The test mocks have `endRender` and a graph with `on` and `off`.                             |
| Metadata attributes in `attributes` break every GraphQL query.                    | `metadataAttributes` (C.3), with a test of the query.                                        |
| Polling stopped after 45 s, long before the server can answer a big graph.        | Polling up to 10 minutes, urgent ids for the node info, and a queue message (C.1, C.5, B.2). |
| The history had no "move" change.                                                 | A "move" change with undo and redo (D.5).                                                    |
| The compass duplicates the map layout.                                            | Kept apart, for the reasons in D.                                                            |
| The 2D layer kept images of removed nodes and read nodes without UI.              | Removed nodes let their image go. Nodes without UI and covers off screen are skipped.        |
| "Save graph as playlist" and artist images can send hundreds of Spotify requests. | A limit of 100 nodes, and artist images in batches of 40, only with covers (E, A.5).         |
| Metadata made saved graphs and share links bigger.                                | Export leaves it out, and each entity keeps 15 tags (C.4, B.6).                              |
| Rating labels never refreshed after an in-place merge.                            | Labels compare the rating text by value (C.6).                                               |
| Color information disappeared under covers.                                       | A ring in the node color (A).                                                                |
| Barcode searches of 100 barcodes can pass the result limit.                       | 25 barcodes per search (B.5).                                                                |
| The database `mbid` of artists is always empty.                                   | Not used. The URL lookup matches artists (B.4).                                              |

## 8. Review of the implementation

A third agent reviewed the code before the first commit. These findings changed it:

| Finding                                                                                                                          | Change                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| The 2D cover canvas kept the last picture after the last cover went (covers off, graph cleared).                                 | If the last cover goes, the canvas clears.                                                            |
| A poll during a running batch queued the same ids again, so each batch ran twice.                                                | Ids of the running batch are not queued again.                                                        |
| The first batch of each query held one id, because the worker started on the first id.                                           | The worker starts after the query queues all its ids.                                                 |
| A failed barcode step stored "not found" for 30 days for every album without a link.                                             | Albums whose barcode step failed get no answer and are asked again. Spotify 404s skip one album only. |
| The node info sent no urgent query for nodes that were already pending.                                                          | It sends one for every node without an answer.                                                        |
| Undo of the compass left its axes on screen.                                                                                     | Undo and redo hide and show the axes.                                                                 |
| Covers turned on did not load the missing artist images.                                                                         | Turning covers on starts a metadata load.                                                             |
| A failed artist image request was never tried again.                                                                             | Artists are marked only after an answer.                                                              |
| Two metadata loads ran side by side.                                                                                             | A newer load replaces an older one.                                                                   |
| The playlist and player modules imported each other.                                                                             | The song helpers moved to `lib/songs.ts`.                                                             |
| The playlist limit counted songs, which are cheap.                                                                               | It counts artists and albums only.                                                                    |
| Two copies of a shared cache by URL.                                                                                             | One `refCounted` helper for images and textures.                                                      |
| The compass spacing used the 2D cover size in 3D.                                                                                | `COVER_SIDE` in the renderer contract gives the size in each view.                                    |
| A 12-digit UPC can miss a 13-digit EAN on MusicBrainz.                                                                           | The search tries each barcode with and without leading zeros, as 12 and as 13 digits.                 |
| (Found in the end-to-end test.) After a burst of Spotify album requests for barcodes, the app token got a ban of about 23 hours. | Album requests are 250 ms apart, and barcodes rest for 30 minutes after a failure.                    |
