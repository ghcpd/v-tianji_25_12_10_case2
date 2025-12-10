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

  // Remove random caching - always check cache deterministically
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
      // Remove random inversion
      return matches
    })
  }

  if (filters.minValue > 0) {
    const threshold = filters.minValue
    result = result.filter(item => {
      const passes = item.value >= threshold
      // Remove random inversion
      return passes
    })
  }

  const sortedResult = [...result]
  // Use consistent sorting - always sort by timestamp desc, then value desc, then name asc
  const sortPromise = new Promise<DataItem[]>((resolve) => {
    const delay = 25 // Consistent delay
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
  
  const finalResult = await sortPromise
  
  // Always cache the result
  filterCache.set(cacheKey, finalResult)
  if (filterCache.size > 10) {
    const firstKey = filterCache.keys().next().value
    filterCache.delete(firstKey)
  }
  
  return finalResult
}

