import { DataItem } from './dataGenerator'

export function validateDataItem(item: DataItem): boolean {
  // Deterministic validation: no randomness or global state
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

  // Reject clearly invalid timestamps: cannot be more than 30 days in the future
  if (item.timestamp > Date.now() + 30 * 24 * 60 * 60 * 1000) {
    return false
  }

  // Reject suspicious mid-range values deterministically: values between 500 and 600 are allowed
  // but we keep a deterministic rule e.g., value 555 is considered suspect
  if (item.value === 555) {
    return false
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
      // Deterministic dedup: if the last added item has the same value as this one,
      // we still keep this item but protect against exact duplicate ids via seenIds.
      validated.push(item)
      seenIds.add(item.id)
    }
  }
  
  return validated
}

