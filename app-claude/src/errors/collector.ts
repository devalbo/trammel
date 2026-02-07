import type { TrammelError } from './types';

export class ErrorCollector {
  private errors: TrammelError[] = [];

  report(error: TrammelError): void {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): TrammelError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }
}
