/**
 * src/hooks/use-movie-catalog.ts
 * — Infinite movie catalog backed by real iCheckMovies list pages.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchCatalogPage,
  movieKeys,
  retryDelay,
  shouldRetry,
  type CatalogQuery,
} from '@/services/scraping'

export function useMovieCatalog(query: CatalogQuery, enabled = true) {
  return useInfiniteQuery({
    queryKey: movieKeys.catalog(query),
    queryFn: ({ pageParam, signal }) =>
      fetchCatalogPage(query, pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.paging.hasNextPage
        ? lastPage.paging.pageNumber + 1
        : undefined,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    enabled,
    retry: shouldRetry,
    retryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
