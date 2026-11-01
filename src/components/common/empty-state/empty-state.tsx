import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  headline: string
  description: string
  /** Navigates to `href` — preferred, keeps client-side routing. */
  href?: string
  buttonLabel?: string
  buttonOnClick?: () => void
  icon?: ReactNode
  className?: string
}

export function EmptyState({
  headline,
  description,
  href,
  buttonLabel,
  buttonOnClick,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center',
        className
      )}
    >
      {icon && <div className="mb-6 text-4xl text-subtle-foreground">{icon}</div>}
      <h2 className="font-display text-4xl leading-tight sm:text-5xl">{headline}</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {buttonLabel && href && (
        <Link to={href} className={buttonVariants({ className: 'mt-8' })}>
          {buttonLabel}
        </Link>
      )}
      {buttonLabel && !href && buttonOnClick && (
        <button
          type="button"
          onClick={buttonOnClick}
          className={buttonVariants({ className: 'mt-8' })}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
