import { fileURLToPath, URL } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

/**
 * Host names the dev server answers besides localhost and IP addresses: the host of VITE_PROXY_URI
 * (the proxy forwards the Host header) and the space separated DEV_ALLOWED_HOSTS.
 */
function allowedHosts(env: Record<string, string>): string[] {
  const hosts = (env.DEV_ALLOWED_HOSTS ?? "").split(/[\s,]+/).filter(Boolean);
  if (URL.canParse(env.VITE_PROXY_URI ?? ""))
    hosts.push(new URL(env.VITE_PROXY_URI).hostname);
  return hosts;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
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
      allowedHosts: allowedHosts(env),
    },
    test: {
      globals: true,
      environment: "node",
      include: ["src/**/*.spec.{ts,js}"],
    },
  };
});
