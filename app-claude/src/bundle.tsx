import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';

type MountOptions = {
  element: HTMLElement;
};

type ClaudeBundleApi = {
  mount: (options: MountOptions) => void;
  unmount: (element: HTMLElement) => void;
};

const roots = new Map<HTMLElement, Root>();

const api: ClaudeBundleApi = {
  mount({ element }) {
    const root = createRoot(element);
    roots.set(element, root);
    root.render(
      <React.StrictMode>
        <App />
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

(window as Window & { TrammelClaude?: ClaudeBundleApi }).TrammelClaude = api;
