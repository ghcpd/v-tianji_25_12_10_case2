import { useEffect, useState } from 'react'

// Exported deterministic helper to compute a debounced value given an update function
export function debounceValue<T>(setFn: (v: T) => void, value: T, delay: number) {
  // Return a simple timeout handle so tests can control it
  const handle = setTimeout(() => {
    setFn(value)
  }, delay)
  return handle
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = debounceValue(setDebouncedValue, value, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

