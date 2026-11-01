import * as React from 'react'
import { cn } from '@/lib/utils'

type RevealKind = 'up' | 'clip' | 'fade'

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  kind?: RevealKind
  /** Delay in ms. */
  delay?: number
  /** Re-hide when it leaves the viewport (default: reveal once). */
  as?: 'div' | 'section' | 'header' | 'ul' | 'li' | 'p'
}

/** Shared observer so hundreds of reveals cost one IntersectionObserver. */
let observer: IntersectionObserver | null = null
const handlers = new WeakMap<Element, () => void>()

function observe(el: Element, onIn: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    onIn()
    return () => undefined
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        handlers.get(entry.target)?.()
        handlers.delete(entry.target)
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  )
  handlers.set(el, onIn)
  observer.observe(el)
  return () => {
    handlers.delete(el)
    observer?.unobserve(el)
  }
}

/** Reveals its children the first time they scroll into view. */
export function Reveal({
  kind = 'up',
  delay = 0,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return observe(el, () => setShown(true))
  }, [])

  const Component = Tag as React.ElementType
  return (
    <Component
      ref={ref}
      data-reveal={kind}
      data-in={shown ? '' : undefined}
      className={className}
      style={{ ['--d' as string]: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Component>
  )
}

export interface SplitTextProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  /** Initial delay in ms. */
  delay?: number
  /** Classes applied to each word (e.g. a gradient fill, which must sit on the animated element). */
  wordClassName?: string
}

/** Headline whose words rise out of a mask, one after another. */
export function SplitText({ text, as: Tag = 'span', className, delay = 0, wordClassName }: SplitTextProps) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="word-mask" aria-hidden="true">
            <span
              className={cn('word', wordClassName)}
              style={{ ['--w' as string]: i, ['--d' as string]: `${delay}ms` }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  )
}

