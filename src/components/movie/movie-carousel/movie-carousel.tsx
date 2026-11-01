import * as React from 'react'
import type { MovieCardData } from '@/services/scraping/types'
import { MovieCard } from '@/components/movie/movie-card'
import { Skeleton } from '@/components/ui/skeleton/skeleton'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export interface MovieCarouselProps {
  movies: readonly MovieCardData[]
  /** Accessible name for the rail. */
  label: string
  /** Show 01, 02, … rank chips on the posters. */
  ranked?: boolean
}

/** Card width per breakpoint — shared by the cards and the arrow offsets. */
const RAIL_VARS =
  '[--card-w:42vw] sm:[--card-w:27vw] md:[--card-w:20vw] lg:[--card-w:15.5vw] xl:[--card-w:200px] min-[1920px]:[--card-w:224px]'

const ITEM_CLASS = 'w-[var(--card-w)] shrink-0 snap-start'

function RailArrow({
  direction,
  onClick,
  hidden,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  hidden: boolean
}) {
  const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      aria-label={direction === 'prev' ? 'Scroll back' : 'Scroll forward'}
      className={cn(
        // Arrows are a mouse affordance; touch users swipe.
        'absolute top-[calc(var(--card-w)*0.75)] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-border-strong bg-background/85 text-foreground backdrop-blur-md',
        'transition-all duration-200 hover:border-primary/50 hover:bg-surface-2 [@media(hover:hover)]:inline-flex',
        direction === 'prev' ? 'left-3 xl:left-6' : 'right-3 xl:right-6',
        hidden && 'pointer-events-none opacity-0'
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

export function MovieCarousel({ movies, label, ranked = false }: MovieCarouselProps) {
  const scroller = React.useRef<HTMLUListElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const measure = React.useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    })
  }, [])

  React.useEffect(() => {
    measure()
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure, movies.length])

  const page = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('relative', RAIL_VARS)}
    >
      <ul
        ref={scroller}
        onScroll={measure}
        className="rail-inset no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain pb-2 sm:gap-5"
      >
        {movies.map((movie, index) => (
          <li key={movie.id} className={ITEM_CLASS}>
            <MovieCard
              movie={movie}
              index={index}
              rank={ranked ? index + 1 : undefined}
            />
          </li>
        ))}
        {/* Trailing spacer so the last card can snap to the gutter */}
        <li aria-hidden="true" className="w-px shrink-0" />
      </ul>

      <RailArrow direction="prev" hidden={edges.start} onClick={() => page(-1)} />
      <RailArrow direction="next" hidden={edges.end} onClick={() => page(1)} />
    </section>
  )
}

export function MovieCarouselSkeleton() {
  return (
    <div
      className={cn('rail-inset no-scrollbar flex gap-4 overflow-hidden sm:gap-5', RAIL_VARS)}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={ITEM_CLASS}>
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/4" />
        </div>
      ))}
    </div>
  )
}
