import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function Input({
  className,
  placeholder,
  disabled,
  type = 'text',
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`
        w-full rounded-md bg-surface-2 px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus-ring-ring/50
        ${disabled && 'opacity-50 cursor-not-allowed'}
        ${className || ''}
      `}
      disabled={disabled}
      {...props}
    />
  )
}