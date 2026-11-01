import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max rotation in degrees. */
  max?: number
}

/**
 * Pointer-driven 3D tilt with a moving glare. Mouse and pen only — touch
 * and reduced-motion users get a still surface.
 */
export function Tilt({ max = 9, className, children, ...rest }: TiltProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef(0)

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const px = (clientX - rect.left) / rect.width
      const py = (clientY - rect.top) / rect.height
      el.dataset.active = ''
      el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
    })
  }

  const onLeave = () => {
    cancelAnimationFrame(frame.current)
    const el = ref.current
    if (!el) return
    delete el.dataset.active
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('tilt relative', className)}
      {...rest}
    >
      {children}
      <span aria-hidden="true" className="tilt-glare" />
    </div>
  )
}
