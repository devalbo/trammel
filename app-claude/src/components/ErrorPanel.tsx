import React from 'react';
import type { TrammelError } from '../errors/types';
import { styles, errorKindColors } from '../styles';

interface ErrorPanelProps {
  errors: TrammelError[];
}

export function ErrorPanel({ errors }: ErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div style={styles.errorPanel}>
      <strong>Errors ({errors.length})</strong>
      {errors.map((err, i) => (
        <div key={i} style={{ marginTop: 6 }}>
          <span
            style={{
              ...styles.errorBadge,
              background: errorKindColors[err.kind] ?? '#666',
              color: '#fff',
            }}
          >
            {err.kind}
          </span>
          <span>{err.message}</span>
          {'suggestion' in err && err.suggestion && (
            <div style={{ marginTop: 2, color: '#4a5568', fontSize: 11 }}>
              Suggestion: {err.suggestion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
