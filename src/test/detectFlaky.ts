import { runFlakyDetectionRound, BugReport } from './flakyDetection'

async function main() {
  const allBugs: BugReport[] = []
  const rounds = 5

  console.log('Starting flaky behavior detection...\n')

  for (let round = 1; round <= rounds; round++) {
    console.log(`Running detection round ${round}...`)
    const bugs = runFlakyDetectionRound(round)
    allBugs.push(...bugs)

    // Wait a bit between rounds
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n=== FLAKY BUG DETECTION RESULTS ===\n')

  // Group bugs by file and function
  const bugGroups = new Map<string, BugReport[]>()

  allBugs.forEach(bug => {
    const key = `${bug.file}:${bug.function}`
    if (!bugGroups.has(key)) {
      bugGroups.set(key, [])
    }
    bugGroups.get(key)!.push(bug)
  })

  bugGroups.forEach((bugs, key) => {
    const [file, func] = key.split(':')
    const occurrenceCount = bugs.length
    const roundsOccurred = bugs.map(b => b.round).join(', ')

    console.log(`Bug in ${file} - ${func}:`)
    console.log(`  Description: ${bugs[0].description}`)
    console.log(`  Occurred in rounds: ${roundsOccurred} (${occurrenceCount}/${rounds} rounds)`)
    console.log(`  Reproduction steps:`)
    bugs[0].reproductionSteps.forEach(step => console.log(`    - ${step}`))
    console.log('')
  })

  if (allBugs.length === 0) {
    console.log('No flaky bugs detected!')
  }
}

main().catch(console.error)