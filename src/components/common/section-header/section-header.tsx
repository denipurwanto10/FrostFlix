import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { Reveal, SplitText } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export interface SectionHeaderProps {
  title: string
  subtitle?: ReactNode
  /** Small mono label above the title, e.g. "01 / 05". */
  kicker?: string
  /** Optional "view all" link. */
  href?: string
  hrefLabel?: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  children?: ReactNode
}

export function SectionHeader({
  title,
  subtitle,
  kicker,
  href,
  hrefLabel = 'View all',
  as: Heading = 'h2',
  className,
  children,
}: SectionHeaderProps) {
  return (
    <Reveal as="header" kind="fade" className={cn('flex items-end justify-between gap-6', className)}>
      <div className="min-w-0">
        {kicker && <p className="kicker mb-3">{kicker}</p>}
        <Heading className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl" aria-label={title}>
          <SplitText text={title} />
        </Heading>
        {subtitle && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
      {href && (
        <Link
          to={href}
          className="group hidden shrink-0 items-center gap-2 pb-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          {hrefLabel}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  )
}
