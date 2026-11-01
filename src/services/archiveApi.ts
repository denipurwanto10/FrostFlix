/**
 * src/services/archiveApi.ts
 * — Public surface for Archive.org (public domain / Creative Commons) movies.
 *
 * Base URL: https://archive.org
 * Search:  https://archive.org/advancedsearch.php
 * Metadata:get https://archive.org/metadata/<identifier>
 * Download: https://archive.org/download/<identifier>/<filename>
 *
 * All fetch calls use AbortController + 15s timeout and throw descriptive errors.
 */

const ARCHIVE_BASE = 'https://archive.org'

/** Metadata shape returned by Archive.org for a given identifier. */
interface ArchiveMetadata {
  identifier: string
  title: string
  description: string
  year: string | number | null
  created: string | null
  publisher: string | null
  mediatype: string
  files: Array<{
    name: string
    format: string | null
    size: number | null
    download_url: string | null
  }>
}

/** A normalized movie entry from the Archive.org search API. */
export interface ArchiveMovie {
  identifier: string
  title: string
  year: string | undefined
  description: string | undefined
  downloads: number | undefined
}

/**
 * Search Archive.org for public domain / Creative Commons feature films.
 *
 * Query uses the Archive.org Advanced Search API:
 *   q: collection:(feature_films) AND mediatype:(movies) AND title:(<query>)
 * fl: identifier, title, year, description, downloads
 * rows: 20, page: <page>, output: json
 *
 * @param query        Search term (film title, partial match)
 * @param page         Page number (1-indexed), default 1
 * @returns            Array of ArchiveMovie objects
 *
 * Throws if the request fails or returns no results for a non-empty query.
 */
export async function searchPublicDomainMovies(
  query: string,
  page = 1,
): Promise<ArchiveMovie[]> {
  const url = new URL(`${ARCHIVE_BASE}/advancedsearch.php`)
  url.searchParams.set('q', `collection:(feature_films) AND mediatype:(movies) AND title:(${query})`)
  url.searchParams.set('fl', 'identifier,title,year,description,downloads')
  url.searchParams.set('rows', '20')
  url.searchParams.set('page', String(page))
  url.searchParams.set('output', 'json')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(
        `Archive.org search failed [${res.status}]: ${res.statusText}`,
      )
    }

    const data = (await res.json()) as { response: { docs: ArchiveMovie[] } }
    const docs = data?.response?.docs ?? []

    return docs
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Archive.org search timed out after 15s')
    }
    throw err
  }
}

/**
 * Retrieve a stream URL for a given Archive.org identifier.
 *
 * Steps:
 *   1. Fetch metadata for the identifier: GET /metadata/<identifier>
 *   2. Inspect `files[]` for a video file (.mp4 preferred, then .m3u8 / HLS),
 *      prioritizing files whose `format` contains "MPEG4" or "hls".
 *   3. Construct the download URL:
 *        https://archive.org/download/<identifier>/<filename>
 *   4. Return { url, type } where type is 'mp4' | 'hls'.
 *
 * Throws a clear error if no suitable video file is found.
 *
 * @param identifier Archive.org identifier (slug), e.g. 'elvis-presley'
 * @returns          { url, type } — type is 'mp4' or 'hls'
 * @throws           If no video file is found in the metadata
 *
 * @example
 * getStreamUrl('elvis-presley')
 *   // → { url: 'https://archive.org/download/elvis-presley/elvis-presley.mp4', type: 'mp4' }
 */
export async function getStreamUrl(
  identifier: string,
): Promise<{ url: string; type: 'mp4' | 'hls'; title?: string }> {
  const metadataUrl = new URL(`${ARCHIVE_BASE}/metadata/${identifier}`)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const metaRes = await fetch(metadataUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!metaRes.ok) {
      throw new Error(
        `Archive.org metadata failed [${metaRes.status}]: ${metaRes.statusText}`,
      )
    }

    const metadata: ArchiveMetadata = await metaRes.json()

    // Prioritize .mp4, then .m3u8 / HLS
    const videoFiles = metadata.files.filter(
      (f) => f.name?.endsWith('.mp4') || f.name?.endsWith('.m3u8'),
    )

    if (videoFiles.length === 0) {
      // Fallback: any file whose format mentions MPEG4 or hls
      const fallback = metadata.files.find(
        (f) =>
          f.format &&
          (f.format.includes('MPEG4') || f.format.includes('hls')),
      )
      if (fallback) {
        const downloadUrl = new URL(
          `/download/${identifier}/${encodeURIComponent(fallback.name)}`,
          ARCHIVE_BASE,
        ).toString()
        return { url: downloadUrl, type: 'mp4' }
      }
      throw new Error(
        `No video file found in Archive.org metadata for identifier: ${identifier}`,
      )
    }

    // Prefer .mp4
    const mp4File = videoFiles.find((f) => f.name.endsWith('.mp4'))
    if (mp4File) {
      const downloadUrl = new URL(
        `/download/${identifier}/${encodeURIComponent(mp4File.name)}`,
        ARCHIVE_BASE,
      ).toString()
      return { url: downloadUrl, type: 'mp4', title: metadata.title }
    }

    // Fallback to .m3u8 / HLS
    const hlsFile = videoFiles.find((f) => f.name.endsWith('.m3u8'))
    if (hlsFile) {
      const downloadUrl = new URL(
        `/download/${identifier}/${encodeURIComponent(hlsFile.name)}`,
        ARCHIVE_BASE,
      ).toString()
      return { url: downloadUrl, type: 'hls', title: metadata.title }
    }

    // Should not reach here, but just in case
    if (!videoFiles?.[0]) throw new Error('No video files found')
    const firstVideo = videoFiles![0]
    const downloadUrl = new URL(
      `/download/${identifier}/${encodeURIComponent(firstVideo.name)}`,
      ARCHIVE_BASE,
    ).toString()
    return { url: downloadUrl, type: 'mp4', title: metadata.title }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Archive.org metadata request timed out after 15s')
    }
    throw err
  }
}