import * as React from 'react'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  /** Accessible name. Also shown inline when `showLabel` is true. */
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly SelectOption[]
  /** Show the label as a small mono prefix inside the trigger. */
  showLabel?: boolean
  size?: 'default' | 'lg'
  align?: 'start' | 'end'
  className?: string
}

/**
 * Select — a custom listbox replacing the native <select>, whose popup can't
 * be themed. Keyboard: Arrow keys / Home / End move, Enter or Space picks,
 * Escape closes, typing jumps to a matching option.
 */
export function Select({
  label,
  value,
  onChange,
  options,
  showLabel = false,
  size = 'default',
  align = 'start',
  className,
}: SelectProps) {
  const id = React.useId()
  const listId = `${id}-list`
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const typeahead = React.useRef({ text: '', timer: 0 })

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(selectedIndex)
  const [dropUp, setDropUp] = React.useState(false)

  const selected = options[selectedIndex]

  const openList = React.useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setDropUp(below < 280 && rect.top > below)
    }
    setActive(selectedIndex)
    setOpen(true)
  }, [selectedIndex])

  const close = React.useCallback(() => setOpen(false), [])

  const choose = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
    rootRef.current?.querySelector('button')?.focus()
  }

  // Outside click closes.
  React.useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, close])

  // Keep the active option scrolled into view.
  React.useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openList()
        else setActive((i) => Math.min(last, i + 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList()
        else setActive((i) => Math.max(0, i - 1))
        return
      case 'Home':
        if (open) {
          event.preventDefault()
          setActive(0)
        }
        return
      case 'End':
        if (open) {
          event.preventDefault()
          setActive(last)
        }
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) choose(active)
        else openList()
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
        return
      case 'Tab':
        close()
        return
    }

    // Typeahead
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const ta = typeahead.current
      window.clearTimeout(ta.timer)
      ta.text += event.key.toLowerCase()
      ta.timer = window.setTimeout(() => (ta.text = ''), 600)
      const match = options.findIndex((o) => o.label.toLowerCase().startsWith(ta.text))
      if (match >= 0) {
        if (!open) openList()
        setActive(match)
      }
    }
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-full border bg-surface/70 text-left text-foreground',
          'transition-colors duration-200 hover:border-foreground/30',
          open ? 'border-primary/60' : 'border-border-strong',
          size === 'lg' ? 'h-12 px-5 text-[15px]' : 'h-10 px-4 text-[13px]'
        )}
      >
        {showLabel && <span className="kicker hidden shrink-0 sm:inline">{label}</span>}
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 text-subtle-foreground transition-transform duration-200',
            open && 'rotate-180 text-primary'
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={cn(
            'no-scrollbar absolute z-50 max-h-72 min-w-full overflow-y-auto overscroll-contain rounded-2xl border border-border-strong bg-surface-2 p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl',
            'animate-[fade_0.15s_ease-out]',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            return (
              <li
                key={option.value}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                data-index={index}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-[13px]',
                  index === active ? 'bg-surface-3 text-foreground' : 'text-muted-foreground',
                  isSelected && 'text-foreground'
                )}
              >
                <span className="flex-1">{option.label}</span>
                {isSelected && <CheckIcon className="h-4 w-4 text-primary" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
