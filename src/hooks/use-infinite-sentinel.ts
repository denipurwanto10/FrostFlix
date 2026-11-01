import * as React from 'react'

/**
 * Returns a ref to attach to a sentinel element near the end of a list.
 * `onReach` fires once each time the sentinel scrolls into (or near) view
 * while `enabled` is true.
 */
export function useInfiniteSentinel(
  onReach: () => void,
  enabled: boolean,
  rootMargin = '800px 0px'
) {
  const ref = React.useRef<HTMLDivElement>(null)
  const callback = React.useRef(onReach)

  React.useEffect(() => {
    callback.current = onReach
  }, [onReach])

  React.useEffect(() => {
    const node = ref.current
    if (!enabled || !node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callback.current()
      },
      { rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, rootMargin])

  return ref
}
