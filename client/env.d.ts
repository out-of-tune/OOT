/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the reverse proxy that serves the auth, apollo and share services. */
  readonly VITE_PROXY_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
