import React from 'react';

interface VariablePanelProps {
  vars: Record<string, unknown>;
  overrides: Record<string, unknown>;
  onOverrideChange: (overrides: Record<string, unknown>) => void;
}

export function VariablePanel({ vars, overrides, onOverrideChange }: VariablePanelProps) {
  const entries = Object.entries(vars);
  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#52606d' }}>Variables</h3>
      <div style={{ display: 'grid', gap: 6 }}>
        {entries.map(([key, value]) => {
          const id = `var-${key}`;
          const type = typeof value;
          const isColor = type === 'string' && String(value).startsWith('#');
          const inputType = isColor ? 'color' : type === 'number' ? 'number' : type === 'boolean' ? 'checkbox' : 'text';
          return (
            <label key={key} htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#52606d', minWidth: 100 }}>{key}</span>
              {inputType === 'checkbox' ? (
                <input
                  id={id}
                  type="checkbox"
                  checked={Boolean(overrides[key] ?? value)}
                  onChange={(e) => {
                    onOverrideChange({ ...overrides, [key]: e.target.checked });
                  }}
                />
              ) : (
                <input
                  id={id}
                  type={inputType}
                  value={String(overrides[key] ?? value)}
                  onChange={(e) => {
                    const v = inputType === 'number' ? Number(e.target.value) : e.target.value;
                    onOverrideChange({ ...overrides, [key]: v });
                  }}
                  style={{
                    flex: 1,
                    border: '1px solid #cbd2d9',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 12,
                  }}
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
