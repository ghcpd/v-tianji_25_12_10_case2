import { describe, it, expect } from 'vitest'
import { processDataWithFilters } from '../dataProcessor'
import { validateDataArray } from '../dataValidator'

interface DataItem {
  id: string
  name: string
  value: number
  category: string
  timestamp: number
}

describe('flaky detection tests (intentionally sensitive to non-determinism)', () => {
  it('processDataWithFilters should return a consistent ordering across repeated invocations (deterministic)', async () => {
    const items: DataItem[] = [
      { id: 'a', name: 'A', value: 10, category: 'Tech', timestamp: 1002 },
      { id: 'b', name: 'B', value: 20, category: 'Finance', timestamp: 1001 },
      { id: 'c', name: 'C', value: 30, category: 'Retail', timestamp: 1000 }
    ]

    const runs = 20
    const results: string[][] = []

    for (let i = 0; i < runs; i++) {
      const out = await processDataWithFilters(items, { searchTerm: '', minValue: 0 })
      results.push(out.map(x => x.id))
    }

    // Assert that all runs produced the same ordering
    const first = JSON.stringify(results[0])
    const mismatch = results.find(r => JSON.stringify(r) !== first)

    expect(mismatch, `Different ordering observed across runs: ${JSON.stringify(results)}`).toBeUndefined()

    // Also verify that the order is the deterministic expected order: timestamp desc -> value desc -> name asc
    const expected = ['a', 'b', 'c']
    expect(results[0]).toEqual(expected)
  })

  it('validateDataArray should not drop items with the same value (deterministic)', () => {
    const now = Date.now()
    const items: DataItem[] = [
      { id: '1', name: 'Item1', value: 500, category: 'Technology', timestamp: now },
      { id: '2', name: 'Item2', value: 500, category: 'Technology', timestamp: now + 1 },
      { id: '3', name: 'Item3', value: 300, category: 'Finance', timestamp: now + 2 }
    ]

    // Run multiple times to ensure determinism and no random drops
    const runs = 40
    for (let i = 0; i < runs; i++) {
      const validated = validateDataArray(items)
      expect(validated.length, `Run ${i} dropped items: ${JSON.stringify(validated)}`).toBe(items.length)
    }
  })

  it('validateDataItem rejects values outside allowed range and timestamps in the future', () => {
    const now = Date.now()
    const bad1 = { id: 'x', name: 'bad', value: -5, category: 'Technology', timestamp: now }
    const bad2 = { id: 'y', name: 'future', value: 50, category: 'Technology', timestamp: now + 2 * 86400000 }
    const bad3 = { id: 'z', name: 'cat', value: 50, category: 'Unknown', timestamp: now }

    expect(validateDataArray([bad1]).length).toBe(0)
    expect(validateDataArray([bad2]).length).toBe(0)
    expect(validateDataArray([bad3]).length).toBe(0)
  })
})
