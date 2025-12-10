import { describe, it, expect } from 'vitest'
import { validateDataItem, validateDataArray } from '../utils/dataValidator'
import { generateSampleData } from '../utils/dataGenerator'

describe('validateDataItem', () => {
  it('should validate valid items', () => {
    const validItem = {
      id: 'test-123',
      name: 'Test Item',
      value: 100,
      category: 'Technology',
      timestamp: Date.now()
    }

    const result = validateDataItem(validItem)
    expect(result).toBe(true)
  })

  it('should reject invalid items', () => {
    const invalidItem = {
      id: '',
      name: 'Test Item',
      value: 100,
      category: 'Invalid',
      timestamp: Date.now()
    }

    const result = validateDataItem(invalidItem)
    expect(result).toBe(false)
  })

  it('should reject negative values', () => {
    const invalidItem = {
      id: 'test-123',
      name: 'Test Item',
      value: -100,
      category: 'Technology',
      timestamp: Date.now()
    }

    const result = validateDataItem(invalidItem)
    expect(result).toBe(false)
  })
})

describe('validateDataArray', () => {
  it('should validate array consistently', () => {
    const data = generateSampleData(100) // Larger dataset

    // Run multiple times to check for consistency
    const results = []
    for (let i = 0; i < 50; i++) { // More iterations
      const result = validateDataArray(data)
      results.push(result.length)
    }

    // All results should be the same
    const firstResult = results[0]
    expect(results.every(r => r === firstResult)).toBe(true)
  })

  it('should remove duplicates', () => {
    const data = generateSampleData(10)
    const duplicated = [...data, data[0]] // Add duplicate

    const result = validateDataArray(duplicated)
    expect(result.length).toBeLessThan(duplicated.length)
  })
})