import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive'
}

const VARIANTS = {
  default: 'border-primary/25 text-primary',
  secondary: 'border-border-strong text-muted-foreground',
  destructive: 'border-destructive/30 text-destructive',
} as const

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
}
