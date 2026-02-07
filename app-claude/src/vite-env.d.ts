/// <reference types="vite/client" />

declare module 'replicad-opencascadejs/src/replicad_single.js' {
  const opencascade: (options?: Record<string, unknown>) => Promise<unknown>;
  export default opencascade;
}

declare module 'replicad-opencascadejs/src/replicad_single.wasm?url' {
  const url: string;
  export default url;
}
