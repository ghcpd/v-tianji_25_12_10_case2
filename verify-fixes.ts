/**
 * Post-Fix Verification Script
 * Runs 5 rounds to verify that flaky bugs are fixed
 */

import { generateSampleData } from './src/utils/dataGenerator';
import { validateDataArray } from './src/utils/dataValidator';
import { processDataWithFilters } from './src/utils/dataProcessor';

interface VerificationBug {
  bug: string;
  round: number;
  detected: boolean;
}

const verificationResults: VerificationBug[] = [];

async function verifyRound(roundNumber: number): Promise<number> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`VERIFICATION ROUND ${roundNumber}`);
  console.log(`${'='.repeat(60)}\n`);

  let bugsFound = 0;

  // Check 1: generateSampleData determinism
  console.log('Checking: generateSampleData()...');
  const samples1 = generateSampleData(50);
  const samples2 = generateSampleData(50);
  
  let bug = false;
  for (let i = 0; i < samples1.length; i++) {
    if (samples1[i].name !== samples2[i].name || samples1[i].category !== samples2[i].category) {
      bug = true;
      break;
    }
  }
  
  if (bug) {
    console.log('✗ FAIL: Non-deterministic data generation detected');
    bugsFound++;
    verificationResults.push({ bug: 'generateSampleData', round: roundNumber, detected: true });
  } else {
    console.log('✓ PASS: Data generation is deterministic');
    verificationResults.push({ bug: 'generateSampleData', round: roundNumber, detected: false });
  }

  // Check 2: validateDataArray consistency
  console.log('\nChecking: validateDataArray()...');
  const testData = generateSampleData(100);
  const lengths: number[] = [];
  for (let i = 0; i < 5; i++) {
    lengths.push(validateDataArray([...testData]).length);
  }
  
  bug = !lengths.every(l => l === lengths[0]);
  if (bug) {
    console.log('✗ FAIL: Non-deterministic validation filtering detected');
    bugsFound++;
    verificationResults.push({ bug: 'validateDataArray', round: roundNumber, detected: true });
  } else {
    console.log(`✓ PASS: Validation is consistent (${lengths[0]} items)`);
    verificationResults.push({ bug: 'validateDataArray', round: roundNumber, detected: false });
  }

  // Check 3: processDataWithFilters search consistency
  console.log('\nChecking: processDataWithFilters() search...');
  const data = generateSampleData(50);
  const result1 = await processDataWithFilters(data, { searchTerm: 'Alpha', minValue: 0 });
  const result2 = await processDataWithFilters(data, { searchTerm: 'Alpha', minValue: 0 });
  const result3 = await processDataWithFilters(data, { searchTerm: 'Alpha', minValue: 0 });
  
  bug = (result1.length !== result2.length) || (result2.length !== result3.length);
  
  // Also check if all match the search term
  const allMatch = result1.every(item => item.name.toLowerCase().includes('alpha'));
  bug = bug || !allMatch;
  
  if (bug) {
    console.log('✗ FAIL: Non-deterministic search filter detected');
    bugsFound++;
    verificationResults.push({ bug: 'processDataWithFilters search', round: roundNumber, detected: true });
  } else {
    console.log(`✓ PASS: Search filter is consistent (${result1.length} items found)`);
    verificationResults.push({ bug: 'processDataWithFilters search', round: roundNumber, detected: false });
  }

  // Check 4: processDataWithFilters minValue consistency
  console.log('\nChecking: processDataWithFilters() minValue...');
  const minValue = 500;
  const resultMin1 = await processDataWithFilters(data, { searchTerm: '', minValue });
  const resultMin2 = await processDataWithFilters(data, { searchTerm: '', minValue });
  
  bug = resultMin1.length !== resultMin2.length;
  
  // Check all meet threshold
  const allAboveMin = resultMin1.every(item => item.value >= minValue);
  bug = bug || !allAboveMin;
  
  if (bug) {
    console.log('✗ FAIL: Non-deterministic minValue filter detected');
    bugsFound++;
    verificationResults.push({ bug: 'processDataWithFilters minValue', round: roundNumber, detected: true });
  } else {
    console.log(`✓ PASS: MinValue filter is consistent (${resultMin1.length} items >= ${minValue})`);
    verificationResults.push({ bug: 'processDataWithFilters minValue', round: roundNumber, detected: false });
  }

  // Check 5: processDataWithFilters sorting
  console.log('\nChecking: processDataWithFilters() sorting...');
  const resultSort1 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  const resultSort2 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  
  bug = false;
  for (let i = 0; i < Math.min(resultSort1.length, resultSort2.length); i++) {
    if (resultSort1[i].id !== resultSort2[i].id) {
      bug = true;
      break;
    }
  }
  
  // Check sorting order
  for (let i = 0; i < resultSort1.length - 1; i++) {
    if (resultSort1[i].timestamp < resultSort1[i + 1].timestamp) {
      bug = true;
      break;
    }
  }
  
  if (bug) {
    console.log('✗ FAIL: Non-deterministic sorting detected');
    bugsFound++;
    verificationResults.push({ bug: 'processDataWithFilters sorting', round: roundNumber, detected: true });
  } else {
    console.log('✓ PASS: Sorting is deterministic and correct');
    verificationResults.push({ bug: 'processDataWithFilters sorting', round: roundNumber, detected: false });
  }

  console.log(`\nRound ${roundNumber} Summary: ${bugsFound} bugs detected\n`);
  return bugsFound;
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     FLAKY BUG FIX VERIFICATION - 5 ROUNDS POST-FIX         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let totalBugsDetected = 0;
  
  for (let round = 1; round <= 5; round++) {
    const bugs = await verifyRound(round);
    totalBugsDetected += bugs;
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const bugCategories = ['generateSampleData', 'validateDataArray', 'processDataWithFilters search', 'processDataWithFilters minValue', 'processDataWithFilters sorting'];
  
  bugCategories.forEach(bugName => {
    const detections = verificationResults.filter(r => r.bug === bugName);
    const appearances = detections.filter(r => r.detected).length;
    const status = appearances === 0 ? '✓ FIXED' : `✗ STILL FLAKY (${appearances}/5 rounds)`;
    console.log(`${bugName}: ${status}`);
  });

  console.log('\n' + '='.repeat(60));
  
  if (totalBugsDetected === 0) {
    console.log('✓✓✓ VERIFICATION SUCCESSFUL ✓✓✓');
    console.log('All flaky bugs have been successfully fixed!');
    console.log('No bugs detected in any of the 5 verification rounds.');
  } else {
    console.log(`✗✗✗ ${totalBugsDetected} BUG(S) STILL DETECTED ✗✗✗`);
    console.log('Some flaky bugs persist - review fixes above.');
  }
  
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
