import { describe, it, expect } from 'vitest';
import {
  tokenize, parseExpr, evaluate, parseAndEvaluate, collectAnchors, ParseError,
} from '../claude-render/primitives/ExprParser';
import type { Expr, Token, RefLookup } from '../claude-render/primitives/ExprParser';
import { AnchorRegistry } from '../claude-render/primitives/SolverContext';

// ── Tokenizer ──

describe('tokenize', () => {
  it('tokenizes a plain number', () => {
    const tokens = tokenize('42');
    expect(tokens).toHaveLength(2); // NUMBER + EOF
    expect(tokens[0]).toMatchObject({ type: 'NUMBER', value: '42' });
  });

  it('tokenizes a decimal number', () => {
    const tokens = tokenize('3.14');
    expect(tokens[0]).toMatchObject({ type: 'NUMBER', value: '3.14' });
  });

  it('tokenizes a ref #id.anchor', () => {
    const tokens = tokenize('#box.right');
    expect(tokens[0]).toMatchObject({ type: 'REF', value: '#box.right' });
  });

  it('tokenizes a ref with hyphens and digits', () => {
    const tokens = tokenize('#my-box2.centerX');
    expect(tokens[0]).toMatchObject({ type: 'REF', value: '#my-box2.centerX' });
  });

  it('tokenizes $self.anchor', () => {
    const tokens = tokenize('$self.width');
    expect(tokens[0]).toMatchObject({ type: 'SELF_REF', value: '$self.width' });
  });

  it('tokenizes operators', () => {
    const tokens = tokenize('+ - * /');
    expect(tokens.map(t => t.type)).toEqual(['PLUS', 'MINUS', 'STAR', 'SLASH', 'EOF']);
  });

  it('tokenizes parentheses', () => {
    const tokens = tokenize('()');
    expect(tokens[0]).toMatchObject({ type: 'LPAREN' });
    expect(tokens[1]).toMatchObject({ type: 'RPAREN' });
  });

  it('skips whitespace', () => {
    const tokens = tokenize('  42  +  10  ');
    expect(tokens).toHaveLength(4); // NUMBER, PLUS, NUMBER, EOF
  });

  it('tokenizes a complex expression', () => {
    const tokens = tokenize('#a.right + (#b.width * 2) - 10');
    const types = tokens.map(t => t.type);
    expect(types).toEqual([
      'REF', 'PLUS', 'LPAREN', 'REF', 'STAR', 'NUMBER', 'RPAREN', 'MINUS', 'NUMBER', 'EOF',
    ]);
  });

  it('records token positions', () => {
    const tokens = tokenize('#a.x + 5');
    expect(tokens[0].pos).toBe(0);  // #a.x starts at 0
    expect(tokens[1].pos).toBe(5);  // + at 5
    expect(tokens[2].pos).toBe(7);  // 5 at 7
  });

  it('tokenizes a negative number at start', () => {
    const tokens = tokenize('-5');
    expect(tokens[0]).toMatchObject({ type: 'NUMBER', value: '-5' });
  });

  it('tokenizes negative number after operator', () => {
    const tokens = tokenize('10 + -3');
    expect(tokens.map(t => t.type)).toEqual(['NUMBER', 'PLUS', 'NUMBER', 'EOF']);
    expect(tokens[2].value).toBe('-3');
  });

  it('tokenizes minus after number as MINUS operator', () => {
    const tokens = tokenize('10 - 3');
    expect(tokens.map(t => t.type)).toEqual(['NUMBER', 'MINUS', 'NUMBER', 'EOF']);
  });

  it('errors on unexpected character', () => {
    expect(() => tokenize('10 & 5')).toThrow(ParseError);
  });

  it('errors on incomplete ref (no dot)', () => {
    expect(() => tokenize('#box')).toThrow(ParseError);
  });

  it('errors on incomplete $self (no dot)', () => {
    expect(() => tokenize('$self')).toThrow(ParseError);
  });
});

// ── Parser ──

describe('parseExpr', () => {
  it('parses a literal', () => {
    const ast = parseExpr('42');
    expect(ast).toEqual({ type: 'literal', value: 42 });
  });

  it('parses a decimal literal', () => {
    const ast = parseExpr('3.14');
    expect(ast).toEqual({ type: 'literal', value: 3.14 });
  });

  it('parses a ref', () => {
    const ast = parseExpr('#box.right');
    expect(ast).toEqual({ type: 'ref', id: 'box', anchor: 'right' });
  });

  it('parses a $self ref', () => {
    const ast = parseExpr('$self.width');
    expect(ast).toEqual({ type: 'self', anchor: 'width' });
  });

  it('parses addition', () => {
    const ast = parseExpr('#a.right + 10');
    expect(ast).toEqual({
      type: 'binop', op: '+',
      left: { type: 'ref', id: 'a', anchor: 'right' },
      right: { type: 'literal', value: 10 },
    });
  });

  it('parses subtraction', () => {
    const ast = parseExpr('#a.right - 5');
    expect(ast).toEqual({
      type: 'binop', op: '-',
      left: { type: 'ref', id: 'a', anchor: 'right' },
      right: { type: 'literal', value: 5 },
    });
  });

  it('parses multiplication', () => {
    const ast = parseExpr('$self.width * 0.75');
    expect(ast).toEqual({
      type: 'binop', op: '*',
      left: { type: 'self', anchor: 'width' },
      right: { type: 'literal', value: 0.75 },
    });
  });

  it('precedence: * binds tighter than +', () => {
    // 1 + 2 * 3 should parse as 1 + (2 * 3)
    const ast = parseExpr('1 + 2 * 3');
    expect(ast).toEqual({
      type: 'binop', op: '+',
      left: { type: 'literal', value: 1 },
      right: {
        type: 'binop', op: '*',
        left: { type: 'literal', value: 2 },
        right: { type: 'literal', value: 3 },
      },
    });
  });

  it('parentheses override precedence', () => {
    // (1 + 2) * 3 should parse as (1 + 2) * 3
    const ast = parseExpr('(1 + 2) * 3');
    expect(ast).toEqual({
      type: 'binop', op: '*',
      left: {
        type: 'binop', op: '+',
        left: { type: 'literal', value: 1 },
        right: { type: 'literal', value: 2 },
      },
      right: { type: 'literal', value: 3 },
    });
  });

  it('left-associative: a - b - c = (a - b) - c', () => {
    const ast = parseExpr('10 - 3 - 2');
    expect(ast).toEqual({
      type: 'binop', op: '-',
      left: {
        type: 'binop', op: '-',
        left: { type: 'literal', value: 10 },
        right: { type: 'literal', value: 3 },
      },
      right: { type: 'literal', value: 2 },
    });
  });

  it('complex expression with multiple refs and parens', () => {
    const ast = parseExpr('#a.width + (#b.width * 2) - 10');
    expect(ast.type).toBe('binop');
  });

  it('errors on empty input', () => {
    expect(() => parseExpr('')).toThrow(ParseError);
  });

  it('errors on trailing tokens', () => {
    expect(() => parseExpr('42 42')).toThrow(ParseError);
  });
});

// ── Evaluator ──

describe('evaluate', () => {
  const lookup: RefLookup = (id, anchor) => {
    const data: Record<string, Record<string, number>> = {
      a: { right: 100, width: 50, left: 50 },
      b: { right: 200, width: 80, left: 120 },
    };
    const shape = data[id];
    if (!shape) throw new Error(`Shape "${id}" not found`);
    const val = shape[anchor];
    if (val === undefined) throw new Error(`Anchor "${anchor}" not found on "${id}"`);
    return val;
  };

  it('evaluates a literal', () => {
    expect(evaluate({ type: 'literal', value: 42 }, lookup)).toBe(42);
  });

  it('evaluates a ref', () => {
    expect(evaluate({ type: 'ref', id: 'a', anchor: 'right' }, lookup)).toBe(100);
  });

  it('evaluates addition', () => {
    const ast = parseExpr('#a.right + 10');
    expect(evaluate(ast, lookup)).toBe(110);
  });

  it('evaluates subtraction', () => {
    const ast = parseExpr('#b.right - 50');
    expect(evaluate(ast, lookup)).toBe(150);
  });

  it('evaluates multiplication', () => {
    const ast = parseExpr('#a.width * 2');
    expect(evaluate(ast, lookup)).toBe(100);
  });

  it('evaluates division', () => {
    const ast = parseExpr('#b.width / 4');
    expect(evaluate(ast, lookup)).toBe(20);
  });

  it('respects operator precedence', () => {
    // #a.right + #a.width * 2 = 100 + (50 * 2) = 200
    const ast = parseExpr('#a.right + #a.width * 2');
    expect(evaluate(ast, lookup)).toBe(200);
  });

  it('respects parentheses', () => {
    // (#a.right + #a.width) * 2 = (100 + 50) * 2 = 300
    const ast = parseExpr('(#a.right + #a.width) * 2');
    expect(evaluate(ast, lookup)).toBe(300);
  });

  it('complex multi-ref expression', () => {
    // #a.width + (#b.width * 2) - 10 = 50 + (80 * 2) - 10 = 200
    expect(parseAndEvaluate('#a.width + (#b.width * 2) - 10', lookup)).toBe(200);
  });

  it('propagates lookup errors', () => {
    expect(() => parseAndEvaluate('#missing.right', lookup)).toThrow('Shape "missing" not found');
  });
});

// ── collectAnchors ──

describe('collectAnchors', () => {
  it('returns empty for a literal', () => {
    expect(collectAnchors(parseExpr('42'))).toEqual([]);
  });

  it('collects from a single ref', () => {
    expect(collectAnchors(parseExpr('#a.right'))).toEqual(['right']);
  });

  it('collects from $self ref', () => {
    expect(collectAnchors(parseExpr('$self.width'))).toEqual(['width']);
  });

  it('collects from multiple refs in complex expr', () => {
    const anchors = collectAnchors(parseExpr('#a.right + #b.left * $self.width'));
    expect(anchors).toEqual(['right', 'left', 'width']);
  });
});

// ── Backward compatibility: AnchorRegistry.resolve() ──

describe('AnchorRegistry.resolve backward compat', () => {
  function makeRegistry() {
    const reg = new AnchorRegistry();
    reg.register('a', { left: 10, right: 110, width: 100, centerX: 60, top: 20, bottom: 70, height: 50 });
    reg.register('b', { left: 120, right: 200, width: 80 });
    return reg;
  }

  it('resolves a simple ref: #a.right', () => {
    const reg = makeRegistry();
    expect(reg.resolve('#a.right')).toBe(110);
  });

  it('resolves ref + literal: #a.right + 10', () => {
    const reg = makeRegistry();
    expect(reg.resolve('#a.right + 10')).toBe(120);
  });

  it('resolves ref * literal: #a.width * 0.5', () => {
    const reg = makeRegistry();
    expect(reg.resolve('#a.width * 0.5')).toBe(50);
  });

  it('resolves $self ref with selfId', () => {
    const reg = makeRegistry();
    expect(reg.resolve('$self.width * 2', 'a')).toBe(200);
  });

  it('resolves complex expression: #a.right + #b.width', () => {
    const reg = makeRegistry();
    expect(reg.resolve('#a.right + #b.width')).toBe(190);
  });

  it('resolves complex expression: #a.width + (#b.width * 2) - 10', () => {
    const reg = makeRegistry();
    expect(reg.resolve('#a.width + (#b.width * 2) - 10')).toBe(250);
  });

  it('errors for unknown shape', () => {
    const reg = makeRegistry();
    expect(() => reg.resolve('#missing.right')).toThrow('shape "missing" not found');
  });

  it('errors for unknown anchor', () => {
    const reg = makeRegistry();
    expect(() => reg.resolve('#a.missing')).toThrow('anchor "missing" not found on shape "a"');
  });

  it('resolveWithAxisCheck still detects cross-axis warnings', () => {
    const reg = makeRegistry();
    // Using a y-axis anchor (top) for an x-axis prop
    reg.resolveWithAxisCheck('#a.top', 'x', 'x', 'test');
    expect(reg.diagnostics).toHaveLength(1);
    expect(reg.diagnostics[0].level).toBe('warning');
    expect(reg.diagnostics[0].message).toContain('y-axis anchor');
  });

  it('resolveWithAxisCheck validates all anchors in complex expression', () => {
    const reg = makeRegistry();
    // Expression mixes x-axis (right) and y-axis (top) - should warn about top
    reg.resolveWithAxisCheck('#a.right + #a.top', 'x', 'x', 'test');
    expect(reg.diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(reg.diagnostics.some(d => d.message.includes('y-axis anchor'))).toBe(true);
  });
});
