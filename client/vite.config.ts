import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // The graph engine and the parser change rarely. Separate chunks keep them cached across releases.
        codeSplitting: {
          groups: [
            {
              name: "graph-engine",
              test: /node_modules[\\/](vivagraphjs|ngraph\.|gintersect|simplesvg)/,
            },
            { name: "search-parser", test: /node_modules[\\/]antlr4ng/ },
          ],
        },
      },
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    host: "0.0.0.0",
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.{ts,js}"],
  },
});
