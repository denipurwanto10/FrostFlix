/**
 * src/services/scraping/icheckmovies/devalue.ts
 * — Minimal resolver for Nuxt's `__NUXT_DATA__` devalue payload.
 *
 * iCheckMovies list pages are server-rendered by Nuxt and embed their data as a
 * flat, devalue-serialized array. This module hydrates that array into plain
 * JavaScript values using the documented devalue format:
 *
 *   - array entries are values
 *   - numbers inside objects/arrays are references to other entries
 *   - `["Type", ...]` arrays are typed wrappers (Reactive, Ref, Date, Set, …)
 *
 * Only the types that occur on iCheckMovies pages are handled explicitly; any
 * unknown wrapper is resolved through its first reference.
 */

import { ScraperError } from './errors'

export function parseNuxtPayload(scriptText: string): unknown {
  let parsed: unknown

  try {
    parsed = JSON.parse(scriptText)
  } catch (error) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies data payload was not valid JSON.',
      { cause: error }
    )
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new ScraperError(
      'parse',
      'The iCheckMovies data payload had an unexpected shape.'
    )
  }

  const values: unknown[] = parsed
  const cache = new Map<number, unknown>()

  function asIndex(value: unknown): number {
    return typeof value === 'number' ? value : -1
  }

  function hydrateTyped(marker: string, rest: unknown[]): unknown {
    switch (marker) {
      case 'Date': {
        const raw = rest[0]
        return typeof raw === 'string' ? new Date(raw) : null
      }

      case 'Set':
        return rest.map((entry) => hydrate(asIndex(entry)))

      case 'Map': {
        const map = new Map<unknown, unknown>()
        for (let index = 0; index < rest.length; index += 2) {
          map.set(hydrate(asIndex(rest[index])), hydrate(asIndex(rest[index + 1])))
        }
        return map
      }

      case 'RegExp':
      case 'BigInt': {
        const raw = rest[0]
        return typeof raw === 'string' ? raw : null
      }

      case 'null':
        return null

      default: {
        // ShallowReactive, Reactive, Ref, ShallowRef, EmptyRef, Object, and
        // any future wrapper all point at their inner value through index 0.
        const first = rest[0]
        return first === undefined ? {} : hydrate(asIndex(first))
      }
    }
  }

  function hydrate(index: number): unknown {
    if (index === -1) return undefined
    if (index === -2) return Number.NaN
    if (index === -3) return Number.POSITIVE_INFINITY
    if (index === -4) return Number.NEGATIVE_INFINITY
    if (index === -5) return -0
    if (index < 0 || index >= values.length) return undefined

    if (cache.has(index)) return cache.get(index)

    const value = values[index]

    if (value === null || typeof value !== 'object') {
      cache.set(index, value)
      return value
    }

    if (Array.isArray(value)) {
      const marker = value[0]

      if (typeof marker === 'string') {
        const result = hydrateTyped(marker, value.slice(1))
        cache.set(index, result)
        return result
      }

      const array: unknown[] = []
      cache.set(index, array)
      for (const entry of value) {
        array.push(hydrate(asIndex(entry)))
      }
      return array
    }

    const record = value as Record<string, unknown>
    const object: Record<string, unknown> = {}
    cache.set(index, object)
    for (const key of Object.keys(record)) {
      object[key] = hydrate(asIndex(record[key]))
    }
    return object
  }

  return hydrate(0)
}
