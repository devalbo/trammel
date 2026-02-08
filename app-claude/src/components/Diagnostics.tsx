import React from 'react';
import { styles } from '../styles';

interface DiagnosticsProps {
  evalMs: number;
  serializeMs: number;
  svgNodes: number;
  svgBytes: number;
  replicadStatus: {
    state: 'idle' | 'loading' | 'ready' | 'error';
    ms: number;
    error?: string;
  };
}

export function Diagnostics({ evalMs, serializeMs, svgNodes, svgBytes, replicadStatus }: DiagnosticsProps) {
  return (
    <div style={styles.diagnostics}>
      <h3 style={styles.diagTitle}>Diagnostics</h3>
      <div style={styles.diagRow}>
        <span>Eval time</span>
        <span>{evalMs.toFixed(1)} ms</span>
      </div>
      <div style={styles.diagRow}>
        <span>Serialize time</span>
        <span>{serializeMs.toFixed(1)} ms</span>
      </div>
      <div style={styles.diagRow}>
        <span>SVG nodes</span>
        <span>{svgNodes}</span>
      </div>
      <div style={styles.diagRow}>
        <span>SVG size</span>
        <span>{(svgBytes / 1024).toFixed(1)} KB</span>
      </div>
      <div style={styles.diagRow}>
        <span>Replicad</span>
        <span>
          {replicadStatus.state === 'ready'
            ? `Ready (${replicadStatus.ms.toFixed(1)} ms)`
            : replicadStatus.state === 'loading'
              ? 'Loading...'
              : replicadStatus.state === 'error'
                ? `Error: ${replicadStatus.error}`
                : 'Idle'}
        </span>
      </div>
    </div>
  );
}
