import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { processDataWithFilters } from '../src/utils/dataProcessor'

describe('dataProcessor deterministic behavior', () => {
  it('should return consistent results across repeated runs and use cache deterministically', async () => {
    const data = generateSampleData(80)
    const filters = { searchTerm: 'Alpha', minValue: 20 }

    const runs: any[] = []
    for (let i = 0; i < 5; i++) {
      // call the async function and await
      const result = await processDataWithFilters(data, filters)
      runs.push(result)
    }

    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]).toEqual(runs[0])
    }

    // Re-run with same inputs to ensure caching path returns same result
    const second = await processDataWithFilters(data, filters)
    expect(second).toEqual(runs[0])
  })
})