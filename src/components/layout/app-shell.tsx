import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

/**
 * AppShell — the single application layout used by every route.
 *
 * The navbar is fixed and transparent over the page until it scrolls. Pages
 * own their horizontal padding (via the `wrap` utility) so full-bleed
 * sections, like the home hero and carousels, can reach the screen edges.
 * Each page is responsible for clearing the 4rem navbar (`pt-24` or the hero's
 * negative margin).
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-background"
      >
        Skip to content
      </a>

      <div className="scroll-progress" aria-hidden="true" />
      <Navbar />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
