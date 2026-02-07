import { createContext, useContext } from 'react';
import { ErrorCollector } from './collector';

export const ErrorContext = createContext<ErrorCollector>(new ErrorCollector());

export function useErrorCollector(): ErrorCollector {
  return useContext(ErrorContext);
}
