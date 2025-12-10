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
  
  // Remove random validation failures
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
      // Remove random skips
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}

