import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Editor } from '../components/Editor';
import { Toolbar } from '../components/Toolbar';
import { ErrorPanel } from '../components/ErrorPanel';
import { VariablePanel } from '../components/VariablePanel';
import { Diagnostics } from '../components/Diagnostics';
import { SvgViewport } from '../components/SvgViewport';
import { ErrorCollector } from '../errors/collector';
import type { TrammelError } from '../errors/types';

// ── Editor ──

describe('Editor', () => {
  it('renders a textarea with the given code', () => {
    render(<Editor code="hello world" onChange={vi.fn()} onRun={vi.fn()} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDefined();
    expect((textarea as HTMLTextAreaElement).value).toBe('hello world');
  });

  it('calls onChange when text is typed', () => {
    const onChange = vi.fn();
    render(<Editor code="" onChange={onChange} onRun={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new code' } });
    expect(onChange).toHaveBeenCalledWith('new code');
  });

  it('calls onRun on Ctrl+Enter', () => {
    const onRun = vi.fn();
    render(<Editor code="" onChange={vi.fn()} onRun={onRun} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('calls onRun on Meta+Enter', () => {
    const onRun = vi.fn();
    render(<Editor code="" onChange={vi.fn()} onRun={onRun} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', metaKey: true });
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('does not call onRun on plain Enter', () => {
    const onRun = vi.fn();
    render(<Editor code="" onChange={vi.fn()} onRun={onRun} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onRun).not.toHaveBeenCalled();
  });
});

// ── Toolbar ──

describe('Toolbar', () => {
  const defaultProps = {
    onRun: vi.fn(),
    onReset: vi.fn(),
    onImport: vi.fn(),
    onExportTsx: vi.fn(),
    onExportSvg: vi.fn(),
    svgExportEnabled: true,
  };

  it('renders all buttons', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Run (Ctrl+Enter)')).toBeDefined();
    expect(screen.getByText('Reset Demo')).toBeDefined();
    expect(screen.getByText('Import .tsx')).toBeDefined();
    expect(screen.getByText('Export .tsx')).toBeDefined();
    expect(screen.getByText('Export .svg')).toBeDefined();
  });

  it('calls onRun when Run clicked', () => {
    const onRun = vi.fn();
    render(<Toolbar {...defaultProps} onRun={onRun} />);
    fireEvent.click(screen.getByText('Run (Ctrl+Enter)'));
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('calls onReset when Reset Demo clicked', () => {
    const onReset = vi.fn();
    render(<Toolbar {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByText('Reset Demo'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('calls onExportTsx when Export .tsx clicked', () => {
    const onExportTsx = vi.fn();
    render(<Toolbar {...defaultProps} onExportTsx={onExportTsx} />);
    fireEvent.click(screen.getByText('Export .tsx'));
    expect(onExportTsx).toHaveBeenCalledOnce();
  });

  it('calls onExportSvg when Export .svg clicked', () => {
    const onExportSvg = vi.fn();
    render(<Toolbar {...defaultProps} onExportSvg={onExportSvg} />);
    fireEvent.click(screen.getByText('Export .svg'));
    expect(onExportSvg).toHaveBeenCalledOnce();
  });

  it('disables Export .svg when svgExportEnabled is false', () => {
    render(<Toolbar {...defaultProps} svgExportEnabled={false} />);
    const btn = screen.getByText('Export .svg');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});

// ── ErrorPanel ──

describe('ErrorPanel', () => {
  it('renders nothing when errors is empty', () => {
    const { container } = render(<ErrorPanel errors={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders error count and messages', () => {
    const errors: TrammelError[] = [
      { kind: 'syntax', message: 'Unexpected token', line: 1, column: 5, source: 'x' },
      { kind: 'eval', message: 'ReferenceError: foo', stack: '' },
    ];
    render(<ErrorPanel errors={errors} />);
    expect(screen.getByText('Errors (2)')).toBeDefined();
    expect(screen.getByText('Unexpected token')).toBeDefined();
    expect(screen.getByText('ReferenceError: foo')).toBeDefined();
  });

  it('renders kind badges', () => {
    const errors: TrammelError[] = [
      { kind: 'syntax', message: 'bad', line: 0, column: 0, source: '' },
    ];
    render(<ErrorPanel errors={errors} />);
    expect(screen.getByText('syntax')).toBeDefined();
  });

  it('renders suggestion when present', () => {
    const errors: TrammelError[] = [
      { kind: 'constraint', constraint: 'align', message: 'failed', inputs: {}, suggestion: 'Try using alignCenterX' },
    ];
    render(<ErrorPanel errors={errors} />);
    expect(screen.getByText(/Try using alignCenterX/)).toBeDefined();
  });
});

// ── VariablePanel ──

describe('VariablePanel', () => {
  it('renders nothing when vars is empty', () => {
    const { container } = render(
      <VariablePanel vars={{}} overrides={{}} onOverrideChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders number inputs for numeric vars', () => {
    render(
      <VariablePanel vars={{ width: 100 }} overrides={{}} onOverrideChange={vi.fn()} />
    );
    expect(screen.getByText('width')).toBeDefined();
    const input = screen.getByLabelText('width') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.value).toBe('100');
  });

  it('renders color inputs for color vars', () => {
    render(
      <VariablePanel vars={{ color: '#ff0000' }} overrides={{}} onOverrideChange={vi.fn()} />
    );
    const input = screen.getByLabelText('color') as HTMLInputElement;
    expect(input.type).toBe('color');
  });

  it('renders checkbox for boolean vars', () => {
    render(
      <VariablePanel vars={{ visible: true }} overrides={{}} onOverrideChange={vi.fn()} />
    );
    const input = screen.getByLabelText('visible') as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);
  });

  it('renders text input for string vars', () => {
    render(
      <VariablePanel vars={{ label: 'hello' }} overrides={{}} onOverrideChange={vi.fn()} />
    );
    const input = screen.getByLabelText('label') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.value).toBe('hello');
  });

  it('uses override value when present', () => {
    render(
      <VariablePanel vars={{ width: 100 }} overrides={{ width: 200 }} onOverrideChange={vi.fn()} />
    );
    const input = screen.getByLabelText('width') as HTMLInputElement;
    expect(input.value).toBe('200');
  });

  it('calls onOverrideChange when number input changes', () => {
    const onOverrideChange = vi.fn();
    render(
      <VariablePanel vars={{ width: 100 }} overrides={{}} onOverrideChange={onOverrideChange} />
    );
    fireEvent.change(screen.getByLabelText('width'), { target: { value: '250' } });
    expect(onOverrideChange).toHaveBeenCalledWith({ width: 250 });
  });

  it('calls onOverrideChange when checkbox toggled', () => {
    const onOverrideChange = vi.fn();
    render(
      <VariablePanel vars={{ visible: false }} overrides={{}} onOverrideChange={onOverrideChange} />
    );
    fireEvent.click(screen.getByLabelText('visible'));
    expect(onOverrideChange).toHaveBeenCalledWith({ visible: true });
  });
});

// ── Diagnostics ──

describe('Diagnostics', () => {
  it('renders all stats', () => {
    render(
      <Diagnostics
        evalMs={12.345}
        serializeMs={1.5}
        svgNodes={42}
        svgBytes={2048}
        replicadStatus={{ state: 'ready', ms: 500 }}
      />
    );
    expect(screen.getByText('Diagnostics')).toBeDefined();
    expect(screen.getByText('12.3 ms')).toBeDefined();
    expect(screen.getByText('1.5 ms')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('2.0 KB')).toBeDefined();
    expect(screen.getByText('Ready (500.0 ms)')).toBeDefined();
  });

  it('shows Loading... when replicad is loading', () => {
    render(
      <Diagnostics
        evalMs={0} serializeMs={0} svgNodes={0} svgBytes={0}
        replicadStatus={{ state: 'loading', ms: 0 }}
      />
    );
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('shows error message when replicad fails', () => {
    render(
      <Diagnostics
        evalMs={0} serializeMs={0} svgNodes={0} svgBytes={0}
        replicadStatus={{ state: 'error', ms: 0, error: 'WASM failed' }}
      />
    );
    expect(screen.getByText('Error: WASM failed')).toBeDefined();
  });

  it('shows Idle when replicad is idle', () => {
    render(
      <Diagnostics
        evalMs={0} serializeMs={0} svgNodes={0} svgBytes={0}
        replicadStatus={{ state: 'idle', ms: 0 }}
      />
    );
    expect(screen.getByText('Idle')).toBeDefined();
  });
});

// ── SvgViewport ──

describe('SvgViewport', () => {
  it('renders placeholder when no element', () => {
    const collector = new ErrorCollector();
    render(
      <SvgViewport rendered={null} error={null} collector={collector} onSvgStats={vi.fn()} />
    );
    expect(screen.getByText('No SVG rendered.')).toBeDefined();
  });

  it('renders Visual and Source tab buttons', () => {
    const collector = new ErrorCollector();
    render(
      <SvgViewport rendered={null} error={null} collector={collector} onSvgStats={vi.fn()} />
    );
    expect(screen.getByText('Visual')).toBeDefined();
    expect(screen.getByText('Source')).toBeDefined();
  });

  it('switches to Source tab and shows placeholder', () => {
    const collector = new ErrorCollector();
    render(
      <SvgViewport rendered={null} error={null} collector={collector} onSvgStats={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Source'));
    expect(screen.getByText('No SVG rendered yet.')).toBeDefined();
  });

  it('renders an SVG element and calls onSvgStats', async () => {
    const collector = new ErrorCollector();
    const onSvgStats = vi.fn();
    const svgElement = <svg data-testid="test-svg"><rect width="10" height="10" /></svg>;

    await act(async () => {
      render(
        <SvgViewport rendered={svgElement} error={null} collector={collector} onSvgStats={onSvgStats} />
      );
    });

    expect(screen.getByTestId('test-svg')).toBeDefined();
    expect(onSvgStats).toHaveBeenCalled();
    const stats = onSvgStats.mock.calls[onSvgStats.mock.calls.length - 1][0];
    expect(stats.nodes).toBeGreaterThan(0);
    expect(stats.bytes).toBeGreaterThan(0);
    expect(typeof stats.source).toBe('string');
    expect(stats.source.length).toBeGreaterThan(0);
  });

  it('shows SVG source in Source tab after rendering', async () => {
    const collector = new ErrorCollector();
    const svgElement = <svg><circle cx="5" cy="5" r="3" /></svg>;

    await act(async () => {
      render(
        <SvgViewport rendered={svgElement} error={null} collector={collector} onSvgStats={vi.fn()} />
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Source'));
    });

    // Source tab should show serialized SVG containing the circle
    const pre = document.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('circle');
  });
});
