import { Suspense, type ReactNode } from 'react';
import { QueryErrorBoundary } from './QueryErrorBoundary';

interface QuerySuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function QuerySuspense({ children, fallback, errorFallback }: QuerySuspenseProps) {
  return (
    <QueryErrorBoundary fallback={errorFallback}>
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </QueryErrorBoundary>
  );
}
