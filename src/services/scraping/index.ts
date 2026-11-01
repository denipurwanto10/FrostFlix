/**
 * src/services/scraping/index.ts
 * — Public surface of the browser-only iCheckMovies data layer.
 */

export type {
  CatalogQuery,
  CatalogSort,
  Era,
  HomeCategory,
  MediaType,
  MovieCardData,
  MovieGenre,
  MovieListPage,
  MovieListPaging,
  NormalizedMovie,
  SourceId,
} from './types'

export {
  CATALOG_SORTS,
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_SORT,
  ERA_OPTIONS,
  HOME_CATEGORIES,
  ICHECKMOVIES_GENRES,
  SOURCE_ID,
} from './types'

export { movieKeys } from './query-keys'

export {
  ScraperError,
  describeScraperError,
  retryDelay,
  shouldRetry,
} from './icheckmovies/errors'

export type { ScraperErrorKind } from './icheckmovies/errors'

export {
  buildCatalogUrl,
  buildSearchUrl,
  fetchCatalogPage,
  fetchMovieDetails,
  genreToFilterValue,
  searchMovies,
} from './icheckmovies/api'

export {
  ICHECKMOVIES_BASE_URL,
  ICHECKMOVIES_ORIGIN,
  ICHECKMOVIES_POSTER_BASE,
} from './icheckmovies/config'
