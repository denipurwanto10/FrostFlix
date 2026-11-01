export interface SeparatorProps {
  className?: string
  variant?: 'horizontal' | 'vertical'
  thickness?: number
}

export function Separator({
  className,
  variant = 'horizontal',
  thickness = 1,
}: SeparatorProps) {
  if (variant === 'horizontal') {
    return <hr className={`border-t border-border/50 h-${thickness} my-4 ${className || ''}`} />
  }

  return <hr className={`border-l border-border/50 w-${thickness} my-4 ${className || ''}`} />
}