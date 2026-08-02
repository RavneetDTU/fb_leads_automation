import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,       // 10s — aligns with polling interval
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations don't retry by default — intentional for optimistic toggles
      retry: 0,
    },
  },
});
