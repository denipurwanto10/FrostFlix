import * as React from 'react'
import type { ReactNode } from 'react'
import type { MovieCardData } from '@/services/scraping/types'
import { describeScraperError } from '@/services/scraping'
import { useMovieCatalog } from '@/hooks/use-movie-catalog'
import { useUrlFilters } from '@/hooks/use-url-filters'
import { useInfiniteSentinel } from '@/hooks/use-infinite-sentinel'
import { MovieCard } from '@/components/movie/movie-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton/skeleton'
import { cn } from '@/lib/utils'

export const GRID_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 min-[1920px]:grid-cols-7'

/** Pure presentational grid. Works for catalog, search and watchlist data. */
export function MovieCardGrid({
  movies,
  className,
}: {
  movies: readonly MovieCardData[]
  className?: string
}) {
  return (
    <ul className={cn(GRID_CLASS, className)}>
      {movies.map((movie, index) => (
        <li key={movie.id} className="min-w-0">
          <MovieCard movie={movie} index={index} />
        </li>
      ))}
    </ul>
  )
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/4" />
        </div>
      ))}
    </div>
  )
}

/** Centered message block used for empty and error states. */
export function GridMessage({
  title,
  children,
  action,
  role,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
  role?: 'alert' | 'status'
}) {
  return (
    <div
      role={role}
      className="mx-auto flex max-w-md flex-col items-center py-20 text-center"
    >
      <p className="font-display text-4xl leading-tight">{title}</p>
      {children && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}

/** Footer for infinite lists: loader, error + retry, or the end marker. */
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  isError,
  onLoadMore,
  total,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError: boolean
  onLoadMore: () => void
  total: number
}) {
  const sentinel = useInfiniteSentinel(
    onLoadMore,
    hasNextPage && !isFetchingNextPage && !isError
  )

  if (isError) {
    return (
      <div role="alert" className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load more films.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onLoadMore}>
          Try again
        </Button>
      </div>
    )
  }

  if (isFetchingNextPage) {
    return (
      <div aria-live="polite" className="flex items-center justify-center gap-3 py-12">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <span className="kicker">Loading more</span>
      </div>
    )
  }

  if (hasNextPage) {
    return (
      <div ref={sentinel} className="flex justify-center py-12">
        <Button variant="outline" size="sm" onClick={onLoadMore}>
          Load more
        </Button>
      </div>
    )
  }

  return (
    <p className="kicker py-12 text-center">
      End of list · {total.toLocaleString()} {total === 1 ? 'film' : 'films'}
    </p>
  )
}

/** Catalog grid driven by the Explore URL filters. */
export function MovieGrid({ className }: { className?: string }) {
  const { query } = useUrlFilters()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoadingError,
    isPending,
    refetch,
  } = useMovieCatalog(query)

  // De-duplicate across pages (iCheckMovies can repeat items at page edges).
  const movies = React.useMemo(() => {
    const seen = new Set<string>()
    const result: MovieCardData[] = []
    for (const page of data?.pages ?? []) {
      for (const movie of page.movies) {
        if (seen.has(movie.id)) continue
        seen.add(movie.id)
        result.push(movie)
      }
    }
    return result
  }, [data])

  const loadMore = React.useCallback(() => {
    void fetchNextPage().catch(() => undefined)
  }, [fetchNextPage])

  if (isPending) {
    return (
      <section className={className} aria-busy="true" aria-live="polite">
        <p className="sr-only">Loading films…</p>
        <MovieGridSkeleton />
      </section>
    )
  }

  if (isLoadingError) {
    return (
      <section className={className}>
        <GridMessage
          role="alert"
          title="Couldn’t load the catalogue"
          action={
            <Button variant="outline" onClick={() => void refetch().catch(() => undefined)}>
              Try again
            </Button>
          }
        >
          {describeScraperError(error)}
        </GridMessage>
      </section>
    )
  }

  if (movies.length === 0) {
    return (
      <section className={className}>
        <GridMessage title="Nothing here">
          No films match these filters. Try another genre or era.
        </GridMessage>
      </section>
    )
  }

  return (
    <section className={className}>
      <MovieCardGrid movies={movies} />
      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isError={isFetchNextPageError}
        onLoadMore={loadMore}
        total={movies.length}
      />
    </section>
  )
}
