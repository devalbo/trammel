import React from 'react';

export type TrammelErrorKind = 'syntax' | 'eval' | 'render' | 'replicad';

export type TrammelError = {
  kind: TrammelErrorKind;
  message: string;
  stack?: string;
  time: number;
};

export class ErrorCollector {
  private errors: TrammelError[] = [];

  report(error: Omit<TrammelError, 'time'>) {
    this.errors.push({ ...error, time: Date.now() });
  }

  clear() {
    this.errors = [];
  }

  getErrors() {
    return [...this.errors];
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}

const ErrorContext = React.createContext<ErrorCollector | null>(null);

export function ErrorProvider({
  collector,
  children,
}: {
  collector: ErrorCollector;
  children: React.ReactNode;
}) {
  return <ErrorContext.Provider value={collector}>{children}</ErrorContext.Provider>;
}

export function useErrorCollector() {
  return React.useContext(ErrorContext);
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  resetKey?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
  resetKey?: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    const collector = this.context as ErrorCollector | null;
    collector?.report({ kind: 'render', message: error.message, stack: error.stack });
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKey && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ error: null, resetKey: this.props.resetKey });
    }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

ErrorBoundary.contextType = ErrorContext;
