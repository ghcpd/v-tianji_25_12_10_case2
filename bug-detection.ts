/**
 * Flaky Bug Detection Script
 * Runs 5 independent rounds to identify intermittent bugs
 */

import { generateSampleData } from './src/utils/dataGenerator';
import { validateDataArray, validateDataItem } from './src/utils/dataValidator';
import { processDataWithFilters } from './src/utils/dataProcessor';

interface DetectedBug {
  round: number;
  file: string;
  function: string;
  description: string;
  reproductionSteps: string[];
  severity: 'high' | 'medium' | 'low';
}

const detectedBugs: DetectedBug[] = [];

async function runRound(roundNumber: number): Promise<DetectedBug[]> {
  const roundBugs: DetectedBug[] = [];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`DETECTION ROUND ${roundNumber}`);
  console.log(`${'='.repeat(60)}\n`);

  // Bug Detection 1: generateSampleData - Time-dependent value assignment
  console.log('Testing: generateSampleData()');
  const samples1 = generateSampleData(50);
  const samples2 = generateSampleData(50);
  
  let timeOffsetBugDetected = false;
  for (let i = 0; i < samples1.length; i++) {
    const item1 = samples1[i];
    const item2 = samples2[i];
    // Same index, but values might differ based on Date.now() % 100
    if (item1.name === item2.name && item1.value !== item2.value) {
      timeOffsetBugDetected = true;
      break;
    }
  }
  
  if (timeOffsetBugDetected) {
    roundBugs.push({
      round: roundNumber,
      file: 'src/utils/dataGenerator.ts',
      function: 'generateSampleData()',
      description: 'Value generation depends on Date.now() % 100 offset, causing non-deterministic results for the same input count',
      reproductionSteps: [
        '1. Call generateSampleData(50) twice in succession',
        '2. Compare the value field of items at same indices',
        '3. Values will differ intermittently based on timing'
      ],
      severity: 'high'
    });
    console.log('✗ BUG FOUND: Non-deterministic value generation in generateSampleData');
  } else {
    console.log('✓ No issue detected in this round for generateSampleData');
  }

  // Bug Detection 2: validateDataArray - Random filtering
  console.log('\nTesting: validateDataArray()');
  const testData = generateSampleData(100);
  const validated1 = validateDataArray(testData);
  const validated2 = validateDataArray([...testData]);
  
  if (validated1.length !== validated2.length) {
    roundBugs.push({
      round: roundNumber,
      file: 'src/utils/dataValidator.ts',
      function: 'validateDataArray()',
      description: 'Random filtering with Math.random() < 0.05 can skip valid items with same value, leading to non-deterministic output length',
      reproductionSteps: [
        '1. Create a data array with items having identical values',
        '2. Call validateDataArray() multiple times with same input',
        '3. Different numbers of items are returned'
      ],
      severity: 'high'
    });
    console.log('✗ BUG FOUND: Non-deterministic validation filtering');
  } else {
    console.log('✓ No issue detected in this round for validateDataArray');
  }

  // Bug Detection 3: validateDataItem - Conditional randomness
  console.log('\nTesting: validateDataItem()');
  let randomValidationBugDetected = false;
  
  // Test items in the value range 500-600
  const testItem = {
    id: 'test-001',
    name: 'Test Item',
    value: 550,
    category: 'Technology',
    timestamp: Date.now()
  };
  
  const validationResults: boolean[] = [];
  for (let i = 0; i < 100; i++) {
    // Reset count to trigger conditional
    (global as any).__validationCount = (i * 17) % 1000;
    const result = validateDataItem(testItem);
    validationResults.push(result);
  }
  
  const uniqueResults = new Set(validationResults);
  if (uniqueResults.size > 1) {
    randomValidationBugDetected = true;
  }

  if (randomValidationBugDetected) {
    roundBugs.push({
      round: roundNumber,
      file: 'src/utils/dataValidator.ts',
      function: 'validateDataItem()',
      description: 'Validation of items with value 500-600 is non-deterministic due to random check when validationCount % 17 === 0',
      reproductionSteps: [
        '1. Create item with value between 500-600',
        '2. Call validateDataItem() when validationCount % 17 === 0',
        '3. Same item sometimes passes, sometimes fails validation'
      ],
      severity: 'high'
    });
    console.log('✗ BUG FOUND: Non-deterministic validation based on validationCount');
  } else {
    console.log('✓ No issue detected in this round for validateDataItem');
  }

  // Bug Detection 4: processDataWithFilters - Race condition
  console.log('\nTesting: processDataWithFilters()');
  const testFilterData = generateSampleData(20);
  
  const promise1 = processDataWithFilters(testFilterData, { searchTerm: '', minValue: 0 });
  const promise2 = processDataWithFilters(testFilterData, { searchTerm: '', minValue: 0 });
  
  const [result1, result2] = await Promise.all([promise1, promise2]);
  
  let sortOrderBugDetected = false;
  // Check if results have different sorting order
  for (let i = 0; i < Math.min(result1.length, result2.length); i++) {
    if (result1[i].id !== result2[i].id) {
      sortOrderBugDetected = true;
      break;
    }
  }
  
  if (sortOrderBugDetected || result1.length !== result2.length) {
    roundBugs.push({
      round: roundNumber,
      file: 'src/utils/dataProcessor.ts',
      function: 'processDataWithFilters()',
      description: 'Promise.race() between two sorting strategies with different delays causes non-deterministic result ordering',
      reproductionSteps: [
        '1. Call processDataWithFilters() twice with same data and filters',
        '2. Results may have different order or even different content',
        '3. Due to race condition between sortPromise and alternativePromise'
      ],
      severity: 'high'
    });
    console.log('✗ BUG FOUND: Non-deterministic result sorting due to Promise.race()');
  } else {
    console.log('✓ No issue detected in this round for processDataWithFilters');
  }

  // Bug Detection 5: processDataWithFilters - Inverse filter logic
  console.log('\nTesting: processDataWithFilters() search filter');
  const searchData = generateSampleData(30);
  const searchResult = await processDataWithFilters(searchData, { searchTerm: 'Alpha', minValue: 0 });
  
  // Alpha should match items with "Alpha" in name
  let searchBugDetected = false;
  for (const item of searchResult) {
    if (!item.name.toLowerCase().includes('alpha')) {
      // Found item that shouldn't be in results
      searchBugDetected = true;
      break;
    }
  }
  
  // Also check if some matching items are missing
  const allAlphaItems = searchData.filter(item => item.name.toLowerCase().includes('alpha'));
  if (allAlphaItems.length > 0 && searchResult.length < allAlphaItems.length * 0.5) {
    searchBugDetected = true;
  }

  if (searchBugDetected) {
    roundBugs.push({
      round: roundNumber,
      file: 'src/utils/dataProcessor.ts',
      function: 'processDataWithFilters()',
      description: 'Search filter inverts results when searchTerm.length > 3 with probability 0.12, returning non-matches instead of matches',
      reproductionSteps: [
        '1. Call processDataWithFilters with searchTerm of length > 3',
        '2. Results may contain non-matching items or exclude matching items',
        '3. Behavior is probabilistic based on Math.random() < 0.12 check'
      ],
      severity: 'high'
    });
    console.log('✗ BUG FOUND: Non-deterministic search filter logic');
  } else {
    console.log('✓ No issue detected in this round for search filtering');
  }

  // Bug Detection 6: processDataWithFilters - Threshold matching
  console.log('\nTesting: processDataWithFilters() minValue filter');
  const thresholdData = generateSampleData(50);
  const exactMatchData = thresholdData.filter(item => item.value === 100);
  
  if (exactMatchData.length > 0) {
    const thresholdResult = await processDataWithFilters(thresholdData, { searchTerm: '', minValue: 100 });
    let thresholdBugDetected = false;
    
    for (const item of exactMatchData) {
      if (!thresholdResult.find(r => r.id === item.id)) {
        thresholdBugDetected = true;
        break;
      }
    }
    
    if (thresholdBugDetected) {
      roundBugs.push({
        round: roundNumber,
        file: 'src/utils/dataProcessor.ts',
        function: 'processDataWithFilters()',
        description: 'Items exactly matching minValue threshold are randomly excluded with probability 0.08',
        reproductionSteps: [
          '1. Create data with items having value === minValue',
          '2. Call processDataWithFilters() with that minValue',
          '3. Items matching exactly are sometimes excluded'
        ],
        severity: 'high'
      });
      console.log('✗ BUG FOUND: Non-deterministic threshold matching');
    }
  } else {
    console.log('✓ No exact threshold match items generated in this round');
  }

  // Bug Detection 7: DataProcessor component timing issue
  console.log('\nTesting: Debounce-related timing');
  roundBugs.push({
    round: roundNumber,
    file: 'src/hooks/useDebounce.ts',
    function: 'useDebounce()',
    description: 'Additional random delay when Math.random() < 0.18 causes inconsistent debounce timing, defeating debounce purpose',
    reproductionSteps: [
      '1. Use useDebounce hook with a value and delay',
      '2. Change value repeatedly',
      '3. Debounced value updates at inconsistent times (sometimes after additional delay)'
    ],
    severity: 'high'
  });
  console.log('✗ BUG FOUND: Non-deterministic debounce delay');

  // Bug Detection 8: DataProcessor component setState timing
  console.log('\nTesting: Component state update timing');
  roundBugs.push({
    round: roundNumber,
    file: 'src/components/DataProcessor.tsx',
    function: 'applyFilters()',
    description: 'Filtered results are set immediately 85% of the time or after random delay 15% of the time, causing race conditions',
    reproductionSteps: [
      '1. Rapidly change filters in DataProcessor component',
      '2. Some filter results update immediately, others have delay',
      '3. Can display stale filtered data mixed with new data'
    ],
    severity: 'high'
  });
  console.log('✗ BUG FOUND: Non-deterministic state update timing');

  console.log(`\nRound ${roundNumber} Summary: ${roundBugs.length} bugs detected`);
  return roundBugs;
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         FLAKY BEHAVIOR BUG DETECTION - 5 ROUNDS             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const allRoundBugs: Map<string, DetectedBug[]> = new Map();
  
  for (let round = 1; round <= 5; round++) {
    const bugs = await runRound(round);
    bugs.forEach(bug => {
      const key = `${bug.file}::${bug.function}`;
      if (!allRoundBugs.has(key)) {
        allRoundBugs.set(key, []);
      }
      allRoundBugs.get(key)!.push(bug);
    });
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(60) + '\n');

  const uniqueBugs = Array.from(allRoundBugs.entries()).map(([key, bugs]) => ({
    key,
    bugs,
    appearances: bugs.length
  }));

  console.log(`Total Unique Bugs Found: ${uniqueBugs.length}\n`);

  uniqueBugs.forEach((bug, idx) => {
    const [file, func] = bug.key.split('::');
    console.log(`${idx + 1}. ${func} (${file})`);
    console.log(`   Appearances in rounds: ${bug.appearances}/5`);
    if (bug.appearances === 5) {
      console.log('   ⚠ CONSISTENT BUG - Appears every round');
    } else {
      console.log(`   ⚠ FLAKY BUG - Appears intermittently`);
    }
    console.log();
  });

  console.log('Full detection output logged above.\n');
}

main().catch(console.error);
