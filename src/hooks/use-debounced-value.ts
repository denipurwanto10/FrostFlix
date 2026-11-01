import * as React from 'react'

/* Phase 1 placeholder — useDebouncedValue. Do not implement Phase 2 functionality. */
export function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  const [isPending, setIsPending] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
      setIsPending(false)
    }, delay)

    // While waiting, isPending is true
    setIsPending(true)

    return () => clearTimeout(timer)
  }, [value, delay])

  return { value: debouncedValue, isPending }
}