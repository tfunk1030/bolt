import React from 'react';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return <RQProvider client={queryClient}>{children}</RQProvider>;
}

export { queryClient };
