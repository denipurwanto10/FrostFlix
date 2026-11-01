import type { ReactNode } from 'react'
import { SplitText } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  kicker?: string
  /** Right-hand column: description, counts, actions. */
  aside?: ReactNode
  className?: string
}

/** Oversized page title. The words rise out of a mask on arrival. */
export function PageHeader({ title, kicker, aside, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-10 gap-y-5', className)}>
      <div className="min-w-0">
        {kicker && (
          <p className="kicker reveal mb-5 inline-flex items-center gap-2.5">
            <span className="h-px w-8 origin-left animate-[draw_1.2s_var(--ease-out)_both] bg-primary/70" aria-hidden="true" />
            {kicker}
          </p>
        )}
        <h1 className="text-[clamp(3.5rem,12vw,9.5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
          <SplitText text={title} delay={80} wordClassName="text-sheen" />
        </h1>
      </div>
      {aside && (
        <div className="reveal pb-2 sm:pb-4" style={{ ['--i' as string]: 6 }}>
          {aside}
        </div>
      )}
    </header>
  )
}
