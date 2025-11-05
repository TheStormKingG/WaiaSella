/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NANO_BANANA_API_KEY?: string;
  readonly VITE_NANO_BANANA_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
