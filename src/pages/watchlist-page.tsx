import { SplitText } from '@/components/motion/reveal'
import { useWatchlist, useWatchlistActions } from '@/hooks/use-watchlist'
import { EmptyState } from '@/components/common/empty-state'
import { MovieCardGrid } from '@/components/movie/movie-grid'
import { Button } from '@/components/ui/button'
import { BookmarkIcon } from '@/components/ui/icons'

export function WatchlistPage() {
  const { clearAll } = useWatchlistActions()
  const { items, count } = useWatchlist()

  return (
    <div className="page-enter wrap pb-6 pt-28 sm:pt-36">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 sm:mb-16">
        <div>
          <p className="kicker mb-5">Saved on this device</p>
          <h1 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] tracking-tight">
            <SplitText text="Watchlist" delay={80} />
          </h1>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-5 pb-2 sm:pb-4">
            <p className="font-mono text-xs text-subtle-foreground">
              <span className="text-foreground">{count}</span> {count === 1 ? 'film' : 'films'}
            </p>
            <Button variant="outline" size="sm" onClick={() => clearAll()}>
              Clear all
            </Button>
          </div>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon />}
          headline="Nothing saved yet"
          description="Tap the bookmark on any poster and it will wait for you here."
          buttonLabel="Browse films"
          href="/explore"
        />
      ) : (
        <MovieCardGrid movies={items} />
      )}
    </div>
  )
}
