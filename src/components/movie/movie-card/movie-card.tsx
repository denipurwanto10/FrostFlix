import * as React from 'react'
import { Link } from 'react-router-dom'
import type { MovieCardData } from '@/services/scraping/types'
import { useIsInWatchlist, useWatchlistActions } from '@/hooks/use-watchlist'
import { BookmarkIcon, StarIcon } from '@/components/ui/icons'
import { Tilt } from '@/components/motion/tilt'
import { cn } from '@/lib/utils'

export interface MovieCardProps {
  movie: MovieCardData
  /** Stagger index for the entrance animation. */
  index?: number
  /** Rank shown in the corner (used by ranked rails). */
  rank?: number | undefined
  className?: string | undefined
}

/** Poster with graceful fade-in and a typographic fallback. */
function Poster({ movie }: { movie: MovieCardData }) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'error'>(
    movie.posterUrl ? 'loading' : 'error'
  )
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Cached images can finish before React attaches onLoad.
  React.useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setState('loaded')
  }, [])

  if (!movie.posterUrl || state === 'error') {
    return (
      <div
        role="img"
        aria-label={`No poster available for ${movie.title}`}
        className="absolute inset-0 flex flex-col justify-between bg-gradient-to-br from-surface-3 to-surface p-3"
      >
        <span className="kicker">No poster</span>
        <span className="line-clamp-4 font-display text-xl leading-tight text-foreground/80">
          {movie.title}
        </span>
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={movie.posterUrl}
      alt={`Poster for ${movie.title}`}
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('error')}
      className={cn(
        'absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-[900ms] ease-out',
        'group-hover:scale-[1.045]',
        state === 'loaded' ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
      )}
    />
  )
}

export function MovieCard({ movie, index = 0, rank, className }: MovieCardProps) {
  const saved = useIsInWatchlist(movie.id)
  const { toggle } = useWatchlistActions()

  const body = (
    <>
      <Tilt max={5} className="aspect-[2/3] w-full rounded-md">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-inset ring-white/[0.06] transition-shadow duration-500 group-hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] group-hover:ring-primary/40">
        <div className="skeleton absolute inset-0" aria-hidden="true" />
        <Poster movie={movie} />

        {/* Legibility scrim for the rating + rank chips */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {movie.rating !== null && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-rating opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <StarIcon className="h-2.5 w-2.5" />
            {movie.rating.toFixed(1)}
          </span>
        )}

        {rank !== undefined && (
          <span className="absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[11px] text-foreground/90 backdrop-blur-sm">
            {String(rank).padStart(2, '0')}
          </span>
        )}
      </div>
      </Tilt>

      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary-hover">
          {movie.title}
        </h3>
        <p className="mt-1 font-mono text-xs text-subtle-foreground">
          {movie.year ?? '—'}
        </p>
      </div>
    </>
  )

  return (
    <article
      className={cn('reveal group relative min-w-0', className)}
      style={{ ['--i' as string]: Math.min(index, 12) }}
    >
      {movie.slug ? (
        <Link
          to={`/movie/${movie.slug}`}
          className="block rounded-md outline-offset-4"
          aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ''}`}
        >
          {body}
        </Link>
      ) : (
        <div>{body}</div>
      )}

      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
        onClick={() =>
          toggle({
            id: movie.id,
            slug: movie.slug,
            title: movie.title,
            year: movie.year,
            posterUrl: movie.posterUrl,
            rating: movie.rating,
          })
        }
        className={cn(
          'absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
          'focus-visible:opacity-100 active:scale-90',
          saved
            ? 'bg-primary text-primary-foreground opacity-100'
            : 'bg-black/55 text-foreground opacity-0 hover:bg-black/75 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
        )}
      >
        <BookmarkIcon key={String(saved)} className={cn('h-4 w-4', saved && 'pop')} filled={saved} />
      </button>
    </article>
  )
}
