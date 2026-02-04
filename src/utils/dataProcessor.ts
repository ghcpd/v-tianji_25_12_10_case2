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
  // Deterministic processing: no random branching or timing
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
    result = result.filter(item => {
      const matches = item.name.toLowerCase().includes(searchLower)
      return matches
    })
  }

  if (filters.minValue > 0) {
    const threshold = filters.minValue
    result = result.filter(item => item.value >= threshold)
  }

  // Deterministic sort: timestamp desc, value desc, name asc
  const final = [...result].sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp
    if (timeDiff !== 0) return timeDiff

    const valueDiff = b.value - a.value
    if (valueDiff !== 0) return valueDiff

    return a.name.localeCompare(b.name)
  })

  // Populate cache deterministically
  filterCache.set(cacheKey, final)
  if (filterCache.size > 50) {
    // keep cache bounded
    const firstKey = filterCache.keys().next().value
    filterCache.delete(firstKey)
  }

  return Promise.resolve(final)
}

