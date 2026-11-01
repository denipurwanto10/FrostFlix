import * as React from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium ' +
  'transition-[background-color,color,border-color,transform] duration-200 ease-out ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

const VARIANTS: Record<ButtonVariant, string> = {
  default: 'rounded-full bg-foreground text-background hover:bg-white',
  outline:
    'rounded-full border border-border-strong text-foreground hover:border-foreground/40 hover:bg-surface-2',
  ghost:
    'rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground',
  link: 'h-auto rounded-none p-0 text-foreground underline-offset-4 hover:underline',
  destructive:
    'rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10',
}

const SIZES: Record<ButtonSize, string> = {
  default: 'h-10 px-5 text-sm',
  sm: 'h-8 px-3.5 text-xs',
  lg: 'h-12 px-7 text-[15px]',
  icon: 'h-10 w-10',
}

/**
 * Class builder so links (`<Link>`) can look like buttons without wrapping a
 * button in an anchor.
 */
export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  className?: string | undefined
} = {}): string {
  return cn(
    BASE,
    VARIANTS[variant],
    variant === 'link' ? undefined : SIZES[size],
    className
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}
