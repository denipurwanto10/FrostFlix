/**
 * use-url-filters — URL-backed filter state for the Explore page.
 *
 * The URL is the source of truth for Explore filters. This hook:
 * - Parses and validates filter values from the current URL.
 * - Provides typed setters that update the URL using iCheckMovies CatalogQuery shape.
 * - Preserves browser back/forward navigation because filters are derived
 *   from `useSearchParams()` rather than duplicated in React state.
 * - Avoids unnecessary history entries for reset/clear actions.
 */

import * as React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  type CatalogQuery,
  type CatalogSort,
  type Era,
  DEFAULT_CATALOG_SORT,
  CATALOG_SORT_OPTIONS,
  ICHECKMOVIES_GENRES,
  ERA_OPTIONS,
} from '@/services/scraping'

/**
 * Parse a string from URLSearchParams into a CatalogSort value, returning
 * the default if the value is missing or invalid.
 */
function parseSort(value: string | null): CatalogSort {
  if (value === null || value.trim() === '') return DEFAULT_CATALOG_SORT
  const normalized = value.trim()
  if (CATALOG_SORT_OPTIONS.some((opt) => opt.value === normalized)) {
    return normalized as CatalogSort
  }
  return DEFAULT_CATALOG_SORT
}

/**
 * Parse a string from URLSearchParams into a genre value (iCheckMovies format:
 * 'action', 'sci-fi', etc.), returning null if missing or invalid.
 */
function parseGenre(value: string | null): string | null {
  if (value === null || value.trim() === '') return null
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-')
  if (ICHECKMOVIES_GENRES.some((gen) => gen.toLowerCase() === normalized)) {
    return normalized
  }
  return null
}

/**
 * Parse an era value from URLSearchParams, returning null if missing or invalid.
 */
function parseEra(value: string | null): string | null {
  if (value === null || value.trim() === '') return null
  const normalized = value.trim()
  if (ERA_OPTIONS.some((opt) => opt.value === normalized)) {
    return normalized
  }
  return null
}

/**
 * URL filter hook. The URL is the source of truth for Explore filters.
 */
export function useUrlFilters(): {
  query: CatalogQuery
  setSort: (sort: CatalogSort | undefined) => void
  setGenre: (genre: string | undefined) => void
  setEra: (era: Era | undefined) => void
  resetFilters: () => void
} {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // --- Parse the current URL ---

  const sort = parseSort(searchParams.get('sort'))
  const genre = parseGenre(searchParams.get('genre'))
  const era = parseEra(searchParams.get('era'))

  /**
   * Build a CatalogQuery object without assigning `undefined` to optional
   * properties (required by `exactOptionalPropertyTypes`).
   */
  const query = React.useMemo<CatalogQuery>(() => {
    const next: CatalogQuery = { sort, genre: genre ?? null, era: era as Era | null }

    return next
  }, [sort, genre, era])

  // --- URL mutation helpers ---

  const setParam = React.useCallback(
    (key: string, value: string | undefined, replace = false) => {
      // Start from the current URL so unrelated params are preserved and
      // rapid successive updates cannot drop each other.
      const params = new URLSearchParams(searchParams)
      if (value === undefined) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      navigate({ search: params.toString() }, { replace })
    },
    [navigate, searchParams]
  )

  const setSort = (sort: CatalogSort | undefined) => {
    setParam('sort', sort)
  }

  const setGenre = (genre: string | undefined) => {
    setParam('genre', genre)
  }

  const setEra = (era: string | undefined) => {
    setParam('era', era)
  }

  const resetFilters = () => {
    // Remove only the filter params; default sort applies when absent.
    // Use replace: true to avoid a history entry for the reset action.
    const params = new URLSearchParams(searchParams)
    params.delete('genre')
    params.delete('era')
    params.delete('sort')
    navigate({ search: params.toString() }, { replace: true })
  }

  return {
    query,
    setSort,
    setGenre,
    setEra,
    resetFilters,
  }
}