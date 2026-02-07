import React from 'react';
import { createRoot, Root } from 'react-dom/client';
// import App from './App';

type MountOptions = {
  element: HTMLElement;
};

type CodexBundleApi = {
  mount: (options: MountOptions) => void;
  unmount: (element: HTMLElement) => void;
};

const roots = new Map<HTMLElement, Root>();

const api: CodexBundleApi = {
  mount({ element }) {
    const root = createRoot(element);
    roots.set(element, root);
    root.render(
      <React.StrictMode>
        {/* <App /> */}<div>Hello, Codex!</div>
      </React.StrictMode>
    );
  },
  unmount(element) {
    const root = roots.get(element);
    if (root) {
      root.unmount();
      roots.delete(element);
    }
  },
};

// Expose on window for app-ref loader.
(window as Window & { TrammelCodex?: CodexBundleApi }).TrammelCodex = api;
