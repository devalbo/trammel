import React from 'react';
import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live';
import * as allExports from '../index';

interface LiveCanvasProps {
  code: string;
  scope?: Record<string, unknown>;
}

export const LiveCanvas: React.FC<LiveCanvasProps> = ({ code, scope }) => (
  <LiveProvider code={code} scope={{ ...allExports, ...scope }}>
    provider
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ padding: 16, background: '#fafafa' }}>
        preview
        <LivePreview />
      </div>
      <LiveError
        style={{
          padding: '8px 16px',
          margin: 0,
          background: '#fff0f0',
          color: '#c00',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      />
      <div style={{ borderTop: '1px solid #e0e0e0' }}>
        editor
        <LiveEditor
          style={{
            fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  </LiveProvider>
);
