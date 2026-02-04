import { describe, it, expect, vi } from 'vitest'
import { processDataWithFilters } from '../utils/dataProcessor'
import { generateSampleData } from '../utils/dataGenerator'

// Mock Math.random to control randomness for deterministic testing
const originalRandom = Math.random
let randomValues: number[] = []
let randomIndex = 0

function mockRandom() {
  return randomValues[randomIndex++ % randomValues.length]
}

describe('processDataWithFilters', () => {
  it('should process data consistently', async () => {
    // Generate test data
    const data = generateSampleData(10)
    const filters = { searchTerm: 'Alpha', minValue: 100 }

    // Run multiple times with same random seed to check consistency
    const results = []
    for (let i = 0; i < 5; i++) {
      // Reset random sequence for each run
      randomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
      randomIndex = 0
      Math.random = mockRandom

      const result = await processDataWithFilters(data, filters)
      results.push(result.length)

      Math.random = originalRandom
    }

    // All results should be the same for deterministic behavior
    const firstResult = results[0]
    expect(results.every(r => r === firstResult)).toBe(true)
  })

  it('should detect flaky behavior in processing', async () => {
    // Generate test data
    const data = generateSampleData(100)
    const filters = { searchTerm: 'Beta', minValue: 200 }

    // Run multiple times without mocking random to check for consistency
    const results = []
    for (let i = 0; i < 20; i++) {
      const result = await processDataWithFilters(data, filters)
      results.push({
        length: result.length,
        firstId: result[0]?.id,
        sortingCheck: result.slice(0, 3).map(item => item.timestamp).join(',')
      })
    }

    // After fix, should be consistent
    const lengths = results.map(r => r.length)
    const uniqueLengths = new Set(lengths)
    const sortingChecks = results.map(r => r.sortingCheck)
    const uniqueSortings = new Set(sortingChecks)

    // Should be consistent now
    expect(uniqueLengths.size).toBe(1) // Only one unique length
    expect(uniqueSortings.size).toBe(1) // Only one unique sorting
  })

  it('should handle empty data', async () => {
    const result = await processDataWithFilters([], { searchTerm: '', minValue: 0 })
    expect(result).toEqual([])
  })

  it('should filter by search term', async () => {
    const data = generateSampleData(20)
    const filters = { searchTerm: 'Alpha', minValue: 0 }

    // Use deterministic random
    randomValues = [0.5, 0.5, 0.5, 0.5, 0.5]
    randomIndex = 0
    Math.random = mockRandom

    const result = await processDataWithFilters(data, filters)

    Math.random = originalRandom

    // Should contain items with 'Alpha' in name
    expect(result.every(item => item.name.toLowerCase().includes('alpha'))).toBe(true)
  })

  it('should filter by minimum value', async () => {
    const data = generateSampleData(20)
    const filters = { searchTerm: '', minValue: 500 }

    randomValues = [0.5, 0.5, 0.5, 0.5, 0.5]
    randomIndex = 0
    Math.random = mockRandom

    const result = await processDataWithFilters(data, filters)

    Math.random = originalRandom

    expect(result.every(item => item.value >= 500)).toBe(true)
  })
})