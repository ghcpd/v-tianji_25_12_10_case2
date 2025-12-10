import { describe, it, expect, vi } from 'vitest'
import { debounceValue } from '../src/hooks/useDebounce'

describe('debounceValue deterministic helper', () => {
  it('should call setter after delay with the provided value', () => {
    vi.useFakeTimers()

    const setter = vi.fn()
    const handle = debounceValue(setter, 'final', 100)

    // not yet called
    expect(setter).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(setter).not.toHaveBeenCalled()

    vi.advanceTimersByTime(60)
    expect(setter).toHaveBeenCalledTimes(1)
    expect(setter).toHaveBeenCalledWith('final')

    // cleanup
    clearTimeout(handle)
    vi.useRealTimers()
  })
})