/**
 * src/hooks/use-movie-details.ts
 * — Single movie details from an iCheckMovies detail page.
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchMovieDetails,
  movieKeys,
  retryDelay,
  shouldRetry,
} from '@/services/scraping'

export function useMovieDetails(slug: string) {
  return useQuery({
    queryKey: movieKeys.detail(slug),
    queryFn: ({ signal }) => fetchMovieDetails(slug, { signal }),
    enabled: slug.length > 0,
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    retry: shouldRetry,
    retryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
