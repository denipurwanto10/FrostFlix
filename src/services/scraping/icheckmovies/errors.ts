/**
 * src/services/scraping/icheckmovies/errors.ts
 * — Typed errors and shared retry policy for the iCheckMovies data layer.
 */

export type ScraperErrorKind =
  | 'aborted'
  | 'blocked'
  | 'cors'
  | 'http'
  | 'network'
  | 'parse'
  | 'timeout'

export interface ScraperErrorOptions {
  status?: number | undefined
  retryAfterMs?: number | undefined
  cause?: unknown
}

export class ScraperError extends Error {
  readonly kind: ScraperErrorKind
  readonly status: number | undefined
  readonly retryAfterMs: number | undefined

  constructor(
    kind: ScraperErrorKind,
    message: string,
    options: ScraperErrorOptions = {}
  ) {
    super(message)
    this.name = 'ScraperError'
    this.kind = kind
    this.status = options.status
    this.retryAfterMs = options.retryAfterMs
    if (options.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

/** Human-readable copy for the UI. Never exposes raw internals. */
export function describeScraperError(error: unknown): string {
  if (error instanceof ScraperError) {
    switch (error.kind) {
      case 'aborted':
        return 'The request was cancelled.'
      case 'blocked':
        return 'iCheckMovies is showing a security check instead of the page. Wait a minute, then try again.'
      case 'cors':
        return 'The browser blocked the request to iCheckMovies (CORS), or the network is unavailable.'
      case 'http':
        return error.status === undefined
          ? 'iCheckMovies returned an error.'
          : `iCheckMovies returned HTTP ${error.status}.`
      case 'network':
        return 'Could not reach iCheckMovies. Check your connection and try again.'
      case 'parse':
        return 'iCheckMovies returned a page FrostFlix could not read.'
      case 'timeout':
        return 'iCheckMovies took too long to respond.'
    }
  }

  return error instanceof Error ? error.message : 'Something went wrong.'
}

/**
 * Retry policy. Transient failures get one retry. CORS, parse, security-check
 * and 4xx responses are not retried, because repeating them only makes a rate
 * limit worse.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ScraperError) {
    if (
      error.kind === 'aborted' ||
      error.kind === 'blocked' ||
      error.kind === 'cors' ||
      error.kind === 'parse'
    ) {
      return false
    }

    if (error.status !== undefined) {
      if (error.status === 403 || error.status === 404 || error.status === 429) {
        return false
      }
      if (error.status < 500) return false
    }
  }

  return failureCount < 1
}

export function retryDelay(attempt: number, error: unknown): number {
  if (error instanceof ScraperError && error.retryAfterMs !== undefined) {
    return Math.min(error.retryAfterMs, 30_000)
  }
  return Math.min(1_000 * 2 ** attempt, 8_000)
}
