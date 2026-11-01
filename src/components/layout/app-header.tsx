import * as React from 'react'
import { useRef } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AppHeaderProps {
  className?: string
  title: string
  subtitle?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export function AppHeader({
  className,
  title,
  subtitle,
  showSearch = true,
  onSearch,
}: AppHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const input = searchRef.current
    if (input?.value && onSearch) {
      onSearch(input.value)
    }
    if (input) input.value = ''
  }

  return (
    <header className={`
      border-b border-border/50 bg-surface/50 backdrop-blur-sm
      transition-colors duration-200 data-[state=open]:bg-surface/80
      ${className || ''}
    `}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Title area */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>

        {/* Search form */}
        {showSearch && (
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center gap-2"
            aria-label="Search"
          >
            <Search
              className="w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search movies &hellip;"
              className="input-sm flex-1 rounded-md bg-surface-2 px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus-ring-ring/50 transition-colors"
              aria-label="Search movies"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              className="rounded-md p-1.5 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-ring/50"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        )}

        {/* Action buttons (profile, notifications) - placeholders */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Profile placeholder - to be connected in future phases */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile"
            className="rounded-full w-8 h-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1l4 4L16 4l1.41 1.41" />
            </svg>
          </Button>
          {/* Notifications placeholder */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full w-8 h-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 4c2.326 0 4 1.674 4 4s-1.674 4-4 4S8 11.326 8 9s1.674-4 4-4Zm0 6c1.657 0 3 1.343 3 3s-1.343 3-3 3S6 13.657 6 12s1.343-3 3-3Z" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}