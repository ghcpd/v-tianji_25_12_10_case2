import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { processDataWithFilters } from '../src/utils/dataProcessor'
import { validateDataArray } from '../src/utils/dataValidator'

function uniqueByStringify(arr: any[]) {
  const set = new Set(arr.map(a => JSON.stringify(a)))
  return set.size
}

describe('Flaky detection', () => {
  it('processDataWithFilters should produce consistent outputs across repeated runs', async () => {
    const data = generateSampleData(100)
    const results: string[] = []

    for (let i = 0; i < 20; i++) {
      // Recreate input to avoid mutation effects
      const input = JSON.parse(JSON.stringify(data))
      const res = await processDataWithFilters(input, { searchTerm: 'Alpha', minValue: 10 })
      results.push(JSON.stringify(res))
    }

    const unique = new Set(results).size
    // For a stable function we expect a single unique result
    expect(unique).toBe(1)
  })

  it('generateSampleData should produce identical outputs for repeated calls (determinism enforcement)', () => {
    const runs: string[] = []
    for (let i = 0; i < 20; i++) {
      runs.push(JSON.stringify(generateSampleData(50)))
    }
    const unique = new Set(runs).size
    expect(unique).toBe(1)
  })

  it('validateDataArray should produce stable filtering results across runs', () => {
    const data = generateSampleData(100)
    const outcomes: string[] = []
    for (let i = 0; i < 20; i++) {
      outcomes.push(JSON.stringify(validateDataArray(JSON.parse(JSON.stringify(data)))))
    }
    const unique = new Set(outcomes).size
    expect(unique).toBe(1)
  })
})