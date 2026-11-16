/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API. Padrão: http://localhost:8000 */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
