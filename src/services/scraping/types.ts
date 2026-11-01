/**
 * src/services/scraping/types.ts
 * — Types for the browser-only iCheckMovies data layer.
 *
 * FrostFlix has no backend. Every value here is produced in the browser by
 * fetching a public iCheckMovies HTML page and parsing it with DOMParser.
 */

// ---------------------------------------------------------------------------
// Source identity
// ---------------------------------------------------------------------------

export const SOURCE_ID = 'icheckmovies' as const

export type SourceId = typeof SOURCE_ID

export type MediaType = 'movie' | 'tv-movie' | 'tv-series' | 'tv-episode'

// ---------------------------------------------------------------------------
// Normalized movie model
//
// Fields that iCheckMovies does not publish are `null` or an empty array.
// Nothing is invented: in particular there is no synopsis, because
// iCheckMovies detail pages do not contain one.
//
// `rating` and `votes` are IMDb values that iCheckMovies republishes. The UI
// must label them as IMDb data.
// ---------------------------------------------------------------------------

export interface NormalizedMovie {
  /** Stable app id: `icheckmovies:<slug>`. Shared by list, search and detail. */
  id: string
  sourceId: SourceId

  /** iCheckMovies URL slug, e.g. `21-fight+club`. Used as the detail route. */
  slug: string

  /** Absolute iCheckMovies detail page URL. */
  sourceUrl: string

  title: string
  year: number | null
  runtime: number | null

  directors: string[]
  genres: string[]

  /** IMDb rating on a 0–10 scale, republished by iCheckMovies. */
  rating: number | null
  /** IMDb vote count. Only available on detail pages. */
  votes: number | null

  checks: number | null
  favorites: number | null
  dislikes: number | null
  officialListCount: number | null

  posterUrl: string | null
  imdbId: string | null
  tmdbId: number | null
  mediaType: MediaType | null
  hasImage: boolean
}

/**
 * The minimal shape a card needs. Both `NormalizedMovie` and `WatchlistItem`
 * satisfy it, so the same card works on catalog and watchlist pages.
 */
export interface MovieCardData {
  id: string
  slug: string | null
  title: string
  year: number | null
  posterUrl: string | null
  rating: number | null
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface MovieListPaging {
  pageNumber: number
  pageCount: number
  hasNextPage: boolean
  totalItemCount: number
  pageSize: number
}

export interface MovieListPage {
  movies: NormalizedMovie[]
  paging: MovieListPaging
}

// ---------------------------------------------------------------------------
// Catalog filters
//
// These are the real orderings and filters exposed by iCheckMovies. There is
// no "trending", "now playing" or global "top rated" list on the site, so the
// app does not pretend those exist.
// ---------------------------------------------------------------------------

export const CATALOG_SORTS = [
  'favorites',
  'checks',
  'dateadded',
  'officiallists',
  'title',
  'year',
] as const

export type CatalogSort = (typeof CATALOG_SORTS)[number]

export const DEFAULT_CATALOG_SORT: CatalogSort = 'favorites'

export interface CatalogSortOption {
  value: CatalogSort
  label: string
}

export const CATALOG_SORT_OPTIONS: ReadonlyArray<CatalogSortOption> = [
  { value: 'favorites', label: 'Most favorited' },
  { value: 'checks', label: 'Most checked' },
  { value: 'dateadded', label: 'Newest added' },
  { value: 'officiallists', label: 'Most official lists' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'year', label: 'Release year' },
]

/** Genre labels exactly as iCheckMovies exposes them in its filter UI. */
export const ICHECKMOVIES_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Film-Noir',
  'History',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western',
] as const

export type MovieGenre = (typeof ICHECKMOVIES_GENRES)[number]

export const ERA_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: '2020s', label: '2020s' },
  { value: '2010s', label: '2010s' },
  { value: '2000s', label: '2000s' },
  { value: '1990s', label: '1990s' },
  { value: '1980s', label: '1980s' },
  { value: '1970s', label: '1970s' },
  { value: '1960s', label: '1960s' },
  { value: '1950s', label: '1950s' },
  { value: '1940s', label: '1940s' },
  { value: '1930s', label: '1930s' },
  { value: '1920s', label: '1920s' },
  { value: '1910s', label: '1910s' },
  { value: '1900s', label: '1900s' },
] as const

export type Era = (typeof ERA_OPTIONS)[number]['value']

export interface CatalogQuery {
  sort: CatalogSort
  genre: string | null
  era: Era | null
}

export interface HomeCategory {
  key: string
  label: string
  description: string
  sort: CatalogSort
  era: Era | null
}

/**
 * Home rows. Each entry maps to a real iCheckMovies list URL, so the labels
 * describe exactly what the data is.
 */
export const HOME_CATEGORIES: ReadonlyArray<HomeCategory> = [
  {
    key: 'most-favorited',
    label: 'Most Favorited',
    description: 'The movies with the most favorites on iCheckMovies.',
    sort: 'favorites',
    era: null,
  },
  {
    key: 'most-checked',
    label: 'Most Checked',
    description: 'The movies checked by the most iCheckMovies members.',
    sort: 'checks',
    era: null,
  },
  {
    key: 'newest-added',
    label: 'Newest Added',
    description: 'The most recently added titles in the iCheckMovies database.',
    sort: 'dateadded',
    era: null,
  },
  {
    key: 'most-official-lists',
    label: 'Most Official Lists',
    description: 'Movies that appear in the most official iCheckMovies lists.',
    sort: 'officiallists',
    era: null,
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    description: 'Titles iCheckMovies has marked as upcoming releases.',
    sort: 'dateadded',
    era: 'upcoming',
  },
]
