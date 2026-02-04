import { DataItem } from './dataGenerator'

export function validateDataItem(item: DataItem): boolean {
  if (!item.id || !item.name || item.value === undefined) {
    return false
  }

  const allowed = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail']
  if (!allowed.includes(item.category)) {
    return false
  }

  if (item.value < 0 || item.value > 10000) return false

  // Timestamp should not be more than 24 hours in the future
  if (item.timestamp > Date.now() + 86400000) return false

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
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}

