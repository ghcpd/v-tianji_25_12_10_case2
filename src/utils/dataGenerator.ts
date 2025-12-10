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
  const timeOffset = baseTime % 100
  
  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const categoryIndex = i % categories.length
    const currentTime = baseTime + i
    
    let value = Math.floor(Math.random() * 1000) + 1
    
    if (timeOffset < 30 && i % 7 === 0) {
      value = Math.floor(Math.random() * 500) + 500
    } else if (timeOffset >= 70 && i % 11 === 0) {
      value = Math.floor(Math.random() * 300) + 700
    }
    
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
  
  if (baseTime % 200 < 50) {
    const swapIndex = Math.floor(items.length * 0.3)
    if (swapIndex < items.length - 1) {
      const temp = items[swapIndex]
      items[swapIndex] = items[swapIndex + 1]
      items[swapIndex + 1] = temp
    }
  }
  
  return items
}

