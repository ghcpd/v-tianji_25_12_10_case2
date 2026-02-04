import { generateSampleData } from '../src/utils/dataGenerator.ts'
import { processDataWithFilters } from '../src/utils/dataProcessor.ts'
import { validateDataArray } from '../src/utils/dataValidator.ts'

async function runRound(round: number) {
  console.log(`\n--- Round ${round} ---`)

  // Test processDataWithFilters
  const data = generateSampleData(100)
  const outputs: string[] = []
  for (let i = 0; i < 20; i++) {
    const input = JSON.parse(JSON.stringify(data))
    const res = await processDataWithFilters(input, { searchTerm: 'Alpha', minValue: 10 })
    outputs.push(JSON.stringify(res))
  }
  const uniqueProcess = new Set(outputs).size
  console.log(`processDataWithFilters unique outputs: ${uniqueProcess}`)

  // Test generateSampleData
  const gens: string[] = []
  for (let i = 0; i < 20; i++) {
    gens.push(JSON.stringify(generateSampleData(50)))
  }
  const uniqueGen = new Set(gens).size
  console.log(`generateSampleData unique outputs: ${uniqueGen}`)

  // Test validateDataArray
  const vals: string[] = []
  const data2 = generateSampleData(100)
  for (let i = 0; i < 20; i++) {
    vals.push(JSON.stringify(validateDataArray(JSON.parse(JSON.stringify(data2)))))
  }
  const uniqueVal = new Set(vals).size
  console.log(`validateDataArray unique outputs: ${uniqueVal}`)

  return {
    round,
    processUnique: uniqueProcess,
    genUnique: uniqueGen,
    valUnique: uniqueVal
  }
}

async function main() {
  const rounds = []
  for (let r = 1; r <= 5; r++) {
    const res = await runRound(r)
    rounds.push(res)
  }

  console.log('\nSummary:')
  console.table(rounds)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})