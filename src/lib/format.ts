export function formatRuntime(minutes?: number | null): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

export function formatDate(date?: string): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
}

export function formatVoteAverage(vote?: number): string {
  if (vote === undefined || vote === null) return 'NR'
  return vote.toFixed(1)
}