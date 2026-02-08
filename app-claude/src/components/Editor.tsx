import React from 'react';
import { styles } from '../styles';

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
}

export function Editor({ code, onChange, onRun }: EditorProps) {
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <textarea
      style={styles.editor}
      value={code}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}
