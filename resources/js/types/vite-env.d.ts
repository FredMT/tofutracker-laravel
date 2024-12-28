/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DO_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
