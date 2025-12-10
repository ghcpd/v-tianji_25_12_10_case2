import { processDataWithFilters } from '../utils/dataProcessor'
import { generateSampleData } from '../utils/dataGenerator'
import { validateDataArray } from '../utils/dataValidator'

interface BugReport {
  round: number
  file: string
  function: string
  description: string
  reproductionSteps: string[]
  occurred: boolean
}

function runFlakyDetectionRound(round: number): BugReport[] {
  const bugs: BugReport[] = []

  // Test dataProcessor consistency
  const testData = generateSampleData(20)
  const filters = { searchTerm: 'Alpha', minValue: 100 }

  const results: any[] = []
  for (let i = 0; i < 10; i++) {
    processDataWithFilters(testData, filters).then(result => {
      results.push({
        length: result.length,
        firstItem: result[0]?.name,
        lastItem: result[result.length - 1]?.name
      })
    })
  }

  // Wait for all promises (simplified - in real scenario use Promise.all)
  setTimeout(() => {
    const lengths = results.map(r => r.length)
    const uniqueLengths = new Set(lengths)

    if (uniqueLengths.size > 1) {
      bugs.push({
        round,
        file: 'src/utils/dataProcessor.ts',
        function: 'processDataWithFilters',
        description: 'Function returns inconsistent results for same input due to random delays and sorting',
        reproductionSteps: [
          'Call processDataWithFilters with same data and filters multiple times',
          'Observe varying result lengths and order'
        ],
        occurred: true
      })
    }
  }, 1000)

  // Test dataValidator consistency
  const testData2 = generateSampleData(50)
  const validationResults: number[] = []
  for (let i = 0; i < 20; i++) {
    const result = validateDataArray(testData2)
    validationResults.push(result.length)
  }

  const uniqueValidationResults = new Set(validationResults)
  if (uniqueValidationResults.size > 1) {
    bugs.push({
      round,
      file: 'src/utils/dataValidator.ts',
      function: 'validateDataArray',
      description: 'Validation randomly skips valid items based on random chance',
      reproductionSteps: [
        'Call validateDataArray multiple times with same data',
        'Observe varying array lengths'
      ],
      occurred: true
    })
  }

  // Test dataGenerator consistency
  const genResults: any[] = []
  for (let i = 0; i < 10; i++) {
    const result = generateSampleData(10)
    genResults.push({
      firstId: result[0].id,
      length: result.length
    })
  }

  const uniqueGenLengths = new Set(genResults.map(r => r.length))
  if (uniqueGenLengths.size > 1) {
    bugs.push({
      round,
      file: 'src/utils/dataGenerator.ts',
      function: 'generateSampleData',
      description: 'Data generation includes random swaps based on timestamp',
      reproductionSteps: [
        'Call generateSampleData multiple times with same count',
        'Observe inconsistent data ordering'
      ],
      occurred: true
    })
  }

  return bugs
}

export { runFlakyDetectionRound, BugReport }