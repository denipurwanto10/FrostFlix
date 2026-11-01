import { useEffect } from 'react'

/**
 * Samples the poster and tints the page's ambient light (--glow) with its
 * dominant colour. Quietly does nothing if the image host blocks CORS —
 * the default frost glow stays.
 */
export function usePosterGlow(url: string | null | undefined) {
  useEffect(() => {
    const root = document.documentElement
    if (!url) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      if (cancelled) return
      try {
        const size = 24
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        let r = 0
        let g = 0
        let b = 0
        let weight = 0
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i] ?? 0
          const pg = data[i + 1] ?? 0
          const pb = data[i + 2] ?? 0
          const max = Math.max(pr, pg, pb)
          const min = Math.min(pr, pg, pb)
          const sat = max === 0 ? 0 : (max - min) / max
          const light = max / 255
          // Favour vivid, mid-bright pixels; ignore near-black and near-white.
          const w = sat * sat * (light > 0.18 && light < 0.97 ? 1 : 0.05) + 0.001
          r += pr * w
          g += pg * w
          b += pb * w
          weight += w
        }
        if (weight <= 0) return
        let cr = r / weight
        let cg = g / weight
        let cb = b / weight
        // Lift so the glow always reads against the dark ground.
        const peak = Math.max(cr, cg, cb) || 1
        const lift = Math.min(1.9, 190 / peak)
        cr = Math.min(255, cr * lift)
        cg = Math.min(255, cg * lift)
        cb = Math.min(255, cb * lift)

        root.style.setProperty('--glow', `${Math.round(cr)} ${Math.round(cg)} ${Math.round(cb)}`)
        root.style.setProperty('--glow-2', `${Math.round(cb)} ${Math.round(cr)} ${Math.round(cg)}`)
      } catch {
        /* tainted canvas — keep the default */
      }
    }
    img.src = url
    return () => {
      cancelled = true
      root.style.removeProperty('--glow')
      root.style.removeProperty('--glow-2')
    }
  }, [url])
}
