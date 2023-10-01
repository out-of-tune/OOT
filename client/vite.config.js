// vite.config.js

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true
  },
  server: {
    port: 8080,
    strictPort: true,
    host: "0.0.0.0"
  }
});
