import React, { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from '../errors/boundary';
import { ErrorCollector } from '../errors/collector';
import { prettyPrintXml } from '../eval/evaluate';
import { styles } from '../styles';

interface SvgViewportProps {
  rendered: React.ReactElement | null;
  error: string | null;
  collector: ErrorCollector;
  onSvgStats: (stats: { source: string; nodes: number; bytes: number; serializeMs: number }) => void;
}

export function SvgViewport({ rendered, error, collector, onSvgStats }: SvgViewportProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'source'>('visual');
  const [svgSource, setSvgSource] = useState('');
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const svg = viewport.querySelector('svg');
    if (!svg) {
      setSvgSource('');
      onSvgStats({ source: '', nodes: 0, bytes: 0, serializeMs: 0 });
      return;
    }
    const t0 = performance.now();
    const raw = new XMLSerializer().serializeToString(svg);
    const pretty = prettyPrintXml(raw);
    const serializeMs = performance.now() - t0;
    setSvgSource(pretty);
    onSvgStats({
      source: pretty,
      nodes: svg.querySelectorAll('*').length + 1,
      bytes: raw.length,
      serializeMs,
    });
  }, [rendered, error, onSvgStats]);

  return (
    <>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>Viewport</h2>
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'visual' ? styles.tabButtonActive : {}),
            }}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('source')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'source' ? styles.tabButtonActive : {}),
            }}
          >
            Source
          </button>
        </div>
      </div>
      <div style={styles.viewport} ref={viewportRef}>
        <ErrorBoundary collector={collector}>
          {activeTab === 'visual' ? (
            rendered ?? <span style={{ color: '#94a3b8' }}>No SVG rendered.</span>
          ) : (
            <pre style={styles.source}>{svgSource || 'No SVG rendered yet.'}</pre>
          )}
        </ErrorBoundary>
      </div>
    </>
  );
}
