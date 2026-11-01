/**
 * src/services/scraping/icheckmovies/client.ts
 * — Browser fetch layer for iCheckMovies.
 *
 * Responsibilities:
 * - Fetch only iCheckMovies URLs that the app supports.
 * - Serialize requests with a small gap so a burst cannot trip Cloudflare.
 * - Apply a hard timeout and respect AbortSignal.
 * - Convert every failure into a typed ScraperError.
 * - Detect Cloudflare security-check pages and back off instead of retrying.
 * - Deduplicate identical in-flight GETs.
 *
 * No CORS workaround, proxy, CAPTCHA solver or authentication is used. When
 * iCheckMovies blocks a request, the app reports it.
 */

import { ICHECKMOVIES_ORIGIN } from './config'
import { ScraperError } from './errors'

export interface FetchHtmlOptions {
  signal?: AbortSignal | undefined
  timeout?: number | undefined
}

const REQUEST_TIMEOUT_MS = 20_000
const MIN_REQUEST_INTERVAL_MS = 650
const BLOCK_COOLDOWN_MS = 60_000

let lastRequestAt = 0
let cooldownUntil = 0

// Requests run one at a time. This keeps the first Home load (five real
// categories) from arriving as a burst.
let chain: Promise<void> = Promise.resolve()

const inFlight = new Map<string, Promise<string>>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000)
  }

  const timestamp = Date.parse(value)
  if (Number.isFinite(timestamp)) {
    return Math.max(0, timestamp - Date.now())
  }

  return undefined
}

function isSecurityChallenge(text: string): boolean {
  return /<title>\s*Just a moment\.\.\.\s*<\/title>|Performing security verification|cf-browser-verification|__cf_chl_/i.test(
    text
  )
}

function assertAllowedUrl(url: string): URL {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    throw new ScraperError('network', 'Invalid iCheckMovies URL.')
  }

  if (parsed.origin !== ICHECKMOVIES_ORIGIN) {
    throw new ScraperError(
      'network',
      'FrostFlix refused to fetch a URL outside iCheckMovies.'
    )
  }

  if (
    !parsed.pathname.startsWith('/movies/') &&
    !parsed.pathname.startsWith('/search/')
  ) {
    throw new ScraperError(
      'network',
      'FrostFlix refused to fetch an unsupported iCheckMovies path.'
    )
  }

  return parsed
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

async function fetchHtmlNow(
  url: string,
  options: FetchHtmlOptions
): Promise<string> {
  const target = assertAllowedUrl(url)

  if (Date.now() < cooldownUntil) {
    throw new ScraperError(
      'blocked',
      'iCheckMovies asked for a security check. Waiting before trying again.',
      { retryAfterMs: cooldownUntil - Date.now() }
    )
  }

  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now()
  if (wait > 0) {
    await sleep(wait)
  }
  lastRequestAt = Date.now()

  const controller = new AbortController()
  const externalSignal = options.signal
  const onAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', onAbort, { once: true })

  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout ?? REQUEST_TIMEOUT_MS
  )

  try {
    let response: Response

    try {
      response = await fetch(target.toString(), {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      })
    } catch (error) {
      if (externalSignal?.aborted === true) {
        throw new ScraperError('aborted', 'The request was cancelled.')
      }

      if (controller.signal.aborted) {
        throw new ScraperError(
          'timeout',
          'iCheckMovies took too long to respond.'
        )
      }

      if (error instanceof TypeError) {
        throw new ScraperError(
          'cors',
          'The browser blocked the request to iCheckMovies, or the network is unavailable.'
        )
      }

      throw new ScraperError('network', 'The request to iCheckMovies failed.', {
        cause: error,
      })
    }

    if (!response.ok) {
      const retryAfterMs = parseRetryAfter(
        response.headers.get('retry-after')
      )

      if (
        response.status === 403 ||
        response.status === 429 ||
        response.status === 503
      ) {
        cooldownUntil =
          Date.now() + (retryAfterMs ?? BLOCK_COOLDOWN_MS)
      }

      throw new ScraperError(
        'http',
        `iCheckMovies returned HTTP ${response.status}.`,
        { status: response.status, retryAfterMs }
      )
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().includes('text/html')) {
      throw new ScraperError(
        'parse',
        `iCheckMovies returned ${contentType || 'an unknown content type'} instead of HTML.`
      )
    }

    let text: string

    try {
      text = await response.text()
    } catch (error) {
      if (externalSignal?.aborted === true) {
        throw new ScraperError('aborted', 'The request was cancelled.')
      }

      if (controller.signal.aborted) {
        throw new ScraperError(
          'timeout',
          'iCheckMovies took too long to respond.'
        )
      }

      throw new ScraperError(
        'network',
        'The iCheckMovies response could not be read.',
        { cause: error }
      )
    }

    if (isSecurityChallenge(text)) {
      cooldownUntil = Date.now() + BLOCK_COOLDOWN_MS
      throw new ScraperError(
        'blocked',
        'iCheckMovies is showing a security check instead of the page.',
        { retryAfterMs: BLOCK_COOLDOWN_MS }
      )
    }

    return text
  } finally {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', onAbort)
  }
}

/**
 * Fetch an iCheckMovies HTML page.
 *
 * Identical requests without an AbortSignal are deduplicated. Requests with a
 * signal are not shared, so cancelling one view cannot cancel another.
 */
export function fetchHtml(
  url: string,
  options: FetchHtmlOptions = {}
): Promise<string> {
  if (options.signal === undefined) {
    const existing = inFlight.get(url)
    if (existing) return existing
  }

  const promise = enqueue(() => fetchHtmlNow(url, options))

  if (options.signal === undefined) {
    inFlight.set(url, promise)
    void promise.then(
      () => {
        inFlight.delete(url)
      },
      () => {
        inFlight.delete(url)
      }
    )
  }

  return promise
}
