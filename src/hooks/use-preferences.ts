/**
 * src/hooks/use-preferences.ts
 * — Region + language preferences in localStorage, exposed as a proper
 * external store so every consumer stays in sync (including other tabs).
 */

import { useSyncExternalStore } from 'react'

const PREFS_KEY = 'frostflix:prefs:v2'

export interface Preferences {
  region: string
  language: string
}

const DEFAULTS: Preferences = { region: 'ID', language: 'en-US' }

function read(): Preferences {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as {
      version?: number
      data?: Partial<Preferences>
    }
    if (parsed.version !== 2 || !parsed.data) return DEFAULTS
    return {
      region: typeof parsed.data.region === 'string' ? parsed.data.region : DEFAULTS.region,
      language:
        typeof parsed.data.language === 'string' ? parsed.data.language : DEFAULTS.language,
    }
  } catch {
    return DEFAULTS
  }
}

// The snapshot object must stay referentially stable between changes.
let snapshot: Preferences = read()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Preferences {
  return snapshot
}

function update(patch: Partial<Preferences>): void {
  snapshot = { ...snapshot, ...patch }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ version: 2, data: snapshot }))
  } catch {
    // Storage unavailable — the preference still applies for this session.
  }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === PREFS_KEY) {
      snapshot = read()
      emit()
    }
  })
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function usePreferencesActions() {
  return {
    setRegion: (region: string) => update({ region }),
    setLanguage: (language: string) => update({ language }),
  }
}
