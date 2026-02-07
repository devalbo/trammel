import React from 'react';
import type { ErrorCollector } from './collector';

type Props = {
  collector: ErrorCollector;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
  componentStack: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '', componentStack: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
      componentStack: error.stack ?? '',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.collector.report({
      kind: 'render',
      message: error.message,
      componentStack: info.componentStack ?? '',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 12, color: '#be185d', fontSize: 12 }}>
          <strong>Render error:</strong> {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}
