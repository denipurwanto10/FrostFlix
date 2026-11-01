export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'Preferences', href: '/preferences' },
]

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
}

export const CATALOG_SORTS = [
  { label: 'Most favorited', value: 'favorites' },
  { label: 'Most checked', value: 'checks' },
  { label: 'Newest added', value: 'dateadded' },
  { label: 'Most official lists', value: 'officiallists' },
  { label: 'Title A–Z', value: 'title' },
  { label: 'Release year', value: 'year' },
] as const

export const DEFAULT_CATALOG_SORT = 'favorites' as const

export const CATALOG_SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'favorites', label: 'Most favorited' },
  { value: 'checks', label: 'Most checked' },
  { value: 'dateadded', label: 'Newest added' },
  { value: 'officiallists', label: 'Most official lists' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'year', label: 'Release year' },
]

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

export const YEAR_RANGE = {
  min: 1900,
  max: new Date().getFullYear(),
}