/**
 * Simplified and Fixed Test Suite for Flaky Bug Fixes
 * Focuses on deterministic behavior verification
 */

import { generateSampleData } from './src/utils/dataGenerator';
import { validateDataItem, validateDataArray } from './src/utils/dataValidator';
import { processDataWithFilters } from './src/utils/dataProcessor';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const testResults: TestResult[] = [];

function test(name: string, fn: () => Promise<boolean> | boolean): void {
  console.log(`Testing: ${name}...`);
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         FLAKY BUG FIX VERIFICATION TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Test 1: generateSampleData determinism
  console.log('═ TEST 1: generateSampleData Determinism ═');
  try {
    const data1 = generateSampleData(100);
    const data2 = generateSampleData(100);
    
    if (data1.length === data2.length) {
      console.log('✓ Same item count across runs');
      testResults.push({ name: 'generateSampleData consistency', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Different item counts:', data1.length, 'vs', data2.length);
      testResults.push({ name: 'generateSampleData consistency', passed: false, message: '✗ FAILED' });
    }

    // Check structure matches
    let structureMatches = true;
    for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
      if (data1[i].name !== data2[i].name || data1[i].category !== data2[i].category) {
        structureMatches = false;
        break;
      }
    }
    
    if (structureMatches) {
      console.log('✓ Item structure consistent across runs');
      testResults.push({ name: 'generateSampleData structure', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Item structure differs across runs');
      testResults.push({ name: 'generateSampleData structure', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'generateSampleData', passed: false, message: '✗ ERROR' });
  }

  // Test 2: validateDataItem determinism
  console.log('\n═ TEST 2: validateDataItem Determinism ═');
  try {
    const testItem = {
      id: 'test-001',
      name: 'Test Item',
      value: 550,
      category: 'Technology',
      timestamp: Date.now()
    };

    const results: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(validateDataItem(testItem));
    }

    const allTrue = results.every(r => r === true);
    if (allTrue) {
      console.log('✓ Valid items consistently accepted (100/100)');
      testResults.push({ name: 'validateDataItem acceptance', passed: true, message: '✓ PASSED' });
    } else {
      const trueCount = results.filter(r => r).length;
      console.log(`✗ Inconsistent validation: ${trueCount}/100 passed`);
      testResults.push({ name: 'validateDataItem acceptance', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'validateDataItem', passed: false, message: '✗ ERROR' });
  }

  // Test 3: validateDataArray determinism
  console.log('\n═ TEST 3: validateDataArray Determinism ═');
  try {
    const sourceData = generateSampleData(100);
    const results: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const validated = validateDataArray([...sourceData]);
      results.push(validated.length);
    }

    const allSame = results.every(r => r === results[0]);
    if (allSame) {
      console.log(`✓ Consistent validation array length: ${results[0]} items across 5 runs`);
      testResults.push({ name: 'validateDataArray consistency', passed: true, message: '✓ PASSED' });
    } else {
      console.log(`✗ Inconsistent array lengths: ${results.join(', ')}`);
      testResults.push({ name: 'validateDataArray consistency', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'validateDataArray', passed: false, message: '✗ ERROR' });
  }

  // Test 4: processDataWithFilters search determinism
  console.log('\n═ TEST 4: processDataWithFilters Search Filter ═');
  try {
    const data = generateSampleData(100);
    const searchTerm = 'Alpha';
    
    const result1 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
    const result2 = await processDataWithFilters(data, { searchTerm, minValue: 0 });

    if (result1.length === result2.length) {
      console.log(`✓ Search filter consistent: ${result1.length} items in both runs`);
      testResults.push({ name: 'processDataWithFilters search', passed: true, message: '✓ PASSED' });
    } else {
      console.log(`✗ Search filter inconsistent: ${result1.length} vs ${result2.length}`);
      testResults.push({ name: 'processDataWithFilters search', passed: false, message: '✗ FAILED' });
    }

    // Verify all results match search term
    const allMatch = result1.every(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (allMatch) {
      console.log(`✓ All ${result1.length} results match search term "${searchTerm}"`);
      testResults.push({ name: 'processDataWithFilters search matching', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Results contain non-matching items');
      testResults.push({ name: 'processDataWithFilters search matching', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'processDataWithFilters search', passed: false, message: '✗ ERROR' });
  }

  // Test 5: processDataWithFilters minValue determinism
  console.log('\n═ TEST 5: processDataWithFilters MinValue Filter ═');
  try {
    const data = generateSampleData(100);
    const minValue = 500;
    
    const result1 = await processDataWithFilters(data, { searchTerm: '', minValue });
    const result2 = await processDataWithFilters(data, { searchTerm: '', minValue });

    if (result1.length === result2.length) {
      console.log(`✓ MinValue filter consistent: ${result1.length} items in both runs`);
      testResults.push({ name: 'processDataWithFilters minValue', passed: true, message: '✓ PASSED' });
    } else {
      console.log(`✗ MinValue filter inconsistent: ${result1.length} vs ${result2.length}`);
      testResults.push({ name: 'processDataWithFilters minValue', passed: false, message: '✗ FAILED' });
    }

    // Verify all items meet threshold
    const allAboveMin = result1.every(item => item.value >= minValue);
    if (allAboveMin) {
      console.log(`✓ All ${result1.length} results have value >= ${minValue}`);
      testResults.push({ name: 'processDataWithFilters minValue threshold', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Results contain items below threshold');
      testResults.push({ name: 'processDataWithFilters minValue threshold', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'processDataWithFilters minValue', passed: false, message: '✗ ERROR' });
  }

  // Test 6: processDataWithFilters sorting
  console.log('\n═ TEST 6: processDataWithFilters Deterministic Sorting ═');
  try {
    const data = generateSampleData(100);
    
    const result1 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
    const result2 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });

    let sameOrder = true;
    for (let i = 0; i < Math.min(result1.length, result2.length); i++) {
      if (result1[i].id !== result2[i].id) {
        sameOrder = false;
        break;
      }
    }

    if (sameOrder) {
      console.log(`✓ Results sorted consistently across runs`);
      testResults.push({ name: 'processDataWithFilters sorting', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Result order differs between runs');
      testResults.push({ name: 'processDataWithFilters sorting', passed: false, message: '✗ FAILED' });
    }

    // Verify sorting order (timestamp DESC)
    let correctSort = true;
    for (let i = 0; i < result1.length - 1; i++) {
      if (result1[i].timestamp < result1[i + 1].timestamp) {
        correctSort = false;
        break;
      }
    }

    if (correctSort) {
      console.log(`✓ Results correctly sorted by timestamp (DESC)`);
      testResults.push({ name: 'processDataWithFilters timestamp sort', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Sorting order incorrect (not timestamp DESC)');
      testResults.push({ name: 'processDataWithFilters timestamp sort', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'processDataWithFilters sorting', passed: false, message: '✗ ERROR' });
  }

  // Test 7: Combined filters
  console.log('\n═ TEST 7: processDataWithFilters Combined Filters ═');
  try {
    const data = generateSampleData(100);
    
    const result = await processDataWithFilters(data, { searchTerm: 'Alpha', minValue: 300 });

    let valid = true;
    for (const item of result) {
      if (!item.name.toLowerCase().includes('alpha') || item.value < 300) {
        valid = false;
        break;
      }
    }

    if (valid) {
      console.log(`✓ Combined filters work correctly: ${result.length} items match both criteria`);
      testResults.push({ name: 'processDataWithFilters combined filters', passed: true, message: '✓ PASSED' });
    } else {
      console.log('✗ Combined filters failed - some results don\'t match criteria');
      testResults.push({ name: 'processDataWithFilters combined filters', passed: false, message: '✗ FAILED' });
    }
  } catch (error) {
    console.log('✗ Error:', error);
    testResults.push({ name: 'processDataWithFilters combined filters', passed: false, message: '✗ ERROR' });
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('FINAL TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  
  console.log(`\nTotal Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n✓✓✓ ALL TESTS PASSED ✓✓✓');
    console.log('All flaky bugs have been successfully fixed!');
  } else {
    console.log(`\n✗✗✗ ${failed} TEST(S) FAILED ✗✗✗`);
  }
  
  console.log('═'.repeat(60) + '\n');
}

runTests().catch(console.error);
