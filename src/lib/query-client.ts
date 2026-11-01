/**
 * TanStack Query Client Configuration
 *
 * Centralized QueryClient used across the app. One source of truth for
 * cache timeouts, retry policy, and refetch behavior.
 *
 * Follows API_INTEGRATION.md cache policy:
 * - Genres: 24 hours
 * - Feed queries (catalog/search): 10 min
 * - Details: 6 hours
 */

import { QueryClient } from '@tanstack/react-query'
import { ScraperError } from '@/services/scraping/icheckmovies/errors'

// --- Retry policy ---

// Never retry aborted or blocked errors
// Never retry CORS or parse errors
// 429 retry once (caller should respect Retry-After)
// Retry other client errors (< 500) zero times
// Retry 5xx twice (subject to backoff)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60_000, // 10 min (feed queries)
      gcTime: 30 * 60_000, // 30 min
      retry: (failureCount, error) => {
        if (error instanceof ScraperError) {
          const kind = error.kind
          if (kind === 'aborted' || kind === 'blocked' || kind === 'cors' || kind === 'parse') return false
          if (error.status !== undefined) {
            if (error.status === 403 || error.status === 404 || error.status === 429) return false
            if (error.status < 500) return false
          }
        }
        return failureCount < 2
      },
      retryDelay: (attempt, error) => {
        if (error instanceof ScraperError && error.retryAfterMs !== undefined) {
          return Math.min(error.retryAfterMs, 30_000)
        }
        return Math.min(1_000 * 2 ** attempt, 8_000)
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      structuralSharing: true,
    },
    mutations: {
      retry: false,
    },
  },
})