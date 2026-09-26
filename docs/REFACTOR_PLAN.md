# Refactor plan: upgrades, bug fixes, TypeScript frontend

This plan covers the modernization of the out-of-tune (OOT) monorepo. The work happens on the branch `refactor/typescript-modernization`, in the order below.

1. Upgrade the packages and the runtime.
2. Fix the bugs that the audit found.
3. Port the frontend (`client/`) to TypeScript and polish the UI.

## 1. Goals and non-goals

Goals:

- Every package in the repo is on a current, maintained major version.
- The client is 100% TypeScript (`.ts` and `<script setup lang="ts">`), and `vue-tsc --noEmit` passes in strict mode.
- Every bug in section 3 is fixed. Each store-level fix has a regression test.
- The UI keeps its layout and its features, but uses one consistent, minimal design system built with Tailwind CSS.
- The test suite, `vue-tsc`, the linter and the production build all pass.

Non-goals:

- No change to the GraphQL schema, the REST routes or the persisted data formats. Old share links, stored graphs and stored configurations must keep working.
- No replacement of the graph engine (VivaGraphJS). It is the core of the product and has no drop-in successor.
- No migration from Vuex to Pinia. Section 4 gives the reason.
- No port of the `auth` and `share` services to TypeScript. They get upgrades and bug fixes only.

## 2. Baseline (before any change)

| Check | Result |
| --- | --- |
| `client` tests (Vitest 0.34) | 35 files, 387 tests, all pass |
| `client` build (Vite 4) | Pass. Main chunk 979 kB, CSS 312 kB (most of it is an unused icon font) |
| `client` lint | 8 errors, 68 warnings |
| Node images | `node:16` (client, auth, share), `node:19` (api). Both are end of life |
| Client size | About 11,000 lines of source and 11,000 lines of tests, in JS and Vue options API |

## 3. Bug inventory

The audit read every source file. The list gives the file and the observable effect.

### Client: broken features

1. `components/modals/FeedbackModal.vue`: `valid` is never set to true, so feedback can never be sent. The form also has no `submit.prevent`, so the button reloads the page.
2. `store/modules/share/actions.js`: pako 2 ignores `{ to: "string" }` on deflate. The client uploads `Uint8Array.toString()` ("120,156,..."), and the import cannot inflate it. Share links are broken in both directions.
3. `store/modules/search/index.js`: the module does not register its mutations, so `setAdvancedOpen` fails with "unknown mutation type". No component calls `setAdvancedOpen`, so users cannot reach this defect.
4. `store/modules/coordinate_system/actions.js`: the layout actions use `configurations.layoutConfiguration` and the mutations `ADD_/CHANGE_/DELETE_LAYOUT_CONFIGURATION`. Neither exists. The map layout also checks `yBoundaryMin` twice and never checks `yBoundaryMax`. No component calls `setCoordinateSystemConfiguration`, so users cannot reach this defect. The "sort" action does not use these parts and works.
5. `components/options/ColorDraggable.vue` and `SizeDraggable.vue`: `removeAt(index)` uses a variable that is not in the slot scope. Delete always removes the first rule. The code also mutates a computed array.
6. `components/modals/PlaylistChooser.vue`: passes graph nodes instead of song data to `addSongsToPlaylist`, so every URI is `undefined`.
7. `components/modals/PlaylistLoader.vue`: "load playlist graph" with no selection crashes. The filter builds a RegExp from user input, so a `(` crashes the list.
8. `components/popovers/NodeInfo/NodeInfo.vue`: uses `images[0]` as an image URL. Spotify returns `{ url }` objects, so artist covers from Spotify do not show. If `external_urls` is missing, the album and song panels crash.
9. `components/popovers/QueueDisplay.vue`: the remove and add buttons are inside the row click handler, so each click also plays the song.
10. `views/Settings.vue`: uses `<v-switch>`, a Vuetify component that no longer exists, so the "Show tutorial" toggle does not render.
11. `components/helpers/IntroTour.js`: steps target `#MouseActionRadio` and `#io-button`, which do not exist.
12. `components/Snackbar.vue`: the store sets the colors `error` and `info`, but the CSS only has `failure`, `neutral` and `success`. The "Retry" button reads `state.expand.failedNodes`, which does not exist. A new message is hidden early by the timer of the previous message.
13. `views/Login.vue`: `setError` receives a string, and `setError` reads `error.message`, so the login error shows "undefined". The view also prints the tokens in the DOM.
14. `store/services/IndexedDbService.js`: `deleteGraph` references an undefined variable `graphs` (always throws). `deleteConfiguration` opens the database without a store name. Save errors are never caught, because the promise is not awaited.
15. `store/services/SpotifyService.js`: `putToApi` never resolves on success, so `playOnSpotify` never finishes.

### Client: robustness

16. `assets/js/TokenHelper.js` and `music_player/actions.js`: code reads `error.response.status` without a guard. A network error (no response) throws a `TypeError` that hides the real error.
17. `expand/actions.js`: an exception inside `expandAction` leaves `pendingRequestCount` above zero, so the loading spinner never stops.
18. `appearance/actions.js`: `addPendingRequest` mutates state outside a mutation (`++state.pendingRequestCount`).
19. `feedback/actions.js`, `graphQlHelper.js`, `expand/actions.js`, `search/actions.js`: GraphQL queries are built by string interpolation. A quote in a name or in the feedback text breaks the query. Feedback must use GraphQL variables. The other queries must escape their string values.
20. `authentication/actions.js`: each token refresh starts another timer and never clears the old one. If the browser blocks the pop-up, `window.open` returns `null` and `logout` crashes.
21. `mutations.js`: the ngraph graph, the VivaGraph renderer, the layout and the DOM container live in reactive state. Vue wraps them in deep proxies, which is slow and breaks identity checks. They must be marked raw.
22. `mutations.js` `ZOOM_TO_SCALE`: uses `setTimeout(fn, 0.05)`. The unit is milliseconds, so the zoom animation runs as fast as the event loop allows.
23. `search/actions.js`: `startGraphQlSearch` uses `alert()`. Errors must go to the snackbar.
24. `components/Slider.vue`: the fill width ignores `min`. If the media has no seekable range, `setStartEnd` in `MusicPlayer.vue` throws.
25. `popovers/SelectionActionPopover.vue`: "sort" with an empty selection throws.
26. `components/Graph.vue`: a computed property writes component state (`isPinned`). Global listeners are never removed.

### API (`api/`)

27. `datasources/arangodb/index.ts`: the `feedback` datasource is not created, so the `createfeedback` mutation always throws.
28. `resolvers/arangodb/artist/artist.ts`: the resolver calls its own server over HTTP with an interpolated `sid` to add an artist. This is a GraphQL injection point and depends on `localhost`. The logic must be a direct function call.
29. `datasources/arangodb/index.ts`: when the database is not ready, `connect` schedules a retry but returns `undefined` at once, so the server starts with no database. `createDatabase` is not awaited.
30. `errors/*.ts`: `apollo-errors` is abandoned and targets GraphQL 14. Errors must be `GraphQLError` with `extensions.code`.

### Auth and share services

31. `auth`: `simple-oauth2@2` is unmaintained. The OAuth flow sends no `state` parameter, so it has no CSRF protection.
32. `share/routes/create`: two parallel requests can read the same key and overwrite the same file. The key update must be atomic.
33. `share/datasources/arangodb`: same retry defect as item 29.

### Infrastructure

34. `server/nginx.conf`: the `/apollo` rewrite has a typo (`$}`), so the rule never matches.
35. Dockerfiles use Node 16 and 19. Both are end of life.
36. The CI workflow runs the tests only on the branch `cicd/add-github-actions`, with Node 19.

## 4. Decisions

| Topic | Decision | Reason |
| --- | --- | --- |
| Node | 24 LTS everywhere (`.nvmrc`, Docker, CI) | Vite 8, Vitest 5, jsdom 30, arangojs 10 and Apollo Server 5 need Node 20.19 or newer. 24 is the active LTS line. |
| TypeScript | 6.0 | TypeScript 7 (the native compiler) has no classic compiler API. `vue-tsc` and `typescript-eslint` (peer range `<6.1`) need it. |
| Build and test | Vite 8, Vitest 5, jsdom, `vue-tsc` | Current majors. |
| State | Keep Vuex 4.1, add full typing | The 387 tests call the Vuex action contract directly. The cross-tab sync (Settings opens in a new tab) is a Vuex plugin. A Pinia migration rewrites every action and every test at the same time as the TypeScript port, which mixes two risks. It is a separate follow-up. |
| Styling | Tailwind CSS 4 with design tokens in `@theme` | Replaces seven copies of the same modal and card CSS with shared primitives. |
| Icons | `@lucide/vue` | `oh-vue-icons` has had no release since 2022. The unused `@mdi/font` (300 kB of CSS) goes away. |
| Popovers | `@floating-ui/vue` in one `UiPopover` component | `vue3-popper` has had no release since 2022. |
| Tour | `driver.js` | `vue3-tour` has had no release since 2022. `driver.js` is typed and maintained. |
| Drag and drop | `vue-draggable-plus` | `vuedraggable@4` is unmaintained. |
| Graph engine | VivaGraphJS 0.12 with `ngraph.graph` pinned to `0.0.x` | VivaGraph 0.12 is the last release and bundles `ngraph.graph@0.0.14`. `ngraph.graph@20` stores `node.links` as a `Set`, which the renderer and this app cannot read. Type declarations are written locally. |
| Unused packages | Remove `circular-json`, `flatted`, `stylus`, `json-loader`, `ngraph.forcelayout`, `ngraph.generators`, `ngraph.pagerank`, `ngraph.physics.simulator`, `@mdi/font` | No import uses them. |
| Share format | Upload base64. Decode base64, the comma list of the broken version, and the pako 1 binary string | Old links keep working. |
| File layout | `src/assets/js` to `src/lib`, `src/store/services` to `src/services`, shared types in `src/types` | Static assets and code are separate. |
| Tests | Rename to `.spec.ts`. Vitest runs them, `vue-tsc` does not type check them (`noCheck`) | The tests call actions with partial contexts, which no type allows without a cast on every call. The tests stay the behavior contract. |
| API errors | Replace `apollo-errors` with `GraphQLError` | `apollo-errors` is abandoned. |

## 5. Phases and exit criteria

A phase ends only after its exit criteria pass.

### Phase 1: tooling and upgrades

- Client: Node 24, Vite 8, Vitest 5, TypeScript 6, `vue-tsc`, ESLint 10 flat configuration file with `typescript-eslint` and `eslint-plugin-vue`, Prettier 3. `allowJs` lets JS and TS live together during the port.
- Upgrade all runtime packages to their latest versions, except the pins in section 4.
- Exit: 387 tests pass, build passes.

### Phase 2: bug fixes in the store and services

- Fix items 2, 3, 4, 14 to 23 with a regression test each.
- Exit: all tests pass, including the new ones.

### Phase 3: TypeScript port of the core

- Domain types: `GraphNode`, `GraphLink`, `SchemaNodeType`, `EdgeType`, `SearchObject`, `Configuration`, rule types, Spotify response types.
- Local declarations for `vivagraphjs`, `ngraph.graph`, `ngraph.cw` and the ANTLR generated parser.
- Port `lib`, `services`, the root store and every module. Type the store with `InjectionKey<Store<RootState>>` and a `useStore()` helper.
- Mark the graph engine objects raw (item 21).
- Exit: `vue-tsc` passes on the app code, all tests pass as `.spec.ts`.

### Phase 4: components and UI

- Tailwind 4 with tokens for the palette: background, surface, border, text, accent blue `#2d9cdb`, accent orange `#da6a1d`.
- Primitives in `src/components/ui`: `UiButton`, `IconButton` (with its tooltip), `UiModal` (Escape key, backdrop click, focus trap), `UiPopover`, `UiSegmented`, `UiSwitch`, `UiSlider`, `PaginatedList`. Inputs and selects use the `field` class of `main.css`.
- Rewrite every component and view with `<script setup lang="ts">` on the primitives. Fix items 1, 5 to 13, 24 to 26 on the way.
- Keep the layout: search on the top left, account on the top right, tool rail on the right, player at the bottom, node info on the left. Polish spacing, type scale, focus rings, hover states and empty states.
- Delete `views/Recommender.vue` (not routed, uses Vuetify, and the Spotify recommendations endpoint is closed to new apps).
- Exit: type check, lint, tests and build pass. Manual browser check of each view.

### Phase 5: backend upgrades and fixes

- API: Apollo Server 5, arangojs 10, dataloader 2, keyv 5, graphql-codegen 7. Vitest replaces Jest, `tsx` replaces `ts-node` and nodemon. Fix items 27 to 30.
- Auth: Express 5, `simple-oauth2` 5, OAuth `state` parameter. Fix item 31.
- Share: Express 5, arangojs 10, atomic key update. Fix items 32 and 33.
- Errors package and root: upgrade Lerna.
- Exit: API compiles, API and share unit tests pass, each service starts.

### Phase 6: infrastructure and documentation

- Node 24 Docker images, nginx fix (item 34), CI workflow that runs type check, lint, tests and build on pull requests to `master`.
- Update the README files.
- Exit: if Docker is available, `docker compose build` passes.

### Phase 7: final checks

- Run the full check suite in every package.
- Run the client in a browser: graph render, search box, tool rail, popovers, modals, the Settings view, the Help page and the tour.
- Record the results at the end of this file.

## 6. Risks

| Risk | Control |
| --- | --- |
| VivaGraph 0.12 behaves differently from 0.10 | The browser check in phase 7. If the layout changes, pin 0.10.1. |
| No Spotify credentials or database in this environment | Service calls are covered by unit tests with mocks. The browser check covers everything that runs without a backend. |
| Cross-tab sync breaks | Keep the shared mutation list and the persisted keys unchanged. |
| Old saved data does not load | Keep the persisted key names and the JSON schemas. Test the share decoder with all three formats. |

## 7. Results

### Bugs found during the work

These bugs were not in the first audit. They are fixed too.

37. `server/Dockerfile`: `software-properties-common` no longer exists in the Debian base image, so the proxy image did not build.
38. `playlists/actions.js`: playlist songs had the id `Song/<id>`, but every other code path uses `song/<id>`. The same song could show twice.
39. `components/helpers/PaginatedList.vue`: the list had no page controls, so only the first ten items were visible.
40. `views/Guide.vue`: in-page links changed the hash route instead of scrolling, and the query examples used typographic quotes that the parser rejects.
41. `search/actions.js`: a node found in the graph and in the database was selected twice.
42. `AppearanceMappingEdgeColorOption.vue` and `AppearanceMappingTooltipOption.vue`: the rules were matched by list position instead of by label, and a color change dropped the alpha channel.
43. `appearance_mapping/actions.js`: mixed edge colors produced fractional hex digits. `appearance/actions.js`: random cluster colors lost leading zeros.
44. `SelectionActionPopover.vue`: "sort" mirrored the line on the y axis.
45. `vuex-shared-mutations` fails to load with Vite 8. A 30 line typed plugin (`src/lib/sharedMutations.ts`) replaces it.

Not changed: the app tries to restore the Spotify session with a refresh token on reload, but no code ever saved the refresh token. Saving it in local storage has a security cost, so it needs a product decision.

### Order of the work

Phases 2 and 3 ran together per module: each store module was ported to TypeScript and fixed in the same step, with its tests.

### Checks

| Check | Result |
| --- | --- |
| Client `vue-tsc` (strict) | Pass |
| Client ESLint | Pass, 0 problems |
| Client tests (Vitest 5) | 39 files, 437 tests pass: 382 of the 387 original tests, 27 parser tests recorded from the old parser, 28 new tests. The 5 removed tests asserted calls that the fixes removed (a duplicate success message, unused `getAllLinks` calls). |
| Client build (Vite 8) | Pass. Entry chunk 299 kB (was 979 kB), CSS 36 kB (was 312 kB) |
| API `tsc` and tests | Pass, 28 tests |
| Auth and share tests | Pass, 4 tests each |
| API against ArangoDB 3.12 | Collections created, genre queries, input errors, feedback mutation: all pass |
| Share service, 10 parallel uploads | 10 different ids |
| `docker compose build` and `up` | All six services start. The production client works through the proxy: search, expand, feedback and share |
| Browser check of the client | Graph view, search, expand, popovers, modals, Settings and Help pages work |

The Spotify login and the Spotify API calls need real credentials and were not run. Unit tests with mocks cover them.

The Help page screenshots show the old interface.
