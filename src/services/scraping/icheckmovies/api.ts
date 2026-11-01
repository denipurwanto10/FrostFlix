/**
 * src/services/scraping/icheckmovies/api.ts
 * — Public read operations against iCheckMovies.
 */

import type {
  CatalogQuery,
  MovieListPage,
  NormalizedMovie,
} from '../types'
import { fetchHtml, type FetchHtmlOptions } from './client'
import { ICHECKMOVIES_BASE_URL } from './config'
import { ScraperError } from './errors'
import {
  parseDetailHtml,
  parseListHtml,
  parseSearchHtml,
} from './selectors'

/**
 * Convert a display genre ("Sci-Fi") to iCheckMovies' filter value
 * ("sci-fi").
 */
export function genreToFilterValue(genre: string): string {
  return genre.trim().toLowerCase().replace(/\s+/g, '-')
}

export function buildCatalogUrl(query: CatalogQuery, page: number): string {
  const filters = ['mediatype:movie']

  if (query.genre) {
    filters.push(`genre:${genreToFilterValue(query.genre)}`)
  }

  if (query.era) {
    filters.push(`year:${query.era}`)
  }

  const params = new URLSearchParams()
  // iCheckMovies requires a single comma-separated filter parameter.
  // Repeating `filter` returns HTTP 500.
  params.set('filter', filters.join(','))
  params.set('sort', query.sort)

  if (page > 1) {
    params.set('page', String(page))
  }

  return `${ICHECKMOVIES_BASE_URL}/movies/?${params.toString()}`
}

export function buildSearchUrl(query: string, page: number): string {
  const params = new URLSearchParams()
  params.set('query', query)

  if (page > 1) {
    params.set('page', String(page))
  }

  return `${ICHECKMOVIES_BASE_URL}/search/movies/?${params.toString()}`
}

export async function fetchCatalogPage(
  query: CatalogQuery,
  page: number,
  options: FetchHtmlOptions = {}
): Promise<MovieListPage> {
  const url = buildCatalogUrl(query, page)
  const html = await fetchHtml(url, options)
  return parseListHtml(html)
}

export async function searchMovies(
  query: string,
  page: number,
  options: FetchHtmlOptions = {}
): Promise<MovieListPage> {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return {
      movies: [],
      paging: {
        pageNumber: page,
        pageCount: 0,
        hasNextPage: false,
        totalItemCount: 0,
        pageSize: 25,
      },
    }
  }

  const url = buildSearchUrl(trimmed, page)
  const html = await fetchHtml(url, options)
  return parseSearchHtml(html, page)
}

function normalizeSlug(slug: string): string {
  const trimmed = slug.trim().replace(/^\/+/, '').replace(/\/+$/, '')

  if (!trimmed || /[/?#]/.test(trimmed)) {
    throw new ScraperError('network', 'Invalid iCheckMovies movie slug.')
  }

  return trimmed
}

export async function fetchMovieDetails(
  slug: string,
  options: FetchHtmlOptions = {}
): Promise<NormalizedMovie> {
  const normalizedSlug = normalizeSlug(slug)
  const url = `${ICHECKMOVIES_BASE_URL}/movies/${normalizedSlug}/`
  const html = await fetchHtml(url, options)
  return parseDetailHtml(html, normalizedSlug)
}
