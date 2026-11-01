/**
 * src/hooks/use-watchlist.ts
 * — localStorage-backed watchlist with a stable external-store snapshot.
 *
 * Storage format: `frostflix:watchlist:v2`.
 * Legacy `frostflix:watchlist:v1` entries are migrated once, preserving title,
 * year, rating and addedAt. Their TMDB poster paths and numeric ids cannot be
 * turned into iCheckMovies URLs, so those items keep `slug: null` and
 * `posterUrl: null` instead of inventing data.
 */

import { useSyncExternalStore } from 'react'
import type { MovieCardData } from '@/services/scraping'

const WATCHLIST_KEY = 'frostflix:watchlist:v2'
const LEGACY_WATCHLIST_KEY = 'frostflix:watchlist:v1'
const MAX_ITEMS = 500

export interface WatchlistItem extends MovieCardData {
  addedAt: string
}

export interface WatchlistSnapshot {
  items: readonly WatchlistItem[]
  count: number
}

const EMPTY_SNAPSHOT: WatchlistSnapshot = { items: [], count: 0 }

const listeners = new Set<() => void>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeItem(value: unknown): WatchlistItem | null {
  if (!isRecord(value)) return null

  const id = typeof value.id === 'string' ? value.id : null
  const title = typeof value.title === 'string' ? value.title.trim() : ''
  if (!id || !title) return null

  return {
    id,
    slug:
      typeof value.slug === 'string' && value.slug.length > 0
        ? value.slug
        : null,
    title,
    year:
      typeof value.year === 'number' && Number.isFinite(value.year)
        ? value.year
        : null,
    posterUrl:
      typeof value.posterUrl === 'string' && value.posterUrl.length > 0
        ? value.posterUrl
        : null,
    rating:
      typeof value.rating === 'number' && Number.isFinite(value.rating)
        ? value.rating
        : null,
    addedAt:
      typeof value.addedAt === 'string'
        ? value.addedAt
        : new Date().toISOString(),
  }
}

function writeRaw(items: readonly WatchlistItem[]): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(
      WATCHLIST_KEY,
      JSON.stringify({ version: 2, data: { items } })
    )
    return true
  } catch {
    return false
  }
}

function readLegacy(): WatchlistItem[] {
  if (typeof window === 'undefined') return []

  let raw: string | null
  try {
    raw = localStorage.getItem(LEGACY_WATCHLIST_KEY)
  } catch {
    return []
  }

  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== 1) return []

    const data = isRecord(parsed.data) ? parsed.data : null
    const rawItems = data && Array.isArray(data.items) ? data.items : []
    const migrated: WatchlistItem[] = []

    for (const value of rawItems) {
      if (!isRecord(value)) continue

      const legacyId =
        typeof value.id === 'number' && Number.isFinite(value.id)
          ? value.id
          : null
      const title =
        typeof value.title === 'string' ? value.title.trim() : ''

      if (legacyId === null || !title) continue

      const releaseDate =
        typeof value.releaseDate === 'string' ? value.releaseDate : ''
      const yearMatch = /^(\d{4})/.exec(releaseDate)
      const year = yearMatch?.[1]
        ? Number.parseInt(yearMatch[1], 10)
        : null
      const voteAverage =
        typeof value.voteAverage === 'number' &&
        Number.isFinite(value.voteAverage)
          ? value.voteAverage
          : null

      migrated.push({
        id: `legacy:${legacyId}`,
        slug: null,
        title,
        year: year !== null && Number.isFinite(year) ? year : null,
        posterUrl: null,
        rating:
          voteAverage !== null && voteAverage > 0 ? voteAverage : null,
        addedAt:
          typeof value.addedAt === 'string'
            ? value.addedAt
            : new Date().toISOString(),
      })
    }

    return migrated.slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function readSnapshot(): WatchlistSnapshot {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT

  let raw: string | null
  try {
    raw = localStorage.getItem(WATCHLIST_KEY)
  } catch {
    return EMPTY_SNAPSHOT
  }

  if (!raw) {
    const legacy = readLegacy()
    if (legacy.length === 0) return EMPTY_SNAPSHOT

    if (writeRaw(legacy)) {
      try {
        localStorage.removeItem(LEGACY_WATCHLIST_KEY)
      } catch {
        // Keep the legacy key if it cannot be removed; v2 is already written.
      }
    }

    return { items: legacy, count: legacy.length }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== 2) {
      return EMPTY_SNAPSHOT
    }

    const data = isRecord(parsed.data) ? parsed.data : null
    const rawItems = data && Array.isArray(data.items) ? data.items : []
    const items: WatchlistItem[] = []

    for (const value of rawItems) {
      const item = sanitizeItem(value)
      if (item) items.push(item)
    }

    const limited = items.slice(0, MAX_ITEMS)
    return { items: limited, count: limited.length }
  } catch {
    return EMPTY_SNAPSHOT
  }
}

let snapshot: WatchlistSnapshot = readSnapshot()

function emit(): void {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): WatchlistSnapshot {
  return snapshot
}

function add(movie: MovieCardData): void {
  if (snapshot.items.some((item) => item.id === movie.id)) return

  const nextItem: WatchlistItem = {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    year: movie.year,
    posterUrl: movie.posterUrl,
    rating: movie.rating,
    addedAt: new Date().toISOString(),
  }

  const next = [nextItem, ...snapshot.items].slice(0, MAX_ITEMS)
  writeRaw(next)
  snapshot = { items: next, count: next.length }
  emit()
}

function remove(id: string): void {
  const next = snapshot.items.filter((item) => item.id !== id)
  writeRaw(next)
  snapshot =
    next.length === 0 ? EMPTY_SNAPSHOT : { items: next, count: next.length }
  emit()
}

function clearAll(): void {
  if (
    typeof window !== 'undefined' &&
    !window.confirm('Remove all movies from your watchlist?')
  ) {
    return
  }

  try {
    localStorage.removeItem(WATCHLIST_KEY)
    localStorage.removeItem(LEGACY_WATCHLIST_KEY)
  } catch {
    // The UI still clears for this session.
  }

  snapshot = EMPTY_SNAPSHOT
  emit()
}

function toggle(movie: MovieCardData): void {
  if (snapshot.items.some((item) => item.id === movie.id)) {
    remove(movie.id)
  } else {
    add(movie)
  }
}

const actions = { add, remove, clearAll, toggle }

export function useWatchlist(): WatchlistSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useWatchlistActions(): typeof actions {
  return actions
}

export function useIsInWatchlist(id: string): boolean {
  const { items } = useWatchlist()
  return items.some((item) => item.id === id)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (
      event.key === WATCHLIST_KEY ||
      event.key === LEGACY_WATCHLIST_KEY
    ) {
      snapshot = readSnapshot()
      emit()
    }
  })
}
