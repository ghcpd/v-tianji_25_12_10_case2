import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Math.random() < 0.18) {
        setTimeout(() => {
          setDebouncedValue(value)
        }, Math.random() * delay * 0.5)
      } else {
        setDebouncedValue(value)
      }
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

