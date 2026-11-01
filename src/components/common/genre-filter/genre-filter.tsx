import { cn } from '@/lib/utils'
import { ICHECKMOVIES_GENRES } from '@/services/scraping/types'
import { useUrlFilters } from '@/hooks/use-url-filters'

/**
 * GenreFilter — accessible genre selection controls for the Explore filter bar.
 *
 * Chips flow horizontally and wrap onto additional rows where space allows.
 * On narrow screens the row scrolls horizontally instead of collapsing into a
 * tall vertical column. Selecting a chip updates the URL filter state;
 * clicking the active chip clears the genre.
 */
export function GenreFilter() {
  const { setGenre, query: { genre } } = useUrlFilters()
  const genreId = genre

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
      aria-label="Genre filters"
      role="group"
    >
      {ICHECKMOVIES_GENRES.map((option) => {
        const isSelected = genreId === option
        return (
          <button
            key={option}
            type="button"
            className={cn(
              'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/60 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
            )}
            aria-pressed={isSelected}
            aria-label={
              isSelected
                ? `Remove filter: ${option}`
                : `Select ${option} genre`
            }
            onClick={() => {
              setGenre(isSelected ? undefined : option)
            }}
          >
            {option}
            {isSelected && (
              <svg
                className="h-3 w-3 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}