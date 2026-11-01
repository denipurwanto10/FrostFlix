/**
 * src/pages/search-page.tsx
 * — Search the iCheckMovies catalogue. The query lives in the URL (?q=), the
 * input is a debounced two-way mirror of it.
 */

import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useSearchMovies } from '@/hooks/use-search-movies'
import { describeScraperError } from '@/services/scraping'
import { ICHECKMOVIES_GENRES, type MovieCardData } from '@/services/scraping/types'
import {
  GridMessage,
  LoadMore,
  MovieCardGrid,
  MovieGridSkeleton,
} from '@/components/movie/movie-grid'
import { Button } from '@/components/ui/button'
import { CloseIcon, SearchIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const TRY_THESE = ['Stalker', 'Chungking Express', 'Heat', 'Paprika', 'Hunger', 'Alien']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''

  const [text, setText] = React.useState(urlQuery)
  const lastWritten = React.useRef(urlQuery)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { value: debounced } = useDebouncedValue(text, 350)
  const query = debounced.trim()

  // URL → input, only for navigations we didn't cause ourselves
  // (e.g. the navbar search, back/forward).
  React.useEffect(() => {
    if (urlQuery === lastWritten.current) return
    lastWritten.current = urlQuery
    setText(urlQuery)
  }, [urlQuery])

  // Debounced input → URL (replace, so typing doesn't spam history).
  React.useEffect(() => {
    if (query === lastWritten.current) return
    lastWritten.current = query
    setParams(query ? { q: query } : {}, { replace: true })
  }, [query, setParams])

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoading,
    isLoadingError,
    refetch,
  } = useSearchMovies(query)

  const movies = React.useMemo(() => {
    const seen = new Set<string>()
    const list: MovieCardData[] = []
    for (const page of data?.pages ?? []) {
      for (const movie of page.movies) {
        if (seen.has(movie.id)) continue
        seen.add(movie.id)
        list.push(movie)
      }
    }
    return list
  }, [data])

  const total = data?.pages[0]?.paging.totalItemCount ?? movies.length
  const searchable = query.length >= 2
  const settling = text.trim() !== query // still typing

  const loadMore = React.useCallback(() => {
    void fetchNextPage().catch(() => undefined)
  }, [fetchNextPage])

  const clear = () => {
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="page-enter wrap pb-6 pt-28 sm:pt-36">
      <p className="kicker mb-5">Search</p>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          inputRef.current?.blur()
        }}
        className="group relative"
      >
        <SearchIcon className="pointer-events-none absolute left-0 top-1/2 h-7 w-7 -translate-y-1/2 text-subtle-foreground transition-colors group-focus-within:text-primary sm:h-9 sm:w-9" />
        <input
          ref={inputRef}
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Find a film"
          aria-label="Search films"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          autoFocus={!urlQuery}
          className="h-20 w-full border-b border-border-strong bg-transparent pl-11 pr-12 font-display text-[clamp(2.25rem,7vw,5rem)] leading-none tracking-tight text-foreground outline-none transition-colors placeholder:text-border-strong focus:border-primary/60 sm:h-28 sm:pl-16 [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-0 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      <div className="mt-8 min-h-[40vh]" aria-live="polite">
        {!searchable ? (
          <div className="grid gap-12 pt-4 md:grid-cols-2">
            <div>
              <p className="kicker mb-5">
                {query.length === 1 ? 'Keep typing — two letters minimum' : 'Try'}
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {TRY_THESE.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => setText(term)}
                      className="rounded-full border border-border-strong px-4 py-2 font-display text-xl leading-none text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker mb-5">Or browse</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
                {ICHECKMOVIES_GENRES.slice(0, 12).map((genre) => (
                  <li key={genre}>
                    <Link
                      to={`/explore?genre=${genre.toLowerCase()}`}
                      className="text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
                    >
                      {genre}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/explore" className="text-primary underline-offset-4 hover:underline">
                    All genres →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ) : isLoading ? (
          <div aria-busy="true">
            <p className="sr-only">Searching…</p>
            <MovieGridSkeleton count={12} />
          </div>
        ) : isLoadingError ? (
          <GridMessage
            role="alert"
            title="Search failed"
            action={
              <Button variant="outline" onClick={() => void refetch().catch(() => undefined)}>
                Try again
              </Button>
            }
          >
            {describeScraperError(error)}
          </GridMessage>
        ) : movies.length === 0 ? (
          <GridMessage title={`No films for “${query}”`}>
            Check the spelling, or try a shorter title.
          </GridMessage>
        ) : (
          <div className={cn('transition-opacity duration-300', settling && 'opacity-60')}>
            <p className="mb-8 font-mono text-xs text-subtle-foreground">
              <span className="text-foreground">{total.toLocaleString()}</span>{' '}
              {total === 1 ? 'result' : 'results'} for “{query}”
            </p>
            <MovieCardGrid movies={movies} />
            <LoadMore
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isError={isFetchNextPageError}
              onLoadMore={loadMore}
              total={movies.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}
