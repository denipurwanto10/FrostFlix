import { SplitText } from '@/components/motion/reveal'
/**
 * src/pages/explore-page.tsx
 * — Browse the whole catalogue by genre, era and sort order.
 * Filter state lives in the URL (see useUrlFilters).
 */

import { useUrlFilters } from '@/hooks/use-url-filters'
import { useMovieCatalog } from '@/hooks/use-movie-catalog'
import { FilterBar } from '@/components/common/filter-bar'
import { MovieGrid } from '@/components/movie/movie-grid'

export function ExplorePage() {
  const { query } = useUrlFilters()
  const { data } = useMovieCatalog(query)

  const total = data?.pages[0]?.paging.totalItemCount

  return (
    <div className="page-enter">
      <header className="wrap pb-10 pt-28 sm:pb-14 sm:pt-36">
        <p className="kicker mb-5">Catalogue</p>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h1 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] tracking-tight">
            <SplitText text="Explore" delay={80} />
          </h1>
          <div className="max-w-sm pb-2 sm:pb-4">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Browse by genre and decade, ordered by what people favorite, check
              or list the most.
            </p>
            {typeof total === 'number' && total > 0 && (
              <p className="mt-4 font-mono text-xs text-subtle-foreground">
                <span className="text-foreground">{total.toLocaleString()}</span>{' '}
                {total === 1 ? 'film' : 'films'} match
              </p>
            )}
          </div>
        </div>
      </header>

      <FilterBar />

      <div className="wrap pt-10">
        <MovieGrid />
      </div>
    </div>
  )
}
