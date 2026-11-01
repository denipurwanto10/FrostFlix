import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { Sheet, SheetOverlay, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

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

export interface AppHeaderProps {
  className?: string
  title: string
  subtitle?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export interface AppLayoutProps {
  className?: string
  title: string
  children: React.ReactNode
  showSidebar?: boolean
  /** Controlled open state for mobile drawer */
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
}

export function AppLayout({
  className,
  title,
  children,
  showSidebar = true,
  sidebarOpen,
  onSidebarOpenChange,
}: AppLayoutProps) {
  const location = useLocation()

  return (
    <div className={`
      min-h-screen ${className || ''}
    `}>
      {/* AppHeader */}
      <AppHeader
        title={title}
        showSearch={showSidebar !== false}
        onSearch={() => {
          // Search can be triggered from header
        }}
      />

      {/* Main content area */}
      <main className="flex flex-col sm:flex-row min-0">
        {/* AppSidebar - visible on desktop, drawer on mobile */}
        {showSidebar !== false && (
          <AppSidebar
            open={sidebarOpen ?? false}
            onOpenChange={(open) => onSidebarOpenChange?.(open)}
            activeHref={location.pathname}
          />
        )}

        {/* Content wrapper */}
        <div className="flex-1 w-0 flex flex-col sm:flex-row">
          {/* Mobile sidebar trigger / drawer */}
          {showSidebar !== false && !sidebarOpen && (
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                className="sm:hidden mt-2 mb-2"
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
              </Button>
            </SheetTrigger>
          )}

          {/* Mobile drawer */}
          {showSidebar !== false && sidebarOpen && (
            <Sheet
              side="right"
              open={sidebarOpen ?? false}
              onOpenChange={(open) => onSidebarOpenChange?.(open)}
              className="fixed inset-0 sm:inset-0 sm:h-full sm:w-full sm:max-w-full"
            >
              <SheetOverlay className="fixed inset-0 sm:inset-0" />
              <SheetContent
                side="right"
                showCloseButton
                className="fixed right-0 top-0 bottom-0 sm:h-full w-full sm:w-80"
              >
                <SheetHeader>
                  <SheetTitle>FrostFlix</SheetTitle>
                  <SheetDescription>Navigation</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 p-4">
                  <Button
                    variant="link"
                    size="default"
                    onClick={() => {
                      onSidebarOpenChange?.(false)
                      // Navigation handled by link clicks
                    }}
                    aria-current="page"
                  >Home</Button>
                  <Button
                    variant="link"
                    size="default"
                    onClick={() => {
                      onSidebarOpenChange?.(false)
                    }}
                  >Explore</Button>
                  <Button
                    variant="link"
                    size="default"
                    onClick={() => {
                      onSidebarOpenChange?.(false)
                    }}
                  >Watchlist</Button>
                  <Button
                    variant="link"
                    size="default"
                    onClick={() => {
                      onSidebarOpenChange?.(false)
                    }}
                  >Preferences</Button>
                  <Button
                    variant="link"
                    size="default"
                    onClick={() => {
                      onSidebarOpenChange?.(false)
                    }}
                  >
                    Search
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Main content area */}
          <div className="sm:flex-1 overflow-x-auto px-4 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}