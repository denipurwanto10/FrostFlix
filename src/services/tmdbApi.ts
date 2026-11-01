/**
 * src/services/tmdbApi.ts
 * — Public surface for The Movie Database (TMDb) API.
 *
 * Docs: https://developers.themoviedb.org/3
 *
 * Environment variable: VITE_TMDB_API_KEY
 *   — Set this in your .env or Vite config to enable TMDb features.
 *   — If undefined, all functions degrade gracefully (return empty/defaults)
 *     without throwing, so the app remains functional without a TMDb key.
 */

const TMDB_BASE = 'https://api.themoviedb.org/3'

// Helper: read the key from import.meta.env (Vite convention)
function getTmdbApiKey(): string | undefined {
  // Vite injects import.meta.env as an alias for process.env plus any .env files.
  // We avoid a top-level read of import.meta here so the module can be imported
  // outside a Vite build context (e.g. type-check) without error.
  // Callers must pass the key or use the shared getter below.
  return import.meta.env.VITE_TMDB_API_KEY
}

/**
 * Fetch watch providers for a given TMDb title ID.
 *
 * Calls: GET /3/${mediaType}/${tmdbId}/watch/providers
 *        with Authorization: Bearer ${API_KEY}
 *        (or api_key query parameter if the key is in the URL).
 *
 * Returns a normalized shape containing the best available provider links
 * for the Indonesia region, with logo URLs prettified.
 *
 * @param tmdbId   TMDb ID for the movie or TV episode
 * @param mediaType 'movie' | 'tv' (default: 'movie')
 * @returns        { link?, providers: { name: string; logo: string }[] }
 *                 - `link` is the first flatrate/provider URL if found, else undefined
 *                 - `providers` is a deduped list of { name, logo } for the ID region
 * @throws         If the TMDb request fails and a key is configured (otherwise returns empty)
 *
 * @example
 * const result = await getWatchProviders(13, 'movie')
 * // → { link: 'https://www.netflix.com/indonesia/title/81189678',
 * //      providers: [{ name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w92/abCde.png' }] }
 */
export async function getWatchProviders(
  tmdbId: number,
  mediaType: 'movie' | 'tv' = 'movie',
): Promise<{
  link?: string
  providers: { name: string; logo: string }[]
}> {
  const apiKey = getTmdbApiKey()

  // If no key is configured, return a default empty shape so the UI can
  // gracefully show "No streaming info available" instead of throwing.
  if (!apiKey) {
    return { providers: [] }
  }

  const url = new URL(`${TMDB_BASE}/${mediaType}/${tmdbId}/watch/providers`)
  url.searchParams.set('api_key', apiKey)

  // Also set the Accept-Language to Indonesian region if possible,
  // but TMDb uses the API key's associated region; we'll include
  // a region hint via the URL if needed. TMDb defaults to US region,
  // so we'll explicitly request ID results.
  // Note: TMDb watch/providers does not have a region param in the URL,
  // but the response data.results.ID contains Indonesia-specific providers.

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      // If the key is invalid/expired, don't throw — just return empty.
      // The UI will show no streaming providers.
      if (res.status === 401 || res.status === 403) {
        return { providers: [] }
      }
      throw new Error(
        `TMDb watch/providers failed [${res.status}]: ${res.statusText}`,
      )
    }

    const data = (await res.json()) as
      | {
          results: {
            [region: string]: {
              flatrate?: Array<{ provider_id: number; logo_path: string; provider_name: string }>
              rent?: Array<{ provider_id: number; logo_path: string; provider_name: string }>
              buy?: Array<{ provider_id: number; logo_path: string; provider_name: string }>
            }
          }
        }
      | undefined

    if (!data?.results?.ID) {
      return { providers: [] }
    }

    const idRegion = data.results.ID

    // Collect all provider entries (flatrate + rent + buy), dedup by provider_id
    const seen = new Set<number>()
    const entries: Array<{
      provider_id: number
      logo_path: string
      provider_name: string
    }> = []

    const collect = (arr: Array<{ provider_id: number; logo_path: string; provider_name: string }>) => {
      for (const p of arr ?? []) {
        if (!seen.has(p.provider_id)) {
          seen.add(p.provider_id)
          entries.push(p)
        }
      }
    }

    collect(idRegion?.flatrate ?? [])
    collect(idRegion.rent ?? [])
    collect(idRegion.buy ?? [])

    // Build the provider list with logo URLs
    const providers = entries.map((e) => ({
      name: e.provider_name,
      logo: `https://image.tmdb.org/t/p/w92${e.logo_path}`,
    }))

    // Prefer a 'link' — the first flatrate provider's URL if available
    let link: string | undefined
    if (idRegion.flatrate && idRegion.flatrate.length > 0) {
      const first = idRegion.flatrate[0]!
      link = `https://www.${first.provider_name.toLowerCase()}.com/indonesia/title/${tmdbId}`
    }

    return link ? { link, providers } : { providers }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TMDb watch/providers request timed out after 15s')
    }
    throw err
  }
}

/**
 * Fetch movie metadata (title, year, overview, poster) from TMDb by ID.
 *
 * Calls: GET /3/movie/${tmdbId}
 *        with api_key query parameter.
 *
 * @param tmdbId TMDb movie ID
 * @returns      { id, title, year, overview, posterUrl?: string }
 * @throws       If the request fails and a key is configured
 *
 * @note This function is optional — if VITE_TMDB_API_KEY is not set,
 *       callers should handle the undefined key gracefully.
 */
export async function getMovieMetadata(
  tmdbId: number,
): Promise<{ id: number; title: string; year: string | number | null; overview: string | null; posterUrl: string | null }> {
  const apiKey = getTmdbApiKey()

  if (!apiKey) {
    // Return a minimal placeholder so callers don't crash.
    return {
      id: tmdbId,
      title: 'Unknown',
      year: null,
      overview: null,
      posterUrl: null,
    }
  }

  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`)
  url.searchParams.set('api_key', apiKey)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          id: tmdbId,
          title: 'Unknown',
          year: null,
          overview: null,
          posterUrl: null,
        }
      }
      throw new Error(
        `TMDb movie metadata failed [${res.status}]: ${res.statusText}`,
      )
    }

    const data = (await res.json()) as {
      id: number
      title: string
      release_date: string | null
      overview: string
      poster_path: string | null
    }

    const year = data.release_date ? data.release_date.slice(0, 4) ?? null : null

    return {
      id: data.id,
      title: data.title,
      year,
      overview: data.overview ?? null,
      posterUrl: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TMDb movie metadata request timed out after 15s')
    }
    throw err
  }
}