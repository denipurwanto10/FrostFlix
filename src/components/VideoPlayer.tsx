/**
 * src/components/VideoPlayer.tsx
 * — Standalone video player that supports MP4 and HLS streams.
 *
 * Usage:
 *   <VideoPlayer
 *     src={streamUrl}
 *     type="mp4" | "hls"
 *     poster={posterUrl}
 *     title={movieTitle}
 *     onError={(msg) => console.error('Video error:', msg)}
 *   />
 *
 * Features:
 * - <video> element with `controls playsInline` for MP4.
 * - HLS support via dynamic `hls.js` import (with fallback to native `video.canPlayType('application/vnd.apple.mpegurl')`).
 * - Centralized error handling via `onError` callback.
 * - Auto-cleanup on unmount (HLS is garbage collected on component unmount).
 * - Fully typed with TypeScript.
 */

import { useRef, useEffect, useState } from 'react'

type VideoPlayerType = 'mp4' | 'hls'

export type VideoPlayerProps = {
  /** Source URL for the video (mp4 path or HLS manifest URL) */
  src: string
  /** Video type: 'mp4' for direct MP4, 'hls' for HLS manifest */
  type?: VideoPlayerType
  /** Poster image shown before playback starts */
  poster?: string
  /** Title displayed overlay or in logs */
  title?: string
  /** Called when a non-recoverable video error occurs */
  onError?: (e: string) => void
}

/**
 * Renders a video player that adapts to the `type` prop.
 *
 * - `mp4`: renders a native `<video controls playsInline poster={poster}>`.
 * - `hls`: attempts to load `hls.js` dynamically and attach it to the video element.
 *   If `hls.js` is unavailable or unsupported, falls back to checking
 *   `video.canPlayType('application/vnd.apple.mpegurl')` and setting `video.src`
 *   directly (Safari/iOS native HLS).
 *
 * Lifecycle:
 * - On mount, creates a `<video ref>` and, for HLS, dynamically imports `hls.js`
 *   and attaches the HLS instance.
 * - On unmount, the HLS instance is garbage collected.
 * - Error events from HLS are forwarded to `onError`.
 *
 * Responsive/Accessibility:
 * - `playsInline` ensures mobile-friendly playback.
 * - `poster` provides a fallback image before playback.
 * - `aria-label` derived from `title` prop for screen readers.
 */
export function VideoPlayer({ src, type = 'mp4', poster, title, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hlsDestroyed, setHlsDestroyed] = useState(false)

  useEffect(() => {
    if (type === 'mp4') {
      // No extra setup needed — the <video> element handles MP4 natively.
      return undefined
    }

    // --- HLS path ---
    // Dynamically import hls.js (only on HLS type)
    ;(async () => {
      try {
        const { default: Hls } = await import('hls.js')
        if (!videoRef.current) return

        const video = videoRef.current

        // If the browser already supports HLS natively (Safari/iOS),
        // we can just set the source directly.
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src
          return
        }

        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(src)
          hls.attachMedia(video)

          // Forward fatal errors to the parent onError callback
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              onError?.(`HLS error: ${data.type}`)
            }
          })

          // Cleanup on unmount / type change
          return () => {
            setHlsDestroyed(true)
          }
        } else {
          // HLS not supported via hls.js fallback to native
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src
          } else {
            onError?.('HLS is not supported in this browser')
          }
        }
      } catch (err) {
        onError?.(`Failed to load HLS player: ${err instanceof Error ? err.message : String(err)}`)
      }
    })()

    // Cleanup on unmount or re-render
    return () => {
      setHlsDestroyed(true)
    }
  }, [src, type, onError])

  // If HLS was destroyed (e.g. unmount), render a placeholder message
  if (hlsDestroyed) {
    return (
      <div
        className="w-full min-h-[200px] flex items-center justify-center text-muted-foreground"
        aria-live="polite"
      >
        Video player cleaned up
      </div>
    )
  }

  return (
    <div className="w-full min-h-[200px]">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        aria-label={title || 'Video player'}
        className="w-full h-auto rounded-md"
      >
        {/* Fallback for browsers without JavaScript support */}
        Your browser does not support the video tag.
      </video>
    </div>
  )
}