import * as React from 'react'
import { CountUp } from '@/components/motion/count-up'

/** Circular 0–10 rating gauge that draws itself in. */
export function RatingRing({ value }: { value: number }) {
  const [on, setOn] = React.useState(false)
  const ref = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setOn(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const r = 44
  const c = 2 * Math.PI * r
  const offset = c * (1 - (on ? Math.min(value, 10) / 10 : 0))

  return (
    <div className="relative h-36 w-36 sm:h-40 sm:w-40">
      <svg ref={ref} viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6d9a8" />
            <stop offset="100%" stopColor="#e9a96b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1) 0.2s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp
          value={value}
          decimals={1}
          className="font-display text-5xl font-semibold leading-none tabular-nums text-rating"
        />
        <span className="mt-1.5 text-xs text-subtle-foreground">IMDb</span>
      </div>
    </div>
  )
}
