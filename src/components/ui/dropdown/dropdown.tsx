import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export interface DropdownItem {
  label: string
  onSelect: () => void
  disabled?: boolean
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface DropdownProps {
  triggerLabel: string
  items: DropdownItem[]
  className?: string
  multiple?: boolean
  selectedLabels?: string[]
  onToggle?: (label: string, selected: boolean) => void
}

export function Dropdown({
  triggerLabel,
  items,
  selectedLabels = [],
  onToggle,
  className,
  multiple = false,
}: DropdownProps) {
  // $ts-ignore: multiple is part of public API
  void (multiple as boolean)

  const [open, setOpen] = React.useState(false)
  const itemsRef = React.useRef(items)
  itemsRef.current = items
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (open) {
      for (let i = 0; i < itemsRef.current.length; i++) {
        const item = itemsRef.current[i]
        if (item && !item.disabled) {
          setFocusedIndex(i)
          break
        }
      }
    }
  }, [open])

  const handleItemKeydown = React.useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const item = itemsRef.current[index]
      if (!item || item.disabled) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          let next = index + 1
          while (next < itemsRef.current.length) {
            const nextItem = itemsRef.current[next]
            if (!nextItem || !nextItem.disabled) break
            next++
          }
          if (next < itemsRef.current.length) setFocusedIndex(next)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          let prev = index - 1
          while (prev >= 0) {
            const prevItem = itemsRef.current[prev]
            if (!prevItem || !prevItem.disabled) break
            prev--
          }
          if (prev >= 0) setFocusedIndex(prev)
          break
        }
        case 'Home': {
          e.preventDefault()
          let first = 0
          while (first < itemsRef.current.length) {
            const firstItem = itemsRef.current[first]
            if (!firstItem || !firstItem.disabled) break
            first++
          }
          if (first < itemsRef.current.length) setFocusedIndex(first)
          break
        }
        case 'End': {
          e.preventDefault()
          let last = itemsRef.current.length - 1
          while (last >= 0) {
            const lastItem = itemsRef.current[last]
            if (!lastItem || !lastItem.disabled) break
            last--
          }
          if (last >= 0) setFocusedIndex(last)
          break
        }
        case 'Escape': {
          setOpen(false)
          setFocusedIndex(null)
          break
        }
        case 'Enter':
        case ' ':
          if (focusedIndex !== null) {
            const focusedItem = itemsRef.current[focusedIndex]
            if (focusedItem) {
              onToggle?.(focusedItem.label, true)
              setFocusedIndex(null)
            }
          }
          break
        default:
          break
        }
      },
      [setFocusedIndex, onToggle, focusedIndex]
  )

  const dropdownClassName = `
    absolute right-0 mt-2 w-48 rounded-md bg-surface
    border border-border/50
    shadow-lg
    z-50
    data-[state=closed]:hidden
  ${className || ''}
  `

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="default"
        className="rounded-md border border-border/50 px-2 py-1.5 text-sm text-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-ring/50
          data-[state=open]:bg-primary/5 data-[state=open]:border-primary"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-label={`Open ${triggerLabel} menu`}
      >
        {triggerLabel}
        <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div className={dropdownClassName}>
          {itemsRef.current.map((item, index) => {
            // $ts-ignore: selectedLabels validated above
            const isSelected = selectedLabels!.includes(item.label)

            return (
              <div
                key={item.label}
                role="menuitem"
                className="
                  w-full flex items-center gap-2 rounded-md px-2 py-1.5
                  cursor-pointer select-none
                  text-left
                  ${isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-ring/50 focus-visible:ring-offset-2
                "
                onClick={() => {
                  if (!item.disabled && onToggle) {
                    onToggle(item.label, !isSelected)
                  }
                  setOpen(false)
                }}
                onKeyDown={(e) => handleItemKeydown(e, index)}
                aria-disabled={item.disabled || undefined}
                aria-selected={isSelected}
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>
                  {item.label}
                  {item.description && <span className="text-xs opacity-60 ml-2 block">{item.description}</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}