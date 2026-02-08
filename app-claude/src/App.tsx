import { useCallback, useEffect, useMemo, useState } from 'react';
import { createTrammelStore, createTrammelPersister } from './store/store';
import { initReplicad } from './replicad/init';
import { ErrorCollector } from './errors/collector';
import { ErrorContext } from './errors/context';
import { evaluateTsx, defaultCode } from './eval/evaluate';
import type { EvalResult } from './eval/evaluate';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { SvgViewport } from './components/SvgViewport';
import { ErrorPanel } from './components/ErrorPanel';
import { VariablePanel } from './components/VariablePanel';
import { Diagnostics } from './components/Diagnostics';
import { styles } from './styles';

export default function App() {
  const store = useMemo(() => createTrammelStore(), []);
  const persister = useMemo(() => createTrammelPersister(store), [store]);
  const collector = useMemo(() => new ErrorCollector(), []);

  const [code, setCode] = useState(defaultCode);
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<EvalResult>(() =>
    evaluateTsx(defaultCode, {}, collector)
  );
  const [svgSource, setSvgSource] = useState('');
  const [svgStats, setSvgStats] = useState({ nodes: 0, bytes: 0 });
  const [serializeMs, setSerializeMs] = useState(0);
  const [replicadStatus, setReplicadStatus] = useState<{
    state: 'idle' | 'loading' | 'ready' | 'error';
    ms: number;
    error?: string;
  }>({ state: 'idle', ms: 0 });

  const run = () => setOutput(evaluateTsx(code, overrides, collector));

  const resetToDefault = () => {
    setCode(defaultCode);
    setOverrides({});
    setOutput(evaluateTsx(defaultCode, {}, collector));
  };

  const handleImport = (text: string) => {
    setCode(text);
    setOverrides({});
    setOutput(evaluateTsx(text, {}, collector));
  };

  const exportTsx = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trammel-claude.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    if (!svgSource) return;
    const blob = new Blob([svgSource], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trammel-claude.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOverrideChange = (next: Record<string, unknown>) => {
    setOverrides(next);
    setOutput(evaluateTsx(code, next, collector));
  };

  const handleSvgStats = useCallback((stats: { source: string; nodes: number; bytes: number; serializeMs: number }) => {
    setSvgSource(stats.source);
    setSvgStats({ nodes: stats.nodes, bytes: stats.bytes });
    setSerializeMs(stats.serializeMs);
  }, []);

  const rendered = useMemo(() => output.element, [output.element]);

  // Load persisted code
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await persister.startAutoLoad();
      const stored = store.getCell('files', 'default', 'content');
      if (!cancelled && typeof stored === 'string' && stored.length > 0) {
        setCode(stored);
        setOutput(evaluateTsx(stored, overrides, collector));
      } else if (!cancelled) {
        store.setRow('files', 'default', { name: 'main.tsx', content: defaultCode });
      }
      persister.startAutoSave();
    };
    load();
    return () => {
      cancelled = true;
      persister.stopAutoSave();
    };
  }, [persister, store]);

  // Persist code changes
  useEffect(() => {
    store.setRow('files', 'default', { name: 'main.tsx', content: code });
  }, [code, store]);

  // Init replicad
  useEffect(() => {
    let mounted = true;
    setReplicadStatus({ state: 'loading', ms: 0 });
    initReplicad().then((result) => {
      if (!mounted) return;
      if (result.ok) {
        setReplicadStatus({ state: 'ready', ms: result.ms });
      } else {
        setReplicadStatus({ state: 'error', ms: result.ms, error: result.error });
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <ErrorContext.Provider value={collector}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.title}>trammel claude</h1>
          <p style={styles.subtitle}>Parametric art tool — editor + SVG viewport</p>
        </header>
        <main style={styles.main}>
          {/* Left: Editor + Toolbar + Variables */}
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Editor</h2>
              {output.collectedErrors.length > 0 && (
                <span style={{ fontSize: 11, color: '#b91c1c' }}>
                  {output.collectedErrors.length} error{output.collectedErrors.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Editor code={code} onChange={setCode} onRun={run} />
            <Toolbar
              onRun={run}
              onReset={resetToDefault}
              onImport={handleImport}
              onExportTsx={exportTsx}
              onExportSvg={exportSvg}
              svgExportEnabled={!!svgSource}
            />
            <VariablePanel
              vars={output.vars ?? {}}
              overrides={overrides}
              onOverrideChange={handleOverrideChange}
            />
          </section>

          {/* Right: Viewport + Errors + Diagnostics */}
          <section style={styles.panel}>
            <SvgViewport
              rendered={rendered}
              error={output.error}
              collector={collector}
              onSvgStats={handleSvgStats}
            />
            <ErrorPanel errors={output.collectedErrors} />
            <Diagnostics
              evalMs={output.evalMs}
              serializeMs={serializeMs}
              svgNodes={svgStats.nodes}
              svgBytes={svgStats.bytes}
              replicadStatus={replicadStatus}
            />
          </section>
        </main>
      </div>
    </ErrorContext.Provider>
  );
}
