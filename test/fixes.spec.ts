import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { processDataWithFilters } from '../src/utils/dataProcessor'
import { validateDataArray } from '../src/utils/dataValidator'

describe('Determinism verification after fixes', () => {
  it('processDataWithFilters should be stable across repeated runs', async () => {
    const data = generateSampleData(100, { seed: 42 })
    const outputs: string[] = []

    for (let i = 0; i < 20; i++) {
      const res = await processDataWithFilters(JSON.parse(JSON.stringify(data)), { searchTerm: 'Alpha', minValue: 10 })
      outputs.push(JSON.stringify(res))
    }

    expect(new Set(outputs).size).toBe(1)
  })

  it('generateSampleData with same seed should be identical across calls', () => {
    const runs: string[] = []
    for (let i = 0; i < 20; i++) {
      runs.push(JSON.stringify(generateSampleData(50, { seed: 999 })))
    }
    expect(new Set(runs).size).toBe(1)
  })

  it('validateDataArray should be stable across repeated runs', () => {
    const data = generateSampleData(100, { seed: 123 })
    const outcomes: string[] = []
    for (let i = 0; i < 20; i++) {
      outcomes.push(JSON.stringify(validateDataArray(JSON.parse(JSON.stringify(data)))))
    }
    expect(new Set(outcomes).size).toBe(1)
  })
})