import { describe, it, expect } from 'vitest';
import { ErrorCollector } from '../errors/collector';
import type { TrammelError } from '../errors/types';

describe('ErrorCollector', () => {
  it('starts empty', () => {
    const c = new ErrorCollector();
    expect(c.hasErrors()).toBe(false);
    expect(c.getErrors()).toEqual([]);
  });

  it('report adds an error', () => {
    const c = new ErrorCollector();
    c.report({ kind: 'syntax', message: 'bad', line: 1, column: 0, source: 'x' });
    expect(c.hasErrors()).toBe(true);
    expect(c.getErrors().length).toBe(1);
  });

  it('report accumulates multiple errors', () => {
    const c = new ErrorCollector();
    c.report({ kind: 'syntax', message: 'a', line: 1, column: 0, source: '' });
    c.report({ kind: 'eval', message: 'b', stack: '' });
    c.report({ kind: 'constraint', constraint: 'foo', message: 'c', inputs: {} });
    expect(c.getErrors().length).toBe(3);
  });

  it('getErrors returns a copy', () => {
    const c = new ErrorCollector();
    c.report({ kind: 'eval', message: 'err', stack: '' });
    const errors = c.getErrors();
    errors.pop();
    // original should be unchanged
    expect(c.getErrors().length).toBe(1);
  });

  it('clear removes all errors', () => {
    const c = new ErrorCollector();
    c.report({ kind: 'eval', message: 'err', stack: '' });
    c.report({ kind: 'eval', message: 'err2', stack: '' });
    expect(c.hasErrors()).toBe(true);
    c.clear();
    expect(c.hasErrors()).toBe(false);
    expect(c.getErrors()).toEqual([]);
  });

  it('preserves error kind discriminant', () => {
    const c = new ErrorCollector();
    const syntaxErr: TrammelError = { kind: 'syntax', message: 'm', line: 5, column: 3, source: 'src' };
    const evalErr: TrammelError = { kind: 'eval', message: 'e', stack: 'st' };
    const constraintErr: TrammelError = { kind: 'constraint', constraint: 'align', message: 'c', inputs: { x: 1 }, suggestion: 'try Y' };
    const geometryErr: TrammelError = { kind: 'geometry', operation: 'fuse', message: 'g' };
    const variableErr: TrammelError = { kind: 'variable', variable: 'width', message: 'v', value: -1 };
    const renderErr: TrammelError = { kind: 'render', message: 'r', componentStack: 'Root > Child' };

    c.report(syntaxErr);
    c.report(evalErr);
    c.report(constraintErr);
    c.report(geometryErr);
    c.report(variableErr);
    c.report(renderErr);

    const errors = c.getErrors();
    expect(errors[0].kind).toBe('syntax');
    expect(errors[1].kind).toBe('eval');
    expect(errors[2].kind).toBe('constraint');
    expect(errors[3].kind).toBe('geometry');
    expect(errors[4].kind).toBe('variable');
    expect(errors[5].kind).toBe('render');

    // Check specific fields are preserved
    const ce = errors[2] as Extract<TrammelError, { kind: 'constraint' }>;
    expect(ce.suggestion).toBe('try Y');
    expect(ce.inputs).toEqual({ x: 1 });
  });
});
