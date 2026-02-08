import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CodexApp } from '../CodexApp';

vi.mock('../replicad/init', () => ({
  initReplicad: vi.fn(async () => ({ ok: true, ms: 0 })),
}));

vi.mock('replicad', () => ({
  draw: () => ({
    rect: () => ({
      chamfer: () => ({
        toSVGPaths: () => [''],
      }),
    }),
  }),
  drawRoundedRectangle: () => ({
    toSVGPaths: () => [''],
  }),
  drawRectangle: () => ({
    toSVGPaths: () => [''],
  }),
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

  it('loads all demos without errors', async () => {
    const { container, getByLabelText, queryByText } = await act(async () => render(<CodexApp />));
    const select = getByLabelText('Demo') as HTMLSelectElement;
    expect(select).toBeTruthy();

    const errorTab = queryByText('Error');
    if (errorTab) {
      fireEvent.click(errorTab);
    }

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();

    const values = Array.from(select.options).map((option) => option.value);
    for (const value of values) {
      fireEvent.change(select, { target: { value } });
      await waitFor(() => {
        expect(queryByText('No errors.')).toBeTruthy();
      });
      await waitFor(() => {
        expect(textarea.value.length).toBeGreaterThan(0);
      });
    }
  });
});
