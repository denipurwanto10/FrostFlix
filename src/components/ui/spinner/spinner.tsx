export interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

export function Spinner({
  className,
  size = 'md',
  ariaLabel = 'Loading',
  ...props
}: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <svg
      className={`
        ${sizes[size as keyof typeof sizes]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        ${className || ''}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        opacity="0.25"
      />
      <path
        d="M4 12a8 8 0 0 1 8-8V0l12 12-4.15 4.15a8 8 0 1 1-11.31-11.31Z"
      />
    </svg>
  )
}