import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * Sheet — lightweight, accessible slide-over panel used for the mobile
 * navigation drawer.
 *
 * Behaviour:
 * - Renders nothing while closed, so a dormant drawer can never cover or
 *   intercept clicks on the page.
 * - Locks body scroll, closes on Escape and on backdrop click while open.
 * - Moves focus into the panel and restores it when the sheet closes.
 *
 * The API is intentionally unchanged from the previous placeholder.
 */

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheet(): SheetContextValue | null {
  return React.useContext(SheetContext)
}

export const Sheet = ({
  side = 'right',
  open,
  onOpenChange,
  className,
  children,
}: {
  side?: 'left' | 'right'
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  children: React.ReactNode
}) => {
  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange(next)
    },
    [onOpenChange]
  )

  // Capture the element that opened the sheet during render, before the panel's
  // own effect moves focus into the dialog. Capturing inside the effect below
  // would save the panel instead of the trigger, because child effects run
  // first.
  const restoreFocusRef = React.useRef<HTMLElement | null>(null)
  if (
    open &&
    restoreFocusRef.current === null &&
    typeof document !== 'undefined'
  ) {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
  }

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onOpenChange(false)
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [open, onOpenChange])

  const contextValue = React.useMemo<SheetContextValue>(
    () => ({ open, setOpen }),
    [open, setOpen]
  )

  if (!open) return null

  // Render into <body>: the header uses `backdrop-blur`, which makes it a
  // containing block for `position: fixed` descendants. Without the portal the
  // drawer would be clipped to the 64px header strip.
  return createPortal(
    <SheetContext.Provider value={contextValue}>
      <div
        className={cn('fixed inset-0 z-[70]', className)}
        data-side={side}
      >
        {children}
      </div>
    </SheetContext.Provider>,
    document.body
  )
}

export const SheetOverlay = ({ className }: { className?: string }) => {
  const sheet = useSheet()

  return (
    <div
      className={cn('absolute inset-0 bg-black/70 backdrop-blur-sm', className)}
      onClick={() => sheet?.setOpen(false)}
      aria-hidden="true"
    />
  )
}

export const SheetContent = ({
  side = 'right',
  className,
  children,
  showCloseButton,
}: {
  side?: 'left' | 'right'
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
}) => {
  const sheet = useSheet()
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    panelRef.current?.focus()
  }, [])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className={cn(
        'absolute inset-y-0 z-10 flex w-full max-w-md flex-col overflow-y-auto border-border bg-background shadow-2xl outline-none',
        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        className
      )}
    >
      {showCloseButton && (
        <button
          type="button"
          onClick={() => sheet?.setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {children}
    </div>
  )
}

export const SheetHeader = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'flex h-16 flex-col justify-center gap-0.5 border-b border-border px-6 pr-16',
        className
      )}
    >
      {children}
    </div>
  )
}

export const SheetTitle = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <h2 className={cn('font-display text-2xl leading-none text-foreground', className)}>
      {children}
    </h2>
  )
}

export const SheetDescription = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <p className={cn('sr-only', className)}>{children}</p>
  )
}

export const SheetFooter = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'mt-auto flex items-center justify-end gap-2 border-t border-border/60 px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export const SheetTrigger = ({
  className,
  children,
  asChild,
}: {
  className?: string
  children?: React.ReactNode
  asChild?: boolean
}) => {
  const sheet = useSheet()
  const handleClick = () => sheet?.setOpen(true)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      { onClick: handleClick }
    )
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  )
}
