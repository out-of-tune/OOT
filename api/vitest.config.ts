import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "schema/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
  },
});
