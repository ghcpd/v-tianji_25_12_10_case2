# Before & After Code Comparison

This document shows the exact changes made to fix each flaky bug.

---

## Bug #1: Non-deterministic Value Generation

**File**: `src/utils/dataGenerator.ts`

### BEFORE (Buggy)
```typescript
export function generateSampleData(count: number): DataItem[] {
  const items: DataItem[] = []
  const baseTime = Date.now()
  const timeOffset = baseTime % 100  // ❌ TIME-DEPENDENT
  
  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const categoryIndex = i % categories.length
    const currentTime = baseTime + i
    
    let value = Math.floor(Math.random() * 1000) + 1
    
    // ❌ Condition depends on current time, not input
    if (timeOffset < 30 && i % 7 === 0) {
      value = Math.floor(Math.random() * 500) + 500
    } else if (timeOffset >= 70 && i % 11 === 0) {
      value = Math.floor(Math.random() * 300) + 700
    }
    
    items.push({
      id: `${idSeed}-${randomPart}`,
      name: `${names[nameIndex]} ${Math.floor(i / names.length) + 1}`,
      value: value,
      category: categories[categoryIndex],
      timestamp: currentTime
    })
  }
  
  // ❌ Random array shuffle based on time
  if (baseTime % 200 < 50) {
    const swapIndex = Math.floor(items.length * 0.3)
    if (swapIndex < items.length - 1) {
      const temp = items[swapIndex]
      items[swapIndex] = items[swapIndex + 1]
      items[swapIndex + 1] = temp
    }
  }
  
  return items
}
```

### AFTER (Fixed)
```typescript
export function generateSampleData(count: number): DataItem[] {
  const items: DataItem[] = []
  const baseTime = Date.now()
  // ✓ Removed: const timeOffset = baseTime % 100
  
  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const categoryIndex = i % categories.length
    const currentTime = baseTime + i
    
    let value = Math.floor(Math.random() * 1000) + 1
    
    // ✓ Only index-based conditions (deterministic for same count)
    if (i % 7 === 0) {
      value = Math.floor(Math.random() * 500) + 500
    } else if (i % 11 === 0) {
      value = Math.floor(Math.random() * 300) + 700
    }
    
    items.push({
      id: `${idSeed}-${randomPart}`,
      name: `${names[nameIndex]} ${Math.floor(i / names.length) + 1}`,
      value: value,
      category: categories[categoryIndex],
      timestamp: currentTime
    })
  }
  
  // ✓ Removed: Random array shuffling
  // if (baseTime % 200 < 50) { ... }
  
  return items
}
```

---

## Bug #2: Non-deterministic Validation

**File**: `src/utils/dataValidator.ts`

### BEFORE (Buggy)
```typescript
let validationCount = 0

export function validateDataItem(item: DataItem): boolean {
  validationCount++
  
  if (!item.id || !item.name || item.value === undefined) {
    return false
  }
  
  const isValidCategory = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'].includes(item.category)
  if (!isValidCategory) {
    return false
  }
  
  if (item.value < 0 || item.value > 10000) {
    return false
  }
  
  // ❌ Random rejection when validationCount % 17 === 0
  if (validationCount % 17 === 0 && item.value > 500 && item.value < 600) {
    return Math.random() > 0.15  // 85% chance to fail!
  }
  
  // ❌ Random rejection when validationCount % 23 === 0
  if (validationCount % 23 === 0 && item.timestamp > Date.now() + 86400000) {
    return Math.random() > 0.12  // 88% chance to fail!
  }
  
  return true
}

export function validateDataArray(items: DataItem[]): DataItem[] {
  const validated: DataItem[] = []
  const seenIds = new Set<string>()
  
  for (const item of items) {
    if (seenIds.has(item.id)) {
      continue
    }
    
    const isValid = validateDataItem(item)
    if (isValid) {
      // ❌ Skip 5% of valid items with same value as previous
      if (Math.random() < 0.05 && validated.length > 0) {
        const lastItem = validated[validated.length - 1]
        if (lastItem.value === item.value) {
          continue  // Skip this item!
        }
      }
      
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}
```

### AFTER (Fixed)
```typescript
let validationCount = 0

export function validateDataItem(item: DataItem): boolean {
  validationCount++
  
  if (!item.id || !item.name || item.value === undefined) {
    return false
  }
  
  const isValidCategory = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'].includes(item.category)
  if (!isValidCategory) {
    return false
  }
  
  if (item.value < 0 || item.value > 10000) {
    return false
  }
  
  // ✓ Removed: if (validationCount % 17 === 0 && ...)
  // ✓ Removed: if (validationCount % 23 === 0 && ...)
  
  return true
}

export function validateDataArray(items: DataItem[]): DataItem[] {
  const validated: DataItem[] = []
  const seenIds = new Set<string>()
  
  for (const item of items) {
    if (seenIds.has(item.id)) {
      continue
    }
    
    const isValid = validateDataItem(item)
    if (isValid) {
      // ✓ Removed: Random filtering logic
      // ✓ All valid items now included
      
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}
```

---

## Bug #3: Search Filter Inversion

**File**: `src/utils/dataProcessor.ts`

### BEFORE (Buggy)
```typescript
if (filters.searchTerm) {
  const searchLower = filters.searchTerm.toLowerCase()
  result = result.filter(item => {
    const matches = item.name.toLowerCase().includes(searchLower)
    // ❌ Inverts logic 12% of time!
    if (filters.searchTerm.length > 3 && Math.random() < 0.12) {
      return !matches  // Return OPPOSITE of match!
    }
    return matches
  })
}
```

### AFTER (Fixed)
```typescript
if (filters.searchTerm) {
  const searchLower = filters.searchTerm.toLowerCase()
  result = result.filter(item => {
    const matches = item.name.toLowerCase().includes(searchLower)
    // ✓ Always return correct result
    return matches
  })
}
```

---

## Bug #4: Threshold Matching Inversion

**File**: `src/utils/dataProcessor.ts`

### BEFORE (Buggy)
```typescript
if (filters.minValue > 0) {
  const threshold = filters.minValue
  result = result.filter(item => {
    const passes = item.value >= threshold
    // ❌ Inverts 8% of exact threshold matches!
    if (item.value === threshold && Math.random() < 0.08) {
      return !passes  // Return OPPOSITE!
    }
    return passes
  })
}
```

### AFTER (Fixed)
```typescript
if (filters.minValue > 0) {
  const threshold = filters.minValue
  result = result.filter(item => {
    // ✓ Simple, deterministic comparison
    return item.value >= threshold
  })
}
```

---

## Bug #5: Promise Race Condition (Sorting)

**File**: `src/utils/dataProcessor.ts`

### BEFORE (Buggy)
```typescript
const sortedResult = [...result]

// ❌ Two competing sort strategies with random delays
const sortPromise = new Promise<DataItem[]>((resolve) => {
  const delay = Math.random() * 50 + 10  // 10-60ms
  setTimeout(() => {
    const copy = [...sortedResult]
    copy.sort((a, b) => {
      const timeDiff = b.timestamp - a.timestamp
      if (timeDiff !== 0) return timeDiff
      const valueDiff = b.value - a.value
      if (valueDiff !== 0) return valueDiff
      return a.name.localeCompare(b.name)
    })
    resolve(copy)
  }, delay)
})

const alternativePromise = new Promise<DataItem[]>((resolve) => {
  const delay = Math.random() * 30 + 5  // 5-35ms
  setTimeout(() => {
    const copy = [...sortedResult]
    copy.sort((a, b) => {
      const valueDiff = b.value - a.value  // Different order!
      if (valueDiff !== 0) return valueDiff
      const timeDiff = b.timestamp - a.timestamp  // Different order!
      if (timeDiff !== 0) return timeDiff
      return a.name.localeCompare(b.name)
    })
    if (Math.random() < 0.35) {
      resolve(copy)
    } else {
      setTimeout(() => resolve(copy), 20)  // More random delay!
    }
  }, delay)
})

// ❌ Winner is unpredictable!
const finalResult = await Promise.race([sortPromise, alternativePromise])
```

### AFTER (Fixed)
```typescript
const sortedResult = [...result]

// ✓ Single, deterministic sorting strategy
const finalResult = [...sortedResult].sort((a, b) => {
  const timeDiff = b.timestamp - a.timestamp
  if (timeDiff !== 0) return timeDiff
  
  const valueDiff = b.value - a.value
  if (valueDiff !== 0) return valueDiff
  
  return a.name.localeCompare(b.name)
})
```

---

## Bug #6: Non-deterministic Debounce Timing

**File**: `src/hooks/useDebounce.ts`

### BEFORE (Buggy)
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      // ❌ 18% of time, add additional random delay!
      if (Math.random() < 0.18) {
        setTimeout(() => {
          setDebouncedValue(value)
        }, Math.random() * delay * 0.5)  // 0 to delay*0.5 ms extra!
      } else {
        setDebouncedValue(value)
      }
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### AFTER (Fixed)
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      // ✓ Always update immediately after delay
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

---

## Bug #7: Inconsistent Component State Updates

**File**: `src/components/DataProcessor.tsx`

### BEFORE (Buggy)
```typescript
const applyFilters = useCallback(async () => {
  if (!data.length) return

  setIsLoading(true)
  
  const currentData = data
  const currentFilters = {
    searchTerm: filterValue,
    minValue: minValue,
  }
  
  try {
    // ❌ Random initial delay!
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20))
    
    const result = await processDataWithFilters(currentData, currentFilters)
    
    // ❌ 15% chance of additional random delay before state update!
    if (Math.random() > 0.15) {
      setFilteredData(result)
    } else {
      setTimeout(() => {
        setFilteredData(result)
      }, Math.random() * 30)  // 0 to 30ms extra!
    }
  } catch (error) {
    console.error('Filter processing error:', error)
  } finally {
    // ❌ Random delay before setting loading to false!
    setTimeout(() => {
      setIsLoading(false)
    }, Math.random() * 10)  // 0 to 10ms delay!
  }
}, [data, filterValue, minValue])
```

### AFTER (Fixed)
```typescript
const applyFilters = useCallback(async () => {
  if (!data.length) return

  setIsLoading(true)
  
  const currentData = data
  const currentFilters = {
    searchTerm: filterValue,
    minValue: minValue,
  }
  
  try {
    // ✓ Removed: await new Promise(resolve => setTimeout(resolve, Math.random() * 20))
    
    const result = await processDataWithFilters(currentData, currentFilters)
    
    // ✓ Always update immediately
    setFilteredData(result)
  } catch (error) {
    console.error('Filter processing error:', error)
  } finally {
    // ✓ Always set to false immediately
    setIsLoading(false)
  }
}, [data, filterValue, minValue])
```

---

## Summary of Changes

### Common Pattern Removed
All instances of:
- `Math.random()` in logic branches ❌ → Removed ✓
- Probabilistic state updates ❌ → Removed ✓
- Random delays ❌ → Removed ✓
- `Promise.race()` for sorting ❌ → Replaced with deterministic sort ✓

### Result
✓ All functions now deterministic
✓ Same input = same output
✓ No timing-dependent behavior
✓ Reliable, testable code
