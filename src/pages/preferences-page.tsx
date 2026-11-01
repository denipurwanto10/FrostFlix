import { SplitText } from '@/components/motion/reveal'
import type { ReactNode } from 'react'
import { usePreferences, usePreferencesActions } from '@/hooks/use-preferences'
import { useWatchlist, useWatchlistActions } from '@/hooks/use-watchlist'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const REGIONS = [
  { value: 'ID', label: 'Indonesia' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
]

const LANGUAGES = [
  { value: 'en-US', label: 'English' },
  { value: 'id-ID', label: 'Bahasa Indonesia' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'es-ES', label: 'Español' },
]

function Row({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-[1fr_minmax(0,320px)] sm:items-center sm:gap-12">
      <div>
        <h2 className="font-display text-3xl leading-none">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  )
}

export function PreferencesPage() {
  const { region, language } = usePreferences()
  const { setRegion, setLanguage } = usePreferencesActions()
  const { count } = useWatchlist()
  const { clearAll } = useWatchlistActions()

  return (
    <div className="page-enter wrap pb-6 pt-28 sm:pt-36">
      <header className="mb-14 sm:mb-20">
        <p className="kicker mb-5">Saved on this device</p>
        <h1 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] tracking-tight">
          <SplitText text="Preferences" delay={80} />
        </h1>
      </header>

      <div className="max-w-4xl">
        <Row
          title="Region"
          hint="Where you’re watching from. The catalogue itself is global, so this doesn’t change which films you see."
        >
          <Select label="Region" size="lg" value={region} onChange={setRegion} options={REGIONS} />
        </Row>

        <Row
          title="Language"
          hint="Your preferred language. Film titles and metadata stay as iCheckMovies publishes them."
        >
          <Select label="Language" size="lg" value={language} onChange={setLanguage} options={LANGUAGES} />
        </Row>

        <Row
          title="Your data"
          hint="Your watchlist and these settings live only in this browser. Nothing is sent to a server."
        >
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="font-mono text-xs text-subtle-foreground">
              <span className="text-foreground">{count}</span> saved {count === 1 ? 'film' : 'films'}
            </span>
            <Button variant="destructive" size="sm" disabled={count === 0} onClick={() => clearAll()}>
              Clear watchlist
            </Button>
          </div>
        </Row>
        <div className="border-t border-border" />
      </div>
    </div>
  )
}
