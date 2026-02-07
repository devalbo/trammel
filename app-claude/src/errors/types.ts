export type TrammelError =
  | {
      kind: 'syntax';
      message: string;
      line: number;
      column: number;
      source: string;
    }
  | {
      kind: 'eval';
      message: string;
      stack: string;
      line?: number;
    }
  | {
      kind: 'constraint';
      constraint: string;
      message: string;
      inputs: Record<string, unknown>;
      suggestion?: string;
    }
  | {
      kind: 'geometry';
      operation: string;
      message: string;
      suggestion?: string;
    }
  | {
      kind: 'variable';
      variable: string;
      message: string;
      value: unknown;
    }
  | {
      kind: 'render';
      message: string;
      componentStack: string;
    };
