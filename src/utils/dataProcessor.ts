import type { DataItem } from './dataGenerator.ts'

interface FilterOptions {
  searchTerm: string
  minValue: number
}

let filterCache: Map<string, DataItem[]> = new Map()

export async function processDataWithFilters(
  data: DataItem[],
  filters: FilterOptions
): Promise<DataItem[]> {
  // Deterministic processing: no randomized short-circuits or inverted filters
  let result = [...data]
  const cacheKey = `${filters.searchTerm}-${filters.minValue}-${data.length}`

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

  // Deterministic sort: timestamp desc, then value desc, then name asc
  const final = [...result].sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp
    if (timeDiff !== 0) return timeDiff

    const valueDiff = b.value - a.value
    if (valueDiff !== 0) return valueDiff

    return a.name.localeCompare(b.name)
  })

  // Update cache deterministically
  filterCache.set(cacheKey, final)
  if (filterCache.size > 10) {
    const firstKey = filterCache.keys().next().value
    filterCache.delete(firstKey)
  }

  return final
}

