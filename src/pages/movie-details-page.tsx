/**
 * src/pages/movie-details-page.tsx
 * — Film detail, scraped from the iCheckMovies detail page.
 *
 * Ratings and votes are IMDb figures republished by iCheckMovies and are
 * labelled as such. iCheckMovies publishes no synopsis, so none is shown.
 */

import * as React from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  describeScraperError,
  fetchMovieDetails,
  type NormalizedMovie,
} from '@/services/scraping'
import { movieKeys } from '@/services/scraping/query-keys'
import { useIsInWatchlist, useWatchlistActions } from '@/hooks/use-watchlist'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton/skeleton'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BookmarkIcon,
  StarIcon,
} from '@/components/ui/icons'
import { CountUp } from '@/components/motion/count-up'
import { Reveal, SplitText } from '@/components/motion/reveal'
import { Tilt } from '@/components/motion/tilt'
import { formatRuntime } from '@/lib/format'
import { cn } from '@/lib/utils'

function BackLink() {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = location.key !== 'default'

  return (
    <button
      type="button"
      onClick={() => (canGoBack ? navigate(-1) : navigate('/explore'))}
      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
      Back
    </button>
  )
}

function Backdrop({ posterUrl }: { posterUrl: string | null }) {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[75vh] overflow-hidden">
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full scale-125 object-cover opacity-[0.2] blur-3xl saturate-[0.6]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/70 to-background" />
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="border-t border-border pt-4">
      <dt className="kicker">{label}</dt>
      <dd
        className={cn(
          'mt-3 font-display text-4xl leading-none tabular-nums sm:text-5xl',
          accent && 'text-rating'
        )}
      >
        {value}
      </dd>
    </div>
  )
}

const num = (value: number | null) => (value === null ? '—' : <CountUp value={value} />)

function DetailsSkeleton() {
  return (
    <div className="wrap pb-6 pt-24" aria-busy="true">
      <p className="sr-only">Loading film…</p>
      <Skeleton className="h-5 w-16" />
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(220px,340px)_1fr] lg:gap-16">
        <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[260px] md:max-w-none" />
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-20 w-full max-w-xl sm:h-28" />
          <Skeleton className="h-8 w-64 rounded-full" />
          <Skeleton className="h-12 w-52 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function MovieDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>()

  const { data, isLoading, isError, error, refetch } = useQuery<NormalizedMovie, Error>({
    queryKey: movieKeys.detail(slug),
    queryFn: ({ signal }) => fetchMovieDetails(slug, { signal }),
    enabled: slug.length > 0,
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const saved = useIsInWatchlist(data?.id ?? '')
  const { toggle } = useWatchlistActions()

  if (!slug) {
    return (
      <div className="wrap pt-32">
        <p className="text-muted-foreground">No film selected.</p>
      </div>
    )
  }

  if (isLoading) return <DetailsSkeleton />

  if (isError || !data) {
    return (
      <div className="page-enter wrap pb-6 pt-24">
        <BackLink />
        <div className="mx-auto max-w-lg py-24 text-center" role="alert">
          <p className="font-display text-5xl leading-tight">Couldn’t open this film</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            {error ? describeScraperError(error) : 'The film may not be in the catalogue.'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => void refetch().catch(() => undefined)}>Try again</Button>
            <Link to="/explore" className={buttonVariants({ variant: 'outline' })}>
              Explore films
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const meta = [data.year, data.runtime ? formatRuntime(data.runtime) : null].filter(Boolean)
  const imdbUrl =
    data.imdbId && /^tt\d+$/.test(data.imdbId)
      ? `https://www.imdb.com/title/${data.imdbId}/`
      : null

  return (
    <article className="page-enter relative isolate">
      <Backdrop posterUrl={data.posterUrl} />

      <div className="wrap pb-6 pt-24">
        <BackLink />

        <div className="mt-8 grid gap-x-16 gap-y-10 md:grid-cols-[minmax(220px,340px)_1fr] md:items-start">
          {/* Poster */}
          <div className="md:sticky md:top-24">
            <Tilt max={6} className="mx-auto w-full max-w-[260px] rounded-md md:max-w-none">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface-2 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
              {data.posterUrl ? (
                <img
                  src={data.posterUrl}
                  alt={`Poster for ${data.title}`}
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col justify-between bg-gradient-to-br from-surface-3 to-surface p-5">
                  <span className="kicker">No poster</span>
                  <span className="font-display text-3xl leading-tight text-foreground/80">
                    {data.title}
                  </span>
                </div>
              )}
            </div>
            </Tilt>
          </div>

          {/* Info */}
          <div className="min-w-0">
            {meta.length > 0 && (
              <p className="kicker mb-5 flex items-center gap-3">
                {meta.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="h-3 w-px bg-border-strong" aria-hidden="true" />}
                    {item}
                  </React.Fragment>
                ))}
              </p>
            )}

            <h1 className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.94] tracking-tight text-balance">
              <SplitText text={data.title} delay={120} />
            </h1>

            {data.directors.length > 0 && (
              <p className="mt-5 text-[15px] text-muted-foreground">
                Directed by{' '}
                <span className="text-foreground">{data.directors.join(', ')}</span>
              </p>
            )}

            {data.genres.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <li key={genre}>
                    <Link
                      to={`/explore?genre=${encodeURIComponent(genre.toLowerCase())}`}
                      className="inline-flex h-8 items-center rounded-full border border-border-strong px-3.5 text-[13px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {genre}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                aria-pressed={saved}
                onClick={() => toggle(data)}
                className={cn(saved && 'bg-primary text-primary-foreground hover:bg-primary-hover')}
              >
                <BookmarkIcon className="h-4 w-4" filled={saved} />
                {saved ? 'In your watchlist' : 'Add to watchlist'}
              </Button>
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: 'lg', variant: 'outline' })}
              >
                iCheckMovies <ArrowUpRightIcon className="h-4 w-4" />
              </a>
              {imdbUrl && (
                <a
                  href={imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ size: 'lg', variant: 'ghost' })}
                >
                  IMDb <ArrowUpRightIcon className="h-4 w-4" />
                </a>
              )}
            </div>

            <Reveal as="div" kind="up"><dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
              <Stat
                label="IMDb rating"
                accent
                value={
                  data.rating !== null ? (
                    <span className="inline-flex items-baseline gap-1.5">
                      {data.rating.toFixed(1)}
                      <StarIcon className="h-4 w-4 self-center" />
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
              <Stat label="IMDb votes" value={num(data.votes)} />
              <Stat label="Checks" value={num(data.checks)} />
              <Stat label="Favorites" value={num(data.favorites)} />
              {data.officialListCount !== null && (
                <Stat label="Official lists" value={num(data.officialListCount)} />
              )}
              {data.dislikes !== null && <Stat label="Dislikes" value={num(data.dislikes)} />}
            </dl></Reveal>

            <p className="mt-12 max-w-xl border-t border-border pt-5 text-xs leading-relaxed text-subtle-foreground">
              Ratings and votes are IMDb figures republished by iCheckMovies, which
              doesn’t publish synopses — so there isn’t one here.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
