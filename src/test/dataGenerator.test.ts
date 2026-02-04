import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../utils/dataGenerator'

describe('generateSampleData', () => {
  it('should generate correct number of items', () => {
    const result = generateSampleData(10)
    expect(result).toHaveLength(10)
  })

  it('should generate items with required properties', () => {
    const result = generateSampleData(5)

    result.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('category')
      expect(item).toHaveProperty('timestamp')
    })
  })

  it('should generate consistent data structure', () => {
    const result1 = generateSampleData(20)
    const result2 = generateSampleData(20)

    // Should have same structure, but data may differ due to randomness
    expect(result1).toHaveLength(20)
    expect(result2).toHaveLength(20)

    result1.forEach(item => {
      expect(typeof item.id).toBe('string')
      expect(typeof item.name).toBe('string')
      expect(typeof item.value).toBe('number')
      expect(typeof item.category).toBe('string')
      expect(typeof item.timestamp).toBe('number')
    })
  })

  it('should generate data with valid categories', () => {
    const validCategories = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail']
    const result = generateSampleData(50)

    result.forEach(item => {
      expect(validCategories).toContain(item.category)
    })
  })
})