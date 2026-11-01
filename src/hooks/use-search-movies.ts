/**
 * src/hooks/use-search-movies.ts
 * — Infinite movie search backed by iCheckMovies' public search page.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import {
  movieKeys,
  retryDelay,
  searchMovies,
  shouldRetry,
} from '@/services/scraping'

export function useSearchMovies(query: string) {
  const trimmed = query.trim()

  return useInfiniteQuery({
    queryKey: movieKeys.search(trimmed),
    queryFn: ({ pageParam, signal }) =>
      searchMovies(trimmed, pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.paging.hasNextPage
        ? lastPage.paging.pageNumber + 1
        : undefined,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    enabled: trimmed.length >= 2,
    retry: shouldRetry,
    retryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
