import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CodexApp } from '../CodexApp';

vi.mock('../replicad/init', () => ({
  initReplicad: vi.fn(async () => ({ ok: true, ms: 0 })),
}));

vi.mock('esbuild-wasm', () => ({
  initialize: vi.fn(async () => {}),
  build: vi.fn(async () => ({ outputFiles: [{ text: 'export const __TRAMMEL_RESULT__ = { element: null, vars: {} };' }] })),
  transform: vi.fn(async () => ({ code: '' })),
}));

describe('CodexApp', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the hello world content', async () => {
    const { container } = await act(async () => render(<CodexApp />));
    await waitFor(() => {
      expect(container.textContent).toContain('trammel codex');
    });
  });

  it('renders an SVG and shows serialized source', async () => {
    const { container, getByText } = await act(async () => render(<CodexApp />));
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });

    fireEvent.click(getByText('Source'));
    await waitFor(() => {
      expect(container.textContent).toContain('<svg');
    });
  });

  it('persists edited code to localStorage', async () => {
    const { container } = await act(async () => render(<CodexApp />));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();

    fireEvent.change(textarea as HTMLTextAreaElement, {
      target: { value: 'const vars = { width: 123 };' },
    });

    await waitFor(() => {
      const stored = localStorage.getItem('trammel-codex') ?? '';
      expect(stored).toContain('width: 123');
    });
  });
});
