import { Link } from 'react-router-dom'
import type { NormalizedMovie } from '@/services/scraping/types'
import { useIsInWatchlist, useWatchlistActions } from '@/hooks/use-watchlist'
import { buttonVariants, Button } from '@/components/ui/button'
import { ArrowRightIcon, BookmarkIcon, StarIcon } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/skeleton/skeleton'
import { formatRuntime } from '@/lib/format'
import { SplitText } from '@/components/motion/reveal'
import { Tilt } from '@/components/motion/tilt'
import { cn } from '@/lib/utils'

function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Shared ambient wash: the poster, blown up and dimmed into the page. */
function Backdrop({ posterUrl }: { posterUrl: string | null }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.28] blur-3xl saturate-[0.6] animate-[kenburns_30s_ease-in-out_infinite_alternate]"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,transparent_0%,var(--background)_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

function HeroSkeleton() {
  return (
    <div className="wrap grid items-end gap-10 pb-14 pt-32 lg:grid-cols-[1fr_auto] lg:pb-20 lg:pt-40" aria-hidden="true">
      <div className="space-y-6 lg:order-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-24 w-full max-w-2xl sm:h-32" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-12 w-56 rounded-full" />
      </div>
      <Skeleton className="order-first hidden aspect-[2/3] w-[clamp(180px,22vw,300px)] sm:block lg:order-2" />
    </div>
  )
}

export interface HeroBannerProps {
  movie?: NormalizedMovie | null
  loading?: boolean
}

export function HeroBanner({ movie, loading }: HeroBannerProps) {
  const saved = useIsInWatchlist(movie?.id ?? '')
  const { toggle } = useWatchlistActions()

  if (loading) {
    return (
      <section className="relative isolate -mt-16" aria-busy="true">
        <HeroSkeleton />
      </section>
    )
  }

  // No data (offline, blocked, …): fall back to a typographic masthead.
  if (!movie) {
    return (
      <section className="relative isolate -mt-16">
        <Backdrop posterUrl={null} />
        <div className="wrap pb-14 pt-36 lg:pb-20 lg:pt-48">
          <p className="kicker mb-6">The archive</p>
          <h1 className="max-w-4xl font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] tracking-tight">
            A quiet archive of films <em className="text-primary">worth the check.</em>
          </h1>
          <Link to="/explore" className={buttonVariants({ size: 'lg', className: 'mt-10' })}>
            Start exploring <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    )
  }

  const facts = [
    movie.year,
    movie.runtime ? formatRuntime(movie.runtime) : null,
    movie.genres.slice(0, 3).join(' / ') || null,
  ].filter(Boolean)

  return (
    <section className="relative isolate -mt-16">
      <Backdrop posterUrl={movie.posterUrl} />

      <div className="wrap grid items-end gap-x-14 gap-y-10 pb-14 pt-36 sm:pt-32 lg:grid-cols-[1fr_auto] lg:pb-20 lg:pt-44">
        <div className="min-w-0 lg:order-1">
          <p className="kicker reveal mb-5 flex items-center gap-3" style={{ ['--i' as string]: 0 }}>
            <span className="h-px w-8 bg-primary/70" aria-hidden="true" />
            Pick of the day · {todayLabel()}
          </p>

          <h1
            className="reveal font-display text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.92] tracking-tight text-balance"
            style={{ ['--i' as string]: 1 }}
          >
            <SplitText key={movie.id} text={movie.title} delay={120} />
          </h1>

          <p
            className="reveal mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted-foreground"
            style={{ ['--i' as string]: 2 }}
          >
            {facts.map((fact, i) => (
              <span key={i} className="inline-flex items-center gap-3">
                {i > 0 && <span className="h-3 w-px bg-border-strong" aria-hidden="true" />}
                {fact}
              </span>
            ))}
            {movie.rating !== null && (
              <span className="inline-flex items-center gap-3">
                <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-rating">
                  <StarIcon className="h-3 w-3" />
                  {movie.rating.toFixed(1)}
                  <span className="text-subtle-foreground">IMDb</span>
                </span>
              </span>
            )}
          </p>

          {movie.directors.length > 0 && (
            <p className="reveal mt-3 text-[15px] text-muted-foreground" style={{ ['--i' as string]: 3 }}>
              Directed by <span className="text-foreground">{movie.directors.join(', ')}</span>
            </p>
          )}

          <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ ['--i' as string]: 4 }}>
            <Link to={`/movie/${movie.slug}`} className={buttonVariants({ size: 'lg' })}>
              View film <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              aria-pressed={saved}
              onClick={() => toggle(movie)}
              className={cn(saved && 'border-primary/50 text-primary')}
            >
              <BookmarkIcon className="h-4 w-4" filled={saved} />
              {saved ? 'Saved' : 'Watchlist'}
            </Button>
          </div>
        </div>

        <Link
          to={`/movie/${movie.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="reveal group relative order-first block w-[clamp(150px,44vw,220px)] sm:w-[clamp(200px,22vw,290px)] lg:order-2"
          style={{ ['--i' as string]: 2 }}
        >
          <Tilt max={7} className="rounded-md">
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt=""
                fetchPriority="high"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            )}
          </div>
          </Tilt>
        </Link>
      </div>
    </section>
  )
}
