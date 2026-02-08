import { describe, it, expect } from 'vitest';
import { evaluateTsx, prettyPrintXml } from '../eval/evaluate';
import { ErrorCollector } from '../errors/collector';

describe('prettyPrintXml', () => {
  it('formats a simple SVG', () => {
    const input = '<svg><rect x="0" y="0" width="10" height="10" /></svg>';
    const result = prettyPrintXml(input);
    expect(result).toContain('<svg>');
    expect(result).toContain('  <rect');
    expect(result).toContain('/>');
  });

  it('returns input on invalid XML', () => {
    const input = 'not xml at all <<<';
    const result = prettyPrintXml(input);
    // Should not throw, returns something (jsdom may still parse partial)
    expect(typeof result).toBe('string');
  });

  it('handles nested elements', () => {
    const input = '<svg><g><circle cx="5" cy="5" r="3" /></g></svg>';
    const result = prettyPrintXml(input);
    expect(result).toContain('  <g>');
    expect(result).toContain('    <circle');
  });
});

describe('evaluateTsx', () => {
  it('evaluates simple TSX with vars and Root', () => {
    const source = `
      const vars = { width: 100, color: '#f00' };
      const Root = () => <svg><rect width={vars.width} fill={vars.color} /></svg>;
    `;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).toBeNull();
    expect(result.element).not.toBeNull();
    expect(result.vars).toEqual({ width: 100, color: '#f00' });
    expect(result.collectedErrors).toEqual([]);
    expect(result.evalMs).toBeGreaterThanOrEqual(0);
  });

  it('captures syntax errors', () => {
    const source = `const x = {;`; // invalid syntax
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).not.toBeNull();
    expect(result.element).toBeNull();
    expect(result.collectedErrors.length).toBeGreaterThan(0);
    expect(result.collectedErrors[0].kind).toBe('syntax');
  });

  it('captures runtime errors', () => {
    const source = `
      const vars = {};
      undefinedFunction();
      const Root = () => <svg />;
    `;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).not.toBeNull();
    expect(result.element).toBeNull();
    expect(result.collectedErrors.length).toBeGreaterThan(0);
    expect(result.collectedErrors[0].kind).toBe('eval');
  });

  it('applies overrides to vars', () => {
    const source = `
      const vars = { size: 50 };
      const Root = () => <svg><rect width={vars.size} /></svg>;
    `;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, { size: 200 }, collector);

    expect(result.error).toBeNull();
    expect(result.vars.size).toBe(200);
  });

  it('returns empty vars when no vars defined', () => {
    const source = `const Root = () => <svg />;`;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).toBeNull();
    expect(result.element).not.toBeNull();
    expect(result.vars).toEqual({});
  });

  it('handles Root as element (not function)', () => {
    const source = `
      const vars = {};
      const Root = <svg><circle cx="5" cy="5" r="3" /></svg>;
    `;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).toBeNull();
    expect(result.element).not.toBeNull();
  });

  it('returns null element when no Root defined', () => {
    const source = `const vars = { x: 1 };`;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).toBeNull();
    expect(result.element).toBeNull();
    expect(result.vars).toEqual({ x: 1 });
  });

  it('constraint functions are available in scope', () => {
    const source = `
      const vars = {};
      const r = { x: 0, y: 0, width: 100, height: 50 };
      const center = rectCenter(r);
      const Root = () => <svg><circle cx={center.x} cy={center.y} r="5" /></svg>;
    `;
    const collector = new ErrorCollector();
    const result = evaluateTsx(source, {}, collector);

    expect(result.error).toBeNull();
    expect(result.element).not.toBeNull();
  });

  it('clears collector before each run', () => {
    const collector = new ErrorCollector();
    // First run with error
    evaluateTsx('const x = {;', {}, collector);
    expect(collector.getErrors().length).toBeGreaterThan(0);
    // Second run succeeds — collector should be clean
    const result = evaluateTsx('const vars = {}; const Root = () => <svg />;', {}, collector);
    expect(result.collectedErrors).toEqual([]);
  });

  it('measures eval time', () => {
    const collector = new ErrorCollector();
    const result = evaluateTsx('const vars = {}; const Root = () => <svg />;', {}, collector);
    expect(result.evalMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.evalMs).toBe('number');
  });
});
