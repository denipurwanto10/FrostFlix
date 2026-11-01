/**
 * src/pages/home-page.tsx
 * — FrostFlix home: a pick of the day, then one rail per real iCheckMovies
 * list, then an index to browse by genre and decade.
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { useMovieCatalog } from '@/hooks/use-movie-catalog'
import {
  ERA_OPTIONS,
  HOME_CATEGORIES,
  ICHECKMOVIES_GENRES,
  type HomeCategory,
  type NormalizedMovie,
} from '@/services/scraping/types'
import { describeScraperError } from '@/services/scraping'
import { HeroBanner } from '@/components/movie/hero-banner'
import {
  MovieCarousel,
  MovieCarouselSkeleton,
} from '@/components/movie/movie-carousel'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { ArrowUpRightIcon } from '@/components/ui/icons'

function exploreHref(category: HomeCategory): string {
  const params = new URLSearchParams({ sort: category.sort })
  if (category.era) params.set('era', category.era)
  return `/explore?${params.toString()}`
}

/** A different title each day, stable within the day. */
function pickOfTheDay(movies: readonly NormalizedMovie[]): NormalizedMovie | null {
  const withPoster = movies.filter((movie) => movie.posterUrl)
  if (withPoster.length === 0) return null
  const dayNumber = Math.floor(Date.now() / 86_400_000)
  return withPoster[dayNumber % withPoster.length] ?? null
}

function HomeHero() {
  // Same query key as the first rail, so this costs no extra request.
  const { data, isPending } = useMovieCatalog({
    sort: 'favorites',
    genre: null,
    era: null,
  })

  const movie = React.useMemo(
    () => pickOfTheDay(data?.pages[0]?.movies.slice(0, 20) ?? []),
    [data]
  )

  return <HeroBanner movie={movie} loading={isPending} />
}

function HomeRow({ category, index }: { category: HomeCategory; index: number }) {
  const { data, isPending, isError, error, refetch } = useMovieCatalog({
    sort: category.sort,
    genre: null,
    era: category.era,
  })

  const movies = data?.pages[0]?.movies ?? []
  const kicker = `${String(index + 1).padStart(2, '0')} / ${String(HOME_CATEGORIES.length).padStart(2, '0')}`

  return (
    <section aria-label={category.label} className="py-10 sm:py-14">
      <div className="wrap mb-7 sm:mb-9">
        <SectionHeader
          kicker={kicker}
          title={category.label}
          subtitle={category.description}
          href={exploreHref(category)}
        />
      </div>

      {isPending && <MovieCarouselSkeleton />}

      {isError && (
        <div role="alert" className="wrap flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>{describeScraperError(error)}</span>
          <Button size="sm" variant="outline" onClick={() => void refetch().catch(() => undefined)}>
            Try again
          </Button>
        </div>
      )}

      {movies.length > 0 && (
        <Reveal kind="up">
          <MovieCarousel
            label={category.label}
            movies={movies}
            ranked={index < 2}
          />
        </Reveal>
      )}
    </section>
  )
}

function IndexLink({
  to,
  index,
  children,
}: {
  to: string
  index: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className="group flex items-baseline justify-between gap-3 border-b border-border py-4 transition-colors hover:border-primary/50"
    >
      <span className="flex items-baseline gap-4 min-w-0">
        <span className="kicker w-5 shrink-0 tabular-nums">{index}</span>
        <span className="truncate font-display text-[1.7rem] leading-none text-muted-foreground transition-colors duration-300 group-hover:text-foreground sm:text-3xl">
          {children}
        </span>
      </span>
      <ArrowUpRightIcon className="h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
    </Link>
  )
}

function BrowseIndex() {
  const decades = ERA_OPTIONS.filter((option) => option.value !== 'upcoming')

  return (
    <section aria-label="Browse" className="wrap py-10 sm:py-14">
      <SectionHeader
        kicker="Index"
        title="Browse by genre & decade"
        subtitle="Every route into the catalogue, laid out flat."
        className="mb-10"
      />

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="kicker mb-2">Genres</h3>
          <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {ICHECKMOVIES_GENRES.map((genre, i) => (
              <IndexLink
                key={genre}
                to={`/explore?genre=${encodeURIComponent(genre.toLowerCase())}`}
                index={String(i + 1).padStart(2, '0')}
              >
                {genre}
              </IndexLink>
            ))}
          </div>
        </div>

        <div>
          <h3 className="kicker mb-2">Decades</h3>
          <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {decades.map((decade, i) => (
              <IndexLink
                key={decade.value}
                to={`/explore?era=${decade.value}`}
                index={String(i + 1).padStart(2, '0')}
              >
                {decade.label}
              </IndexLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="divide-y divide-border/60">
        {HOME_CATEGORIES.map((category, index) => (
          <HomeRow key={category.key} category={category} index={index} />
        ))}
      </div>
      <BrowseIndex />
    </>
  )
}
