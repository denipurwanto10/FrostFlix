import * as React from 'react'
import { cn } from '@/lib/utils'
import { useUrlFilters } from '@/hooks/use-url-filters'
import {
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_SORT,
  ERA_OPTIONS,
  ICHECKMOVIES_GENRES,
  type CatalogSort,
  type Era,
} from '@/services/scraping/types'
import { Select } from '@/components/ui/select'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@/components/ui/icons'

const ERA_SELECT_OPTIONS = [
  { value: '', label: 'Any era' },
  ...ERA_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const SORT_SELECT_OPTIONS = CATALOG_SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

function chipClass(active: boolean) {
  return cn(
    'inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-border-strong text-muted-foreground hover:border-foreground/40 hover:text-foreground'
  )
}

function StripArrow({
  direction,
  hidden,
  onClick,
}: {
  direction: 'prev' | 'next'
  hidden: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 hidden w-16 items-center transition-opacity duration-200 [@media(hover:hover)]:flex',
        direction === 'prev'
          ? 'left-0 justify-start bg-gradient-to-r from-background via-background/80 to-transparent'
          : 'right-0 justify-end bg-gradient-to-l from-background via-background/80 to-transparent',
        hidden && 'opacity-0'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
        aria-label={direction === 'prev' ? 'Scroll genres back' : 'Scroll genres forward'}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-foreground transition-colors hover:border-primary/50',
          hidden ? 'pointer-events-none' : 'pointer-events-auto'
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Horizontally scrolling genre chips with edge fades + arrows (mouse) / swipe (touch). */
function GenreStrip({
  genre,
  onSelect,
}: {
  genre: string | null
  onSelect: (genre: string | undefined) => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    })
  }, [])

  React.useEffect(() => {
    measure()
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])

  // Bring the active chip into view when arriving via a link.
  React.useEffect(() => {
    const el = ref.current
    const active = el?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!el || !active) return
    el.scrollTo({
      left: active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2,
      behavior: 'smooth',
    })
  }, [genre])

  const page = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.7, behavior: 'smooth' })

  return (
    <div className="relative min-w-0 lg:flex-1">
      <div
        ref={ref}
        onScroll={measure}
        role="group"
        aria-label="Genre"
        className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto overscroll-x-contain px-[var(--gutter)] py-0.5 lg:mx-0 lg:px-0"
      >
        <button type="button" aria-pressed={genre === null} onClick={() => onSelect(undefined)} className={chipClass(genre === null)}>
          All
        </button>
        {ICHECKMOVIES_GENRES.map((g) => {
          const slug = g.toLowerCase()
          const active = genre === slug
          return (
            <button
              key={g}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? undefined : slug)}
              className={chipClass(active)}
            >
              {g}
            </button>
          )
        })}
      </div>
      <StripArrow direction="prev" hidden={edges.start} onClick={() => page(-1)} />
      <StripArrow direction="next" hidden={edges.end} onClick={() => page(1)} />
    </div>
  )
}

/**
 * FilterBar — Explore filters. The URL is the source of truth
 * (see useUrlFilters).
 *
 * ≥1024px: genre strip and the two selects share one line.
 * <1024px: the strip sits above a two-column control row.
 * Sticks under the 4rem navbar.
 */
export function FilterBar() {
  const {
    query: { sort, genre, era },
    setSort,
    setGenre,
    setEra,
    resetFilters,
  } = useUrlFilters()

  const hasActive = genre !== null || era !== null || sort !== DEFAULT_CATALOG_SORT

  return (
    <section
      aria-label="Film filters"
      className="sticky top-16 z-30 border-y border-border bg-background/85 backdrop-blur-xl"
    >
      <div className="wrap flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-6">
        <GenreStrip genre={genre} onSelect={setGenre} />

        <div className="flex items-center gap-2.5">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:flex-none sm:grid-cols-[10.5rem_14rem]">
            <Select
              label="Era"
              showLabel
              value={era ?? ''}
              options={ERA_SELECT_OPTIONS}
              onChange={(value) => setEra(value === '' ? undefined : (value as Era))}
            />
            <Select
              label="Sort"
              showLabel
              align="end"
              value={sort}
              options={SORT_SELECT_OPTIONS}
              onChange={(value) =>
                setSort(value === DEFAULT_CATALOG_SORT ? undefined : (value as CatalogSort))
              }
            />
          </div>

          {hasActive && (
            <button
              type="button"
              onClick={resetFilters}
              aria-label="Reset filters"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
