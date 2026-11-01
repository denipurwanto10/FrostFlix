/**
 * src/services/scraping/icheckmovies/selectors.ts
 * — DOM and payload extraction for iCheckMovies.
 *
 * Two page shapes are supported:
 *
 *  1. List pages (`/movies/?sort=…`) are Nuxt SSR pages that embed a
 *     `__NUXT_DATA__` devalue payload with 50 items and full paging metadata.
 *  2. Search (`/search/movies/?query=…`) and detail (`/movies/<slug>/`) pages
 *     are classic server-rendered HTML.
 *
 * Parsing uses DOMParser for HTML. Regular expressions are only used to read
 * short scalar values out of already-extracted text (years, counts, URLs).
 */

import type {
  MediaType,
  MovieListPage,
  NormalizedMovie,
} from '../types'
import { ICHECKMOVIES_BASE_URL, ICHECKMOVIES_POSTER_BASE } from './config'
import { parseNuxtPayload } from './devalue'
import { ScraperError } from './errors'

const SEARCH_PAGE_SIZE = 25

// ---------------------------------------------------------------------------
// Small type guards
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isMediaType(value: string | null): value is MediaType {
  return (
    value === 'movie' ||
    value === 'tv-movie' ||
    value === 'tv-series' ||
    value === 'tv-episode'
  )
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

export function toAbsoluteUrl(path: string): string | null {
  try {
    return new URL(path, ICHECKMOVIES_BASE_URL).toString()
  } catch {
    return null
  }
}

export function slugFromDetailsPath(path: string): string | null {
  const match = /^\/movies\/([^/?#]+)\/?$/.exec(path)
  return match?.[1] ?? null
}

/**
 * iCheckMovies stores posters under a bucket derived from the internal id.
 * Example: id 21 → /var/posters/medium/0/21.jpg
 */
export function posterUrlForId(
  id: number,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  return `${ICHECKMOVIES_POSTER_BASE}/${size}/${Math.floor(id / 1000)}/${id}.jpg`
}

// ---------------------------------------------------------------------------
// Scalar helpers
// ---------------------------------------------------------------------------

function parseCount(value: string | null | undefined): number | null {
  if (!value) return null
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return null
  const parsed = Number.parseInt(digits, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseIntValue(value: string | undefined): number | null {
  if (!value) return null
  const match = /-?\d[\d,]*/.exec(value)
  if (!match?.[0]) return null
  const parsed = Number.parseInt(match[0].replace(/,/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseFloatValue(value: string | undefined): number | null {
  if (!value) return null
  const match = /\d+(?:\.\d+)?/.exec(value)
  if (!match?.[0]) return null
  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function splitList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function parseFirstYear(value: string): number | null {
  const match = /\b(1[89]\d{2}|20\d{2})\b/.exec(value)
  if (!match?.[1]) return null
  const parsed = Number.parseInt(match[1], 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseOfficialListCount(value: string): number | null {
  const match = /in\s+([\d,]+)\s+top lists/i.exec(value)
  return parseCount(match?.[1])
}

function namesFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const names: string[] = []
  for (const entry of value) {
    const record = asRecord(entry)
    const name = record ? asString(record.name) : null
    if (name) names.push(name)
  }
  return names
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function parseDocument(html: string): Document {
  if (!html.trim()) {
    throw new ScraperError('parse', 'iCheckMovies returned an empty page.')
  }

  let document: Document
  try {
    document = new DOMParser().parseFromString(html, 'text/html')
  } catch (error) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies page could not be parsed as HTML.',
      { cause: error }
    )
  }

  if (!document.documentElement || !document.body) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies page could not be parsed as HTML.'
    )
  }

  return document
}

function coverUrlFrom(element: ParentNode): string | null {
  const cover = element.querySelector('.coverImage')
  const style = cover?.getAttribute('style') ?? ''
  const match = /url\(\s*(['"]?)([^'")]+)\1\s*\)/.exec(style)
  const raw = match?.[2]
  if (!raw) return null
  if (raw.includes('defaultCover')) return null
  return toAbsoluteUrl(raw)
}

function parseImdbIdFrom(element: ParentNode): string | null {
  const anchor = element.querySelector('a[href*="imdb.com/title/"]')
  const href = anchor?.getAttribute('href') ?? ''
  const match = /(tt\d{5,})/.exec(href)
  return match?.[1] ?? null
}

function normalizeLabel(value: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readDefinitionList(document: Document): Map<string, string> {
  const pairs = new Map<string, string>()
  const list = document.querySelector('#movieInfo dl')
  if (!list) return pairs

  for (const term of Array.from(list.querySelectorAll('dt'))) {
    const key = normalizeLabel(term.textContent)
    const description = term.nextElementSibling
    if (!key || !description || description.tagName !== 'DD') continue
    pairs.set(key, (description.textContent ?? '').trim())
  }

  return pairs
}

// ---------------------------------------------------------------------------
// List payload → NormalizedMovie
// ---------------------------------------------------------------------------

export function mapPayloadMovie(raw: unknown): NormalizedMovie | null {
  const record = asRecord(raw)
  if (!record) return null

  const title = asString(record.title)?.trim()
  const detailsPath = asString(record.detailsUrl)
  const internalId = asNumber(record.id)

  if (!title || !detailsPath || internalId === null) return null

  const slug = slugFromDetailsPath(detailsPath)
  if (!slug) return null

  const hasImage = record.hasImage === true
  const mediaTypeValue = asString(record.mediaType)

  return {
    id: `icheckmovies:${slug}`,
    sourceId: 'icheckmovies',
    slug,
    sourceUrl: `${ICHECKMOVIES_BASE_URL}/movies/${slug}/`,
    title,
    year: asNumber(record.year),
    runtime: asNumber(record.runtime),
    directors: namesFrom(record.directors),
    genres: namesFrom(record.genres),
    rating: asNumber(record.rating),
    votes: null,
    checks: asNumber(record.checkCount),
    favorites: asNumber(record.favoriteCount),
    dislikes: asNumber(record.dislikeCount),
    officialListCount: asNumber(record.officialListCount),
    posterUrl: hasImage ? posterUrlForId(internalId) : null,
    imdbId: asString(record.imdbId),
    tmdbId: asNumber(record.tmdbId),
    mediaType: isMediaType(mediaTypeValue) ? mediaTypeValue : null,
    hasImage,
  }
}

export function parseListHtml(html: string): MovieListPage {
  const document = parseDocument(html)
  const script = document.querySelector('#__NUXT_DATA__')
  const payload = script?.textContent

  if (!payload) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies list page did not contain its data payload.'
    )
  }

  const root = asRecord(parseNuxtPayload(payload))
  const pinia = asRecord(root?.['pinia'])
  const itemList = asRecord(pinia?.['itemlist:movies'])
  const list = asRecord(itemList?.['list'])

  if (!list) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies list payload had an unexpected shape.'
    )
  }

  const rawItems = list.items
  if (!Array.isArray(rawItems)) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies list payload did not contain any items.'
    )
  }

  const movies: NormalizedMovie[] = []
  for (const rawItem of rawItems) {
    const movie = mapPayloadMovie(rawItem)
    if (movie) movies.push(movie)
  }

  const paging = asRecord(list.paging)
  const pageNumber = asNumber(paging?.pageNumber) ?? 1
  const pageCount = asNumber(paging?.pageCount) ?? pageNumber
  const totalItemCount = asNumber(paging?.totalItemCount) ?? movies.length
  const pageSize = asNumber(paging?.pageSize) ?? movies.length

  return {
    movies,
    paging: {
      pageNumber,
      pageCount,
      hasNextPage: paging?.hasNextPage === true,
      totalItemCount,
      pageSize,
    },
  }
}

// ---------------------------------------------------------------------------
// Search page → NormalizedMovie
// ---------------------------------------------------------------------------

export function mapSearchItem(element: Element): NormalizedMovie | null {
  const cover = element.querySelector('a.dvdCoverSmall')
  const detailsPath = cover?.getAttribute('data-movie-link')
  const title = element.querySelector('h2 a')?.textContent?.trim() ?? ''

  if (!detailsPath || !title) return null

  const slug = slugFromDetailsPath(detailsPath)
  if (!slug) return null

  const info =
    element
      .querySelector('span.info')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? ''

  const posterUrl = coverUrlFrom(element)

  return {
    id: `icheckmovies:${slug}`,
    sourceId: 'icheckmovies',
    slug,
    sourceUrl: `${ICHECKMOVIES_BASE_URL}/movies/${slug}/`,
    title,
    year: parseFirstYear(info),
    runtime: null,
    directors: [],
    genres: [],
    rating: null,
    votes: null,
    checks: null,
    favorites: null,
    dislikes: null,
    officialListCount: parseOfficialListCount(info),
    posterUrl,
    imdbId: parseImdbIdFrom(element),
    tmdbId: null,
    mediaType: null,
    hasImage: posterUrl !== null,
  }
}

export function parseSearchHtml(
  html: string,
  requestedPage: number
): MovieListPage {
  const document = parseDocument(html)
  const container = document.querySelector('#itemListMovies')

  if (!container) {
    const pageText = `${document.title} ${document.body.textContent ?? ''}`

    // A valid search with no matches has no list container.
    if (/matching/i.test(pageText) || /couldn't find the movie/i.test(pageText)) {
      return {
        movies: [],
        paging: {
          pageNumber: requestedPage,
          pageCount: 0,
          hasNextPage: false,
          totalItemCount: 0,
          pageSize: SEARCH_PAGE_SIZE,
        },
      }
    }

    throw new ScraperError(
      'parse',
      'The iCheckMovies search page did not contain a results list.'
    )
  }

  const items = Array.from(container.children).filter(
    (child) => child.tagName === 'LI'
  )

  const movies: NormalizedMovie[] = []
  for (const item of items) {
    const movie = mapSearchItem(item)
    if (movie) movies.push(movie)
  }

  const pagingText = document.querySelector('#pagingInfo')?.textContent ?? ''
  const totalMatch = /of\s+([\d.,]+)/i.exec(pagingText)
  const totalItemCount = parseCount(totalMatch?.[1])
  const pageCount =
    totalItemCount === null
      ? requestedPage
      : Math.max(1, Math.ceil(totalItemCount / SEARCH_PAGE_SIZE))

  return {
    movies,
    paging: {
      pageNumber: requestedPage,
      pageCount,
      hasNextPage:
        totalItemCount === null
          ? movies.length >= SEARCH_PAGE_SIZE
          : requestedPage < pageCount,
      totalItemCount: totalItemCount ?? movies.length,
      pageSize: SEARCH_PAGE_SIZE,
    },
  }
}

// ---------------------------------------------------------------------------
// Detail page → NormalizedMovie
// ---------------------------------------------------------------------------

function parseHeading(heading: string): {
  title: string
  year: number | null
} {
  const cleaned = heading
    .replace(/\s*-\s*iCheckMovies\.com\s*$/i, '')
    .trim()
  const match = /^(.*?)\s*\((\d{4})\)\s*$/.exec(cleaned)

  if (match?.[1]) {
    const year = Number.parseInt(match[2] ?? '', 10)
    return {
      title: match[1].trim(),
      year: Number.isFinite(year) ? year : null,
    }
  }

  return { title: cleaned, year: null }
}

export function parseDetailHtml(
  html: string,
  slug: string
): NormalizedMovie {
  const document = parseDocument(html)

  const heading =
    document.querySelector('#movieInfo h1')?.textContent?.trim() ??
    document.querySelector('h1')?.textContent?.trim() ??
    ''

  const parsedHeading = parseHeading(heading)
  const pairs = readDefinitionList(document)

  const title = parsedHeading.title || (pairs.get('title') ?? '')
  if (!title) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies detail page did not contain a movie title.'
    )
  }

  const year = parseIntValue(pairs.get('year')) ?? parsedHeading.year
  const runtime = parseIntValue(pairs.get('runtime'))
  const directors = splitList(pairs.get('director'))
  const genres = splitList(pairs.get('genres'))
  const rating = parseFloatValue(pairs.get('rating'))
  const votes = parseIntValue(pairs.get('votes'))
  const checks = parseIntValue(pairs.get('checks'))
  const favorites = parseIntValue(pairs.get('favs'))
  const dislikes = parseIntValue(pairs.get('dislikes'))

  const posterUrl = coverUrlFrom(document) ?? posterUrlFromMeta(document)

  return {
    id: `icheckmovies:${slug}`,
    sourceId: 'icheckmovies',
    slug,
    sourceUrl: `${ICHECKMOVIES_BASE_URL}/movies/${slug}/`,
    title,
    year,
    runtime,
    directors,
    genres,
    rating,
    votes,
    checks,
    favorites,
    dislikes,
    officialListCount: null,
    posterUrl,
    imdbId: parseImdbIdFrom(document),
    tmdbId: null,
    mediaType: null,
    hasImage: posterUrl !== null,
  }
}

function posterUrlFromMeta(document: Document): string | null {
  const content = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content')

  return content ? toAbsoluteUrl(content) : null
}
