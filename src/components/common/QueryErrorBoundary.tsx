import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';
import type { ReactNode } from 'react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function QueryErrorBoundary({ children, fallback }: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-lg font-semibold text-red-600">Something went wrong!</h2>
            <button
              onClick={() => reset()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
