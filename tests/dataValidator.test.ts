import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { validateDataArray, validateDataItem } from '../src/utils/dataValidator'

describe('dataValidator deterministic checks', () => {
  it('should produce identical validated arrays across repeated runs', () => {
    const data = generateSampleData(100)
    const runs = [] as ReturnType<typeof validateDataArray>[]

    for (let i = 0; i < 5; i++) {
      runs.push(validateDataArray(data))
    }

    // All runs should be identical
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]).toEqual(runs[0])
    }

    // And all validated items should pass validateDataItem
    for (const item of runs[0]) {
      expect(validateDataItem(item)).toBe(true)
    }
  })
})