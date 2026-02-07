import { setOC } from 'replicad';
import opencascade from 'replicad-opencascadejs/src/replicad_single.js';
import opencascadeWasm from 'replicad-opencascadejs/src/replicad_single.wasm?url';

type ReplicadInitResult = {
  ok: boolean;
  ms: number;
  error?: string;
};

let initPromise: Promise<ReplicadInitResult> | null = null;

export function initReplicad(): Promise<ReplicadInitResult> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const start = performance.now();
    try {
      const oc = await opencascade({
        locateFile: () => opencascadeWasm,
      });
      setOC(oc);
      return { ok: true, ms: performance.now() - start };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, ms: performance.now() - start, error: message };
    }
  })();

  return initPromise;
}
