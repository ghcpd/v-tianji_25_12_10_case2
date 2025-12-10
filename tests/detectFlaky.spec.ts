import fs from 'fs'
import path from 'path'
import { describe, it } from 'vitest'
import { generateSampleData } from '../src/utils/dataGenerator'
import { processDataWithFilters } from '../src/utils/dataProcessor'
import { render, act } from '@testing-library/react'
import React, { useState } from 'react'
import { useDebounce } from '../src/hooks/useDebounce'

const rounds = 5
const iterations = 200
const outPath = path.resolve(process.cwd(), 'flaky-report.json')

async function detectProcessDataFlakiness() {
  const bugs: any[] = []
  for (let r = 0; r < rounds; r++) {
    const data = generateSampleData(100, { seed: 42, baseTime: 1600000000000 })
    const filters = { searchTerm: 'Alpha', minValue: 100 }
    const results = new Set<string>()
    for (let i = 0; i < iterations; i++) {
      // await the function
      // eslint-disable-next-line no-await-in-loop
      const out = await processDataWithFilters(data, filters)
      results.add(JSON.stringify(out))
    }
    if (results.size > 1) {
      bugs.push({
        file: 'src/utils/dataProcessor.ts',
        function: 'processDataWithFilters',
        description: 'Non-deterministic output across repeated runs for same input',
        roundsFound: r + 1,
        uniqueOutputs: results.size
      })
    }
  }
  return bugs
}

async function detectDataGeneratorFlakiness() {
  const bugs: any[] = []
  for (let r = 0; r < rounds; r++) {
    const a = generateSampleData(50, { seed: 123, baseTime: 1600000000000 })
    const b = generateSampleData(50, { seed: 123, baseTime: 1600000000000 })
    if (JSON.stringify(a) === JSON.stringify(b)) {
      // unlikely but deterministic
    } else {
      bugs.push({
        file: 'src/utils/dataGenerator.ts',
        function: 'generateSampleData',
        description: 'Non-deterministic: produces different outputs across calls',
        roundsFound: r + 1
      })
    }
  }
  return bugs
}

function detectUseDebounceFlakiness() {
  const bugs: any[] = []
  const content = fs.readFileSync(path.resolve(process.cwd(), 'src/hooks/useDebounce.ts'), 'utf-8')
  if (content.includes('Math.random')) {
    for (let r = 0; r < rounds; r++) {
      bugs.push({
        file: 'src/hooks/useDebounce.ts',
        function: 'useDebounce',
        description: 'Contains Math.random and timing; may cause non-deterministic debounce behavior',
        roundsFound: r + 1
      })
    }
  }
  return bugs
}

describe('Flaky detection', () => {
  it('runs detection and writes report', async () => {
    const findings: any[] = []
    const p1 = await detectProcessDataFlakiness()
    findings.push(...p1)
    const p2 = await detectDataGeneratorFlakiness()
    findings.push(...p2)
    const p3 = detectUseDebounceFlakiness()
    findings.push(...p3)

    fs.writeFileSync(outPath, JSON.stringify({ findings }, null, 2), 'utf-8')
  }, 120000)
})
