import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/ui/icons'

const BROWSE = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Search', to: '/search' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Preferences', to: '/preferences' },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.6fr_1fr_1.2fr] md:py-16">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-[1.65rem] leading-none">
              Frost<em className="text-primary">flix</em>
            </span>
          </div>
          <p className="mt-6 max-w-sm font-display text-3xl leading-[1.1] text-foreground/90">
            Films worth <em>the check.</em>
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="kicker mb-5">Browse</p>
          <ul className="space-y-3 text-sm">
            {BROWSE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="kicker mb-5">About the data</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Catalogue and counts come from iCheckMovies; ratings and votes are
            republished IMDb figures. Your watchlist never leaves this browser.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono">© {new Date().getFullYear()} Frostflix</span>
          <span>Independent project — not affiliated with iCheckMovies or IMDb.</span>
        </div>
      </div>
    </footer>
  )
}
