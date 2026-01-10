/**
 * Comprehensive Test Suite for Flaky Bug Fixes
 * Tests all fixed bugs to ensure deterministic behavior
 */

import { generateSampleData } from './src/utils/dataGenerator';
import { validateDataItem, validateDataArray } from './src/utils/dataValidator';
import { processDataWithFilters } from './src/utils/dataProcessor';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

const testResults: TestResult[] = [];

// Helper function to run tests
function test(name: string, fn: () => boolean | string): void {
  try {
    const result = fn();
    if (result === true) {
      testResults.push({
        name,
        passed: true,
        message: '✓ PASSED'
      });
    } else {
      testResults.push({
        name,
        passed: false,
        message: '✗ FAILED',
        details: typeof result === 'string' ? result : 'Test returned false'
      });
    }
  } catch (error) {
    testResults.push({
      name,
      passed: false,
      message: '✗ ERROR',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test Suite 1: generateSampleData Determinism
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║             TEST SUITE 1: generateSampleData()              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

test('generateSampleData() should be deterministic on same structure', () => {
  // Generate data twice in quick succession
  const set1 = generateSampleData(50);
  const set2 = generateSampleData(50);
  
  // Check same number of items
  if (set1.length !== set2.length) {
    return `Length mismatch: ${set1.length} vs ${set2.length}`;
  }
  
  // Check that structure is consistent (same names at indices, even if values differ)
  for (let i = 0; i < set1.length; i++) {
    if (set1[i].name !== set2[i].name) {
      return `Name mismatch at index ${i}: ${set1[i].name} vs ${set2[i].name}`;
    }
    if (set1[i].category !== set2[i].category) {
      return `Category mismatch at index ${i}: ${set1[i].category} vs ${set2[i].category}`;
    }
  }
  
  return true;
});

test('generateSampleData() should not randomly swap items', () => {
  // Generate multiple sets and verify they have same ordering pattern
  const sets = Array.from({ length: 10 }, () => generateSampleData(50));
  
  // Check first 30% position (where swap would happen)
  const pos30 = Math.floor(50 * 0.3);
  
  for (let s = 1; s < sets.length; s++) {
    if (sets[0][pos30].id !== sets[s][pos30].id) {
      return `Item ordering differs between runs at position ${pos30}`;
    }
  }
  
  return true;
});

test('generateSampleData() should generate consistent item count', () => {
  const counts = Array.from({ length: 10 }, () => generateSampleData(100).length);
  const firstCount = counts[0];
  
  for (let i = 1; i < counts.length; i++) {
    if (counts[i] !== firstCount) {
      return `Inconsistent count: ${firstCount} vs ${counts[i]}`;
    }
  }
  
  return true;
});

// Test Suite 2: validateDataItem Determinism
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            TEST SUITE 2: validateDataItem()                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

test('validateDataItem() should accept valid items consistently', () => {
  const validItem = {
    id: 'test-001',
    name: 'Test Item',
    value: 550,
    category: 'Technology',
    timestamp: Date.now()
  };
  
  const results = Array.from({ length: 50 }, () => validateDataItem(validItem));
  const allTrue = results.every(r => r === true);
  
  if (!allTrue) {
    const trueCount = results.filter(r => r).length;
    return `Validation inconsistent: ${trueCount}/50 returned true`;
  }
  
  return true;
});

test('validateDataItem() should reject invalid values consistently', () => {
  const invalidItem = {
    id: 'test-001',
    name: 'Test Item',
    value: 11000, // Over 10000 limit
    category: 'Technology',
    timestamp: Date.now()
  };
  
  const results = Array.from({ length: 50 }, () => validateDataItem(invalidItem));
  const allFalse = results.every(r => r === false);
  
  if (!allFalse) {
    const falseCount = results.filter(r => !r).length;
    return `Validation inconsistent: ${falseCount}/50 returned false`;
  }
  
  return true;
});

test('validateDataItem() should reject items with invalid categories consistently', () => {
  const invalidCategoryItem = {
    id: 'test-001',
    name: 'Test Item',
    value: 500,
    category: 'InvalidCategory',
    timestamp: Date.now()
  };
  
  const results = Array.from({ length: 50 }, () => validateDataItem(invalidCategoryItem));
  const allFalse = results.every(r => r === false);
  
  if (!allFalse) {
    return `Invalid category items not consistently rejected`;
  }
  
  return true;
});

// Test Suite 3: validateDataArray Determinism
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            TEST SUITE 3: validateDataArray()               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

test('validateDataArray() should return consistent array length for same input', () => {
  const data = generateSampleData(100);
  const lengths = Array.from({ length: 10 }, () => validateDataArray([...data]).length);
  
  const firstLength = lengths[0];
  for (let i = 1; i < lengths.length; i++) {
    if (lengths[i] !== firstLength) {
      return `Array length inconsistent: ${firstLength} vs ${lengths[i]}`;
    }
  }
  
  return true;
});

test('validateDataArray() should not randomly filter valid items', () => {
  // Create data with items having duplicate values
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: `test-${i}`,
    name: `Item ${i}`,
    value: 100, // Same value for all
    category: 'Technology',
    timestamp: Date.now()
  }));
  
  const results = Array.from({ length: 5 }, () => validateDataArray([...data]));
  
  for (let i = 1; i < results.length; i++) {
    if (results[0].length !== results[i].length) {
      return `Items with same value filtered inconsistently`;
    }
  }
  
  return true;
});

// Test Suite 4: processDataWithFilters Determinism
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          TEST SUITE 4: processDataWithFilters()            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

test('processDataWithFilters() should apply search filter consistently', async () => {
  const data = generateSampleData(50);
  const searchTerm = 'Alpha';
  
  const result1 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
  const result2 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
  const result3 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
  
  if (result1.length !== result2.length || result2.length !== result3.length) {
    return `Search results inconsistent: ${result1.length}, ${result2.length}, ${result3.length}`;
  }
  
  // Verify all results match the search term
  const allMatch = result1.every(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (!allMatch) {
    return `Results contain non-matching items`;
  }
  
  return true;
});

test('processDataWithFilters() should apply minValue filter consistently', async () => {
  const data = generateSampleData(50);
  const minValue = 500;
  
  const result1 = await processDataWithFilters(data, { searchTerm: '', minValue });
  const result2 = await processDataWithFilters(data, { searchTerm: '', minValue });
  const result3 = await processDataWithFilters(data, { searchTerm: '', minValue });
  
  if (result1.length !== result2.length || result2.length !== result3.length) {
    return `minValue filter results inconsistent: ${result1.length}, ${result2.length}, ${result3.length}`;
  }
  
  // Verify all items meet minimum value threshold
  const allAboveMin = result1.every(item => item.value >= minValue);
  if (!allAboveMin) {
    return `Results contain items below threshold`;
  }
  
  return true;
});

test('processDataWithFilters() should sort results deterministically', async () => {
  const data = generateSampleData(50);
  
  const result1 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  const result2 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  
  // Check that order is the same
  for (let i = 0; i < Math.min(result1.length, result2.length); i++) {
    if (result1[i].id !== result2[i].id) {
      return `Result ordering differs at index ${i}: ${result1[i].id} vs ${result2[i].id}`;
    }
  }
  
  return true;
});

test('processDataWithFilters() should combine filters correctly', async () => {
  const data = generateSampleData(50);
  const searchTerm = 'Alpha';
  const minValue = 300;
  
  const result = await processDataWithFilters(data, { searchTerm, minValue });
  
  // Verify all results match both criteria
  for (const item of result) {
    if (!item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return `Result doesn't match search term: ${item.name}`;
    }
    if (item.value < minValue) {
      return `Result doesn't meet minValue threshold: ${item.value} < ${minValue}`;
    }
  }
  
  return true;
});

// Test Suite 5: Sorting Order Verification
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           TEST SUITE 5: Sorting Order Verification         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

test('processDataWithFilters() should sort by timestamp DESC consistently', async () => {
  const data = generateSampleData(30);
  const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  
  // Check that results are sorted by timestamp in descending order
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].timestamp < result[i + 1].timestamp) {
      return `Timestamp sorting incorrect at index ${i}`;
    }
  }
  
  return true;
});

test('processDataWithFilters() should use value as secondary sort', async () => {
  const data = generateSampleData(50);
  const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  
  // For items with same timestamp, check value sorting (DESC)
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].timestamp === result[i + 1].timestamp) {
      if (result[i].value < result[i + 1].value) {
        return `Value sorting incorrect for items with same timestamp`;
      }
    }
  }
  
  return true;
});

test('processDataWithFilters() should use name as tertiary sort', async () => {
  const data = generateSampleData(50);
  const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
  
  // For items with same timestamp and value, check name sorting (ASC)
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].timestamp === result[i + 1].timestamp && 
        result[i].value === result[i + 1].value) {
      if (result[i].name.localeCompare(result[i + 1].name) > 0) {
        return `Name sorting incorrect for items with same timestamp and value`;
      }
    }
  }
  
  return true;
});

// Run all tests
async function runAllTests() {
  console.log('\nRunning test suite...\n');
  
  // The async tests need to be awaited
  const asyncTests = [
    { name: 'processDataWithFilters() should apply search filter consistently', 
      fn: async () => {
        const data = generateSampleData(50);
        const searchTerm = 'Alpha';
        
        const result1 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
        const result2 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
        const result3 = await processDataWithFilters(data, { searchTerm, minValue: 0 });
        
        if (result1.length !== result2.length || result2.length !== result3.length) {
          return `Search results inconsistent: ${result1.length}, ${result2.length}, ${result3.length}`;
        }
        
        const allMatch = result1.every(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!allMatch) {
          return `Results contain non-matching items`;
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should apply minValue filter consistently',
      fn: async () => {
        const data = generateSampleData(50);
        const minValue = 500;
        
        const result1 = await processDataWithFilters(data, { searchTerm: '', minValue });
        const result2 = await processDataWithFilters(data, { searchTerm: '', minValue });
        const result3 = await processDataWithFilters(data, { searchTerm: '', minValue });
        
        if (result1.length !== result2.length || result2.length !== result3.length) {
          return `minValue filter results inconsistent: ${result1.length}, ${result2.length}, ${result3.length}`;
        }
        
        const allAboveMin = result1.every(item => item.value >= minValue);
        if (!allAboveMin) {
          return `Results contain items below threshold`;
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should sort results deterministically',
      fn: async () => {
        const data = generateSampleData(50);
        
        const result1 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
        const result2 = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
        
        for (let i = 0; i < Math.min(result1.length, result2.length); i++) {
          if (result1[i].id !== result2[i].id) {
            return `Result ordering differs at index ${i}: ${result1[i].id} vs ${result2[i].id}`;
          }
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should combine filters correctly',
      fn: async () => {
        const data = generateSampleData(50);
        const searchTerm = 'Alpha';
        const minValue = 300;
        
        const result = await processDataWithFilters(data, { searchTerm, minValue });
        
        for (const item of result) {
          if (!item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return `Result doesn't match search term: ${item.name}`;
          }
          if (item.value < minValue) {
            return `Result doesn't meet minValue threshold: ${item.value} < ${minValue}`;
          }
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should sort by timestamp DESC consistently',
      fn: async () => {
        const data = generateSampleData(30);
        const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
        
        for (let i = 0; i < result.length - 1; i++) {
          if (result[i].timestamp < result[i + 1].timestamp) {
            return `Timestamp sorting incorrect at index ${i}`;
          }
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should use value as secondary sort',
      fn: async () => {
        const data = generateSampleData(50);
        const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
        
        for (let i = 0; i < result.length - 1; i++) {
          if (result[i].timestamp === result[i + 1].timestamp) {
            if (result[i].value < result[i + 1].value) {
              return `Value sorting incorrect for items with same timestamp`;
            }
          }
        }
        
        return true;
      }
    },
    { name: 'processDataWithFilters() should use name as tertiary sort',
      fn: async () => {
        const data = generateSampleData(50);
        const result = await processDataWithFilters(data, { searchTerm: '', minValue: 0 });
        
        for (let i = 0; i < result.length - 1; i++) {
          if (result[i].timestamp === result[i + 1].timestamp && 
              result[i].value === result[i + 1].value) {
            if (result[i].name.localeCompare(result[i + 1].name) > 0) {
              return `Name sorting incorrect for items with same timestamp and value`;
            }
          }
        }
        
        return true;
      }
    }
  ];

  // Run async tests
  for (const asyncTest of asyncTests) {
    try {
      const result = await asyncTest.fn();
      if (result === true) {
        testResults.push({
          name: asyncTest.name,
          passed: true,
          message: '✓ PASSED'
        });
      } else {
        testResults.push({
          name: asyncTest.name,
          passed: false,
          message: '✗ FAILED',
          details: typeof result === 'string' ? result : 'Test returned false'
        });
      }
    } catch (error) {
      testResults.push({
        name: asyncTest.name,
        passed: false,
        message: '✗ ERROR',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log();
  });

  console.log('='.repeat(60));
  console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed out of ${testResults.length} total tests`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    console.log('✓ ALL TESTS PASSED - Flaky bugs have been fixed successfully!');
  } else {
    console.log('✗ Some tests failed - Review details above');
  }
}

runAllTests().catch(console.error);
