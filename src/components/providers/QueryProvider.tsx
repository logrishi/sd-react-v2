import { type ReactNode, useEffect } from "react";
import { QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import { hydrate } from "@tanstack/react-query";
import { queryClient } from "@/services/backend/react-query-wrapper";

type QueryProviderProps = {
  children: ReactNode;
  dehydratedState?: DehydratedState;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
};

export function QueryProvider({ children, dehydratedState, loadingFallback, errorFallback }: QueryProviderProps) {
  useEffect(() => {
    if (dehydratedState) {
      hydrate(queryClient, dehydratedState);
    }
  }, [dehydratedState]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* <QuerySuspense fallback={loadingFallback} errorFallback={errorFallback}>
        {children}
      </QuerySuspense> */}
    </QueryClientProvider>
  );
}
