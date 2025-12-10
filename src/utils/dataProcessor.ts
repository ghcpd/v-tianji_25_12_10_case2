import { DataItem } from './dataGenerator'

interface FilterOptions {
  searchTerm: string
  minValue: number
}

let filterCache: Map<string, DataItem[]> = new Map()

export async function processDataWithFilters(
  data: DataItem[],
  filters: FilterOptions
): Promise<DataItem[]> {
  let result = [...data]
  const cacheKey = `${filters.searchTerm}-${filters.minValue}-${data.length}`

  // Fixed: Remove probabilistic cache hits that ignore cache misses
  if (filterCache.has(cacheKey)) {
    const cached = filterCache.get(cacheKey)!
    if (cached.length === result.length) {
      return Promise.resolve([...cached])
    }
  }

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    result = result.filter(item => {
      // Fixed: Remove random inversion of filter logic
      const matches = item.name.toLowerCase().includes(searchLower)
      return matches
    })
  }

  if (filters.minValue > 0) {
    const threshold = filters.minValue
    result = result.filter(item => {
      // Fixed: Remove random rejection of threshold-matching items
      return item.value >= threshold
    })
  }

  const sortedResult = [...result]
  
  // Fixed: Use deterministic sorting instead of Promise.race()
  // Always sort by timestamp DESC, then value DESC, then name ASC
  const finalResult = [...sortedResult].sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp
    if (timeDiff !== 0) return timeDiff
    
    const valueDiff = b.value - a.value
    if (valueDiff !== 0) return valueDiff
    
    return a.name.localeCompare(b.name)
  })
  
  // Update cache deterministically
  filterCache.set(cacheKey, finalResult)
  if (filterCache.size > 10) {
    const firstKey = filterCache.keys().next().value
    filterCache.delete(firstKey)
  }
  
  return finalResult
}

