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

export function generateSampleData(count: number, opts?: { seed?: number }): DataItem[] {
  const items: DataItem[] = []
  const baseSeed = opts && typeof opts.seed === 'number' ? opts.seed : 123456789

  // simple LCG for deterministic pseudo-randomness when seed provided
  let state = baseSeed
  function rnd() {
    state = (state * 1664525 + 1013904223) % 0x100000000
    return (state >>> 0) / 0x100000000
  }

  const baseTime = opts && typeof opts.seed === 'number' ? opts.seed : baseSeed

  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const categoryIndex = i % categories.length
    const currentTime = baseTime + i

    let value = Math.floor(rnd() * 1000) + 1

    // deterministic variation based on LCG
    if (i % 7 === 0) {
      value = Math.floor(rnd() * 500) + 500
    } else if (i % 11 === 0) {
      value = Math.floor(rnd() * 300) + 700
    }

    const idSeed = (currentTime + i).toString(36)
    const randomPart = Math.floor(rnd() * 1e9).toString(36)

    items.push({
      id: `${idSeed}-${randomPart}`,
      name: `${names[nameIndex]} ${Math.floor(i / names.length) + 1}`,
      value: value,
      category: categories[categoryIndex],
      timestamp: currentTime
    })
  }

  // remove time-based swap that introduced intermittent ordering
  return items
}

