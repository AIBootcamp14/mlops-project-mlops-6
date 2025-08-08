/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 런타임 config 타입 정의
interface Window {
  APP_CONFIG?: {
    API_URL: string;
  };
}
