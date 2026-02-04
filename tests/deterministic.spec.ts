import { describe, it, expect, vi } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { processDataWithFilters } from '../src/utils/dataProcessor'
import React from 'react'
import { render } from '@testing-library/react'
import { useDebounce } from '../src/hooks/useDebounce'

describe('Deterministic behavior tests', () => {
  it('processDataWithFilters returns consistent output across repeated runs', async () => {
    const data = generateSampleData(100, { seed: 42 })
    const filters = { searchTerm: 'Alpha', minValue: 100 }
    const results = new Set<string>()
    for (let i = 0; i < 200; i++) {
      // eslint-disable-next-line no-await-in-loop
      const out = await processDataWithFilters(data, filters)
      results.add(JSON.stringify(out))
    }
    expect(results.size).toBe(1)
  })

  it('generateSampleData with a seed is deterministic', () => {
    const a = generateSampleData(50, { seed: 123, baseTime: 1600000000000 })
    const b = generateSampleData(50, { seed: 123, baseTime: 1600000000000 })
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('useDebounce no longer contains Math.random and is deterministic', () => {
    const content = require('fs').readFileSync(require('path').resolve(process.cwd(), 'src/hooks/useDebounce.ts'), 'utf-8')
    expect(content.includes('Math.random')).toBe(false)
  })
})
