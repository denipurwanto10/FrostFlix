import * as React from 'react'

/** A soft pool of light that trails the pointer. Desktop only. */
export function AmbientCursor() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.hidden = true
      return
    }

    let x = window.innerWidth / 2
    let y = window.innerHeight / 3
    let tx = x
    let ty = y
    let raf = 0

    const tick = () => {
      x += (tx - x) * 0.09
      y += (ty - y) * 0.09
      el.style.transform = `translate3d(${x - 360}px, ${y - 360}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      tx = event.clientX
      ty = event.clientY
      el.style.opacity = '1'
    }
    const onLeave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[720px] w-[720px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{
        background:
          'radial-gradient(circle, rgb(var(--glow) / 0.10), transparent 62%)',
      }}
    />
  )
}
