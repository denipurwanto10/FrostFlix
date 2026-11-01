import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useWatchlist } from '@/hooks/use-watchlist'
import { BrandMark, BookmarkIcon, SearchIcon } from '@/components/ui/icons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from '@/components/ui/sheet'

interface NavItem {
  label: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Preferences', to: '/preferences' },
]

function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display text-[1.65rem] leading-none tracking-tight',
        className
      )}
    >
      Frost<em className="text-primary">flix</em>
    </span>
  )
}

/** True when the keyboard event came from somewhere the user is typing. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { count } = useWatchlist()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Transparent over the hero, solid once the page moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // "/" jumps to search, like every tool people actually enjoy using.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      const input = searchRef.current
      if (!input || input.offsetParent === null) return
      event.preventDefault()
      input.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = (ref: RefObject<HTMLInputElement | null>) => (event: FormEvent) => {
    event.preventDefault()
    const input = ref.current
    const value = input?.value.trim()
    if (!input || !value) return
    navigate(`/search?q=${encodeURIComponent(value)}`)
    input.value = ''
    input.blur()
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-16 transition-[background-color,border-color,backdrop-filter] duration-300',
        'border-b',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-xl'
          : 'border-transparent bg-gradient-to-b from-background/90 to-transparent'
      )}
    >
      <div className="wrap flex h-full items-center gap-6">
        <Link
          to="/"
          aria-label="Frostflix — home"
          className="flex shrink-0 items-center gap-2.5 rounded-md"
        >
          <BrandMark className="h-7 w-7" />
          <Wordmark />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="ml-2 hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative py-1 text-[13px] font-medium tracking-wide transition-colors',
                  'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-primary',
                  'after:transition-transform after:duration-300',
                  isActive
                    ? 'text-foreground after:scale-x-100'
                    : 'text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Desktop search */}
          <form
            onSubmit={submit(searchRef)}
            role="search"
            className="group relative hidden lg:block"
          >
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground transition-colors group-focus-within:text-primary" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search films"
              aria-label="Search films"
              className="h-9 w-44 rounded-full border border-border-strong/70 bg-surface/60 pl-10 pr-9 text-[13px] text-foreground outline-none transition-[width,border-color,background-color] duration-300 placeholder:text-subtle-foreground focus:w-64 focus:border-primary/50 focus:bg-surface-2 [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border-strong px-1.5 py-px font-mono text-[10px] text-subtle-foreground group-focus-within:hidden">
              /
            </kbd>
          </form>

          {/* Tablet / phone search */}
          <Link
            to="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </Link>

          <Link
            to="/watchlist"
            aria-label={count > 0 ? `Watchlist, ${count} saved` : 'Watchlist'}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <BookmarkIcon className="h-[18px] w-[18px]" filled={pathname === '/watchlist'} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-primary px-1 text-center font-mono text-[10px] font-medium leading-4 text-primary-foreground">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
              <path d="M4 9h16M4 15h10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetOverlay />
        <SheetContent side="right" showCloseButton>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Site navigation</SheetDescription>
          </SheetHeader>

          <form
            onSubmit={submit(mobileSearchRef)}
            role="search"
            className="relative mx-6 mt-6"
          >
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
            <input
              ref={mobileSearchRef}
              type="search"
              placeholder="Search films"
              aria-label="Search films"
              enterKeyHint="search"
              className="h-12 w-full rounded-full border border-border-strong bg-surface pl-11 pr-4 text-base text-foreground outline-none placeholder:text-subtle-foreground focus:border-primary/60 [&::-webkit-search-cancel-button]:hidden"
            />
          </form>

          <nav aria-label="Mobile" className="mt-4 flex flex-col px-6">
            {NAV_ITEMS.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'reveal flex items-baseline gap-4 border-b border-border py-5 transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )
                }
                style={{ ['--i' as string]: i + 1 }}
              >
                {({ isActive }) => (
                  <>
                    <span className="kicker w-5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-4xl leading-none">{item.label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
                    {item.to === '/watchlist' && count > 0 && !isActive && (
                      <span className="ml-auto font-mono text-xs text-subtle-foreground">{count}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <p className="kicker mt-auto px-6 py-6">Catalogue data — iCheckMovies</p>
        </SheetContent>
      </Sheet>
    </header>
  )
}
