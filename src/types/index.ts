/**
 * FrostFlix — Application-level types barrel export.
 *
 * Importers should import from `@/types`.
 *
 * Re-exports from feature modules to keep imports simple.
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
} from '@/services/scraping/types'

export {
  CATALOG_SORTS,
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_SORT,
  ERA_OPTIONS,
  HOME_CATEGORIES,
  ICHECKMOVIES_GENRES,
  SOURCE_ID,
} from '@/services/scraping/types'

export { movieKeys } from '@/services/scraping/query-keys'

export type { ScraperErrorKind } from '@/services/scraping/icheckmovies/errors'

export {
  buildCatalogUrl,
  buildSearchUrl,
  fetchCatalogPage,
  fetchMovieDetails,
  genreToFilterValue,
  searchMovies,
} from '@/services/scraping'