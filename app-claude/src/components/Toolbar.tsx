import React, { useRef } from 'react';
import { styles } from '../styles';

interface ToolbarProps {
  onRun: () => void;
  onReset: () => void;
  onImport: (text: string) => void;
  onExportTsx: () => void;
  onExportSvg: () => void;
  svgExportEnabled: boolean;
}

export function Toolbar({ onRun, onReset, onImport, onExportTsx, onExportSvg, svgExportEnabled }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onImport(text);
    e.target.value = '';
  };

  return (
    <div style={styles.actions}>
      <button style={styles.button} type="button" onClick={onRun}>
        Run (Ctrl+Enter)
      </button>
      <button style={styles.buttonSecondary} type="button" onClick={onReset}>
        Reset Demo
      </button>
      <button style={styles.buttonGhost} type="button" onClick={() => fileInputRef.current?.click()}>
        Import .tsx
      </button>
      <button style={styles.buttonGhost} type="button" onClick={onExportTsx}>
        Export .tsx
      </button>
      <button style={styles.buttonGhost} type="button" onClick={onExportSvg} disabled={!svgExportEnabled}>
        Export .svg
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".tsx,.ts,.txt"
        style={{ display: 'none' }}
        onChange={onImportFile}
      />
    </div>
  );
}
