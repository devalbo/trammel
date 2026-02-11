// ── Expression DSL: Tokenizer → Recursive-Descent Parser → AST Evaluator ──

// ── AST ──

export type Expr =
  | { type: 'ref'; id: string; anchor: string }
  | { type: 'self'; anchor: string }
  | { type: 'literal'; value: number }
  | { type: 'binop'; op: '+' | '-' | '*' | '/'; left: Expr; right: Expr };

// ── Tokens ──

export type TokenType =
  | 'NUMBER'
  | 'REF'
  | 'SELF_REF'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

// ── Errors ──

export class ParseError extends Error {
  pos: number;
  constructor(message: string, pos: number) {
    super(message);
    this.name = 'ParseError';
    this.pos = pos;
  }
}

// ── Tokenizer ──

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    // Skip whitespace
    if (input[i] === ' ' || input[i] === '\t' || input[i] === '\n' || input[i] === '\r') {
      i++;
      continue;
    }

    const ch = input[i];

    // Single-character operators and parens
    if (ch === '+') { tokens.push({ type: 'PLUS', value: '+', pos: i }); i++; continue; }
    if (ch === '-') {
      // Check if this is a negative number (unary minus before a digit)
      // Only treat as negative number if: at start, or after operator/lparen
      const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
      const isUnary = !prev || prev.type === 'PLUS' || prev.type === 'MINUS' ||
        prev.type === 'STAR' || prev.type === 'SLASH' || prev.type === 'LPAREN';
      if (isUnary && i + 1 < input.length && (isDigit(input[i + 1]) || input[i + 1] === '.')) {
        const start = i;
        i++; // skip '-'
        i = scanNumber(input, i);
        tokens.push({ type: 'NUMBER', value: input.slice(start, i), pos: start });
        continue;
      }
      tokens.push({ type: 'MINUS', value: '-', pos: i }); i++; continue;
    }
    if (ch === '*') { tokens.push({ type: 'STAR', value: '*', pos: i }); i++; continue; }
    if (ch === '/') { tokens.push({ type: 'SLASH', value: '/', pos: i }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(', pos: i }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')', pos: i }); i++; continue; }

    // Number
    if (isDigit(ch) || ch === '.') {
      const start = i;
      i = scanNumber(input, i);
      tokens.push({ type: 'NUMBER', value: input.slice(start, i), pos: start });
      continue;
    }

    // $self.anchor
    if (ch === '$') {
      const start = i;
      if (input.slice(i, i + 5) !== '$self') {
        throw new ParseError(`Expected "$self" at position ${i}`, i);
      }
      i += 5;
      if (i >= input.length || input[i] !== '.') {
        throw new ParseError(`Expected "." after "$self" at position ${i}`, i);
      }
      i++; // skip '.'
      const anchorStart = i;
      if (i >= input.length || !isIdChar(input[i])) {
        throw new ParseError(`Expected anchor name after "$self." at position ${i}`, i);
      }
      i++; // consume first anchor char
      while (i < input.length && (isIdChar(input[i]) || input[i] === '.')) i++;
      tokens.push({ type: 'SELF_REF', value: input.slice(start, i), pos: start });
      continue;
    }

    // #id.anchor
    if (ch === '#') {
      const start = i;
      i++; // skip '#'
      const idStart = i;
      while (i < input.length && isIdChar(input[i])) i++;
      if (i === idStart) {
        throw new ParseError(`Expected identifier after "#" at position ${i}`, i);
      }
      if (i >= input.length || input[i] !== '.') {
        throw new ParseError(`Expected "." after shape ID at position ${i}`, i);
      }
      i++; // skip '.'
      const anchorStart = i;
      if (i >= input.length || !isIdChar(input[i])) {
        throw new ParseError(`Expected anchor name after "." at position ${i}`, i);
      }
      i++; // consume first anchor char
      while (i < input.length && (isIdChar(input[i]) || input[i] === '.')) i++;
      tokens.push({ type: 'REF', value: input.slice(start, i), pos: start });
      continue;
    }

    throw new ParseError(`Unexpected character '${ch}' at position ${i}`, i);
  }

  tokens.push({ type: 'EOF', value: '', pos: i });
  return tokens;
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isIdChar(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
    (ch >= '0' && ch <= '9') || ch === '_' || ch === '-';
}

function scanNumber(input: string, i: number): number {
  let hasDot = false;
  while (i < input.length) {
    if (isDigit(input[i])) {
      i++;
    } else if (input[i] === '.' && !hasDot) {
      hasDot = true;
      i++;
    } else {
      break;
    }
  }
  return i;
}

// ── Parser (recursive descent) ──
//
// Grammar:
//   expr   = term (('+' | '-') term)*
//   term   = factor (('*' | '/') factor)*
//   factor = ref | number | '(' expr ')' | unaryMinus factor
//   ref    = ('#' id '.' anchor) | ('$self' '.' anchor)

export function parseExpr(input: string): Expr {
  const tokens = tokenize(input);
  let pos = 0;

  function peek(): Token {
    return tokens[pos];
  }

  function advance(): Token {
    return tokens[pos++];
  }

  function expect(type: TokenType): Token {
    const tok = peek();
    if (tok.type !== type) {
      throw new ParseError(
        `Expected ${type} but got ${tok.type} ("${tok.value}") at position ${tok.pos}`,
        tok.pos,
      );
    }
    return advance();
  }

  function parseExprRule(): Expr {
    let left = parseTerm();
    while (peek().type === 'PLUS' || peek().type === 'MINUS') {
      const opTok = advance();
      const op = opTok.value as '+' | '-';
      const right = parseTerm();
      left = { type: 'binop', op, left, right };
    }
    return left;
  }

  function parseTerm(): Expr {
    let left = parseFactor();
    while (peek().type === 'STAR' || peek().type === 'SLASH') {
      const opTok = advance();
      const op = opTok.value as '*' | '/';
      const right = parseFactor();
      left = { type: 'binop', op, left, right };
    }
    return left;
  }

  function parseFactor(): Expr {
    const tok = peek();

    if (tok.type === 'NUMBER') {
      advance();
      return { type: 'literal', value: parseFloat(tok.value) };
    }

    if (tok.type === 'REF') {
      advance();
      // Parse "#id.anchor"
      const dotIdx = tok.value.indexOf('.');
      const id = tok.value.slice(1, dotIdx);
      const anchor = tok.value.slice(dotIdx + 1);
      return { type: 'ref', id, anchor };
    }

    if (tok.type === 'SELF_REF') {
      advance();
      // Parse "$self.anchor"
      const anchor = tok.value.slice(6); // skip "$self."
      return { type: 'self', anchor };
    }

    if (tok.type === 'LPAREN') {
      advance();
      const expr = parseExprRule();
      expect('RPAREN');
      return expr;
    }

    throw new ParseError(
      `Unexpected token ${tok.type} ("${tok.value}") at position ${tok.pos}`,
      tok.pos,
    );
  }

  const ast = parseExprRule();
  if (peek().type !== 'EOF') {
    const tok = peek();
    throw new ParseError(
      `Unexpected token ${tok.type} ("${tok.value}") at position ${tok.pos}, expected end of expression`,
      tok.pos,
    );
  }
  return ast;
}

// ── Evaluator ──

export type RefLookup = (id: string, anchor: string) => number;

export function evaluate(ast: Expr, lookupRef: RefLookup): number {
  switch (ast.type) {
    case 'literal':
      return ast.value;
    case 'ref':
      return lookupRef(ast.id, ast.anchor);
    case 'self':
      return lookupRef('$self', ast.anchor);
    case 'binop': {
      const left = evaluate(ast.left, lookupRef);
      const right = evaluate(ast.right, lookupRef);
      switch (ast.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
      }
    }
  }
}

// ── Convenience ──

export function parseAndEvaluate(input: string, lookupRef: RefLookup): number {
  return evaluate(parseExpr(input), lookupRef);
}

/** Walk the AST and collect all anchor names referenced (for axis validation). */
export function collectAnchors(ast: Expr): string[] {
  const anchors: string[] = [];
  function walk(node: Expr): void {
    switch (node.type) {
      case 'ref':
        anchors.push(node.anchor);
        break;
      case 'self':
        anchors.push(node.anchor);
        break;
      case 'binop':
        walk(node.left);
        walk(node.right);
        break;
    }
  }
  walk(ast);
  return anchors;
}
