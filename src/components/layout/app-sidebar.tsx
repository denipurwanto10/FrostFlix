import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

export interface AppSidebarNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export interface AppSidebarProps {
  className?: string
  /**
   * Controlled open state for mobile/drawer mode.
   * When undefined, the sidebar is always open (desktop).
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Currently active link pathname.
   * Used to apply active state to the correct navigation item.
   */
  activeHref?: string
}

export function AppSidebar({
  className,
  open,
  onOpenChange,
  activeHref,
}: AppSidebarProps) {
  const navItems: AppSidebarNavItem[] = [
    { label: 'Home', href: '/', icon: Menu, description: 'Featured movies' },
    { label: 'Explore', href: '/explore', icon: Menu, description: 'Browse by genre & more' },
    { label: 'Watchlist', href: '/watchlist', icon: Menu, description: 'Your saved movies' },
    { label: 'Preferences', href: '/preferences', icon: Menu, description: 'Settings and filters' },
  ]

  return (
    <aside
      className={`
        w-64 h-screen flex flex-col border-r border-border/50 bg-surface
        transition-transform duration-300 ${open !== undefined ? `transform-${open ? 'translateX(0)' : 'translateX(-100%)'}` : ''}
        ${className || ''}
        data-[state=open]:translateX(0) data-[state=closed]:translateX(-100%)
        aria-label="Main sidebar"
      `}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              className="shrink-0 text-primary-foreground"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="7" fill="#070a12" />
              <g stroke="#38bdf8" stroke-width="1.7" stroke-linecap="round" fill="none">
                <path d="M16 6.5v19" />
                <path d="M7.8 11.25l16.4 9.5" />
                <path d="M24.2 11.25l-16.4 9.5" />
                <path d="M16 6.5l-2.6 2.6M16 6.5l2.6 2.6M16 25.5l-2.6-2.6M16 25.5l2.6-2.6" />
                <path d="M7.8 11.25l3.6.4M7.8 11.25l.4 3.6M24.2 20.75l-3.6-.4M24.2 20.75l-.4-3.6" />
                <path d="M24.2 11.25l-3.6.4M24.2 11.25l-.4 3.6M7.8 20.75l3.6-.4M7.8 20.75l.4-3.6" />
              </g>
            </svg>
          </div>
          <span className="hidden sm:inline text-primary font-semibold">FrostFlix</span>
        </div>
      </div>

      <nav className="flex-overflow hidden sm:block py-4" aria-label="Navigation">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = item.href === activeHref
            return (
              <li key={item.href}>
                <Link
                  className={`
                    flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground
                    transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:text-primary'} data-[state=active]:bg-primary/10 data-[state=active]:text-primary
                  `}
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="ml-auto text-xs opacity-60">{item.description}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile overlay / trigger area */}
      {open !== undefined && (
        <button
          onClick={() => onOpenChange!(false)}
          className="sm:hidden mt-2 mb-2 rounded-md p-2 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Close navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 12l2-2m0 0l2-2m-2 2l2-2m6 7l2 2m-2-2l2 2m7-3a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
        </button>
      )}
    </aside>
  )
}