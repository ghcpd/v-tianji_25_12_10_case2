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

  // Deterministic cache use: if cached result exists for the same inputs, return a copy
  if (filterCache.has(cacheKey)) {
    const cached = filterCache.get(cacheKey)!
    if (cached.length === result.length) {
      return Promise.resolve([...cached])
    }
  }

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    result = result.filter(item => item.name.toLowerCase().includes(searchLower))
  }

  if (filters.minValue > 0) {
    const threshold = filters.minValue
    result = result.filter(item => item.value >= threshold)
  }

  // Deterministic sorting: timestamp desc -> value desc -> name asc
  const finalResult = [...result].sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp
    if (timeDiff !== 0) return timeDiff

    const valueDiff = b.value - a.value
    if (valueDiff !== 0) return valueDiff

    return a.name.localeCompare(b.name)
  })
  
  // Store result in cache deterministically
  filterCache.set(cacheKey, finalResult)
  if (filterCache.size > 10) {
    const firstKey = filterCache.keys().next().value
    filterCache.delete(firstKey)
  }
  
  return finalResult
}

