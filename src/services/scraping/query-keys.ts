/**
 * src/services/scraping/query-keys.ts
 * — Stable TanStack Query keys for the iCheckMovies data layer.
 */

import type { CatalogQuery } from './types'

export const movieKeys = {
  all: ['icheckmovies'] as const,
  catalog: (query: CatalogQuery) =>
    [
      'icheckmovies',
      'catalog',
      query.sort,
      query.genre,
      query.era,
    ] as const,
  search: (query: string) => ['icheckmovies', 'search', query] as const,
  detail: (slug: string) => ['icheckmovies', 'detail', slug] as const,
}
