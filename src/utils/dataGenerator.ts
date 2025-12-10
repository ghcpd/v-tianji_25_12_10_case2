const categories = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail']
const names = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
  'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
]

export interface DataItem {
  id: string
  name: string
  value: number
  category: string
  timestamp: number
}

export function generateSampleData(count: number): DataItem[] {
  const items: DataItem[] = []
  const baseTime = Date.now()
  
  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const categoryIndex = i % categories.length
    const currentTime = baseTime + i
    
    let value = Math.floor(Math.random() * 1000) + 1
    
    // Remove time-based value modifications for consistency
    const idSeed = currentTime.toString(36)
    const randomPart = Math.random().toString(36).substr(2, 9)
    
    items.push({
      id: `${idSeed}-${randomPart}`,
      name: `${names[nameIndex]} ${Math.floor(i / names.length) + 1}`,
      value: value,
      category: categories[categoryIndex],
      timestamp: currentTime
    })
  }
  
  // Remove random swapping
  return items
}

