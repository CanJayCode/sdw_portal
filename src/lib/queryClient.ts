import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000, // 30s — tune per-query where fresher/stale-r data is needed
      refetchOnWindowFocus: false,
    },
  },
});
