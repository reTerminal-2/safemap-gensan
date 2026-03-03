import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2,       // 2 minutes
            gcTime: 1000 * 60 * 10,          // 10 minutes
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,         // Refetch when coming back online
        },
        mutations: {
            retry: 1,
        },
    },
})
