# out-of-tune client

The web client of out-of-tune: Vue 3, TypeScript, Vuex, Tailwind CSS 4 and Vite. VivaGraphJS renders the graph with WebGL.

## Requirements

Node.js 24. The repository root has an `.nvmrc` file, so `nvm use` selects the version.

## Commands

Run the commands in the `client` directory.

| Command | What it does |
| --- | --- |
| `npm install` | Installs the dependencies. |
| `npm run dev` | Starts the development server on port 8080. |
| `npm run build` | Builds the production files into `dist/`. |
| `npm run typecheck` | Type checks the app with `vue-tsc` in strict mode. |
| `npm run lint` | Runs ESLint. `npm run lint:fix` also fixes what it can. |
| `npm test` | Runs the unit tests with Vitest. |
| `npm run check` | Runs the type check, the linter, the tests and the build. |
| `npm run generate:parser` | Generates the search parser from `src/lib/search/antlr/AdvancedSearch.g4`. |

## Configuration

Copy `sample.env` to `.env`. `VITE_PROXY_URI` is the URL of the reverse proxy that serves `/auth`, `/apollo` and `/share`.

## Structure

| Directory | Contents |
| --- | --- |
| `src/components/ui` | Design system primitives: buttons, modal, popover, switch, slider. |
| `src/components` | Feature components, grouped by area (graph, player, search, settings, layout, modals). |
| `src/views` | The routes: graph, settings, help, cookie policy and the login callback. |
| `src/store` | The Vuex store. Each module has its state type, mutations, actions and tests. |
| `src/lib` | Framework-free logic: graph queries, the search parser, token retries, the share codec. |
| `src/services` | HTTP clients for Spotify, the API, the auth service, the share service and IndexedDB. |
| `src/types` | Domain types and the type declarations of untyped packages. |
| `src/styles/main.css` | Tailwind setup and design tokens. |

The Settings page opens in a new tab. `src/lib/sharedMutations.ts` repeats the configuration mutations in the other tabs, so the graph tab updates at once.

The action tests call actions with partial contexts. Vitest runs all tests, but `vue-tsc` does not type check test files (`noCheck` in `tsconfig.vitest.json`).
