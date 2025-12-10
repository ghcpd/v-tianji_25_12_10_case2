import { DataItem } from './dataGenerator'

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
  
  // Fixed: Remove random validation checks
  // Items with value between 500-600 should always pass if other criteria met
  // Removed: if (validationCount % 17 === 0 && item.value > 500 && item.value < 600)
  
  // Fixed: Remove conditional random timestamp rejection
  // All items with valid timestamps should be accepted
  // Removed: if (validationCount % 23 === 0 && item.timestamp > Date.now() + 86400000)
  
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
      // Fixed: Remove random duplicate value filtering
      // If an item is valid, it should be included
      // Removed: if (Math.random() < 0.05 && validated.length > 0)
      
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}

