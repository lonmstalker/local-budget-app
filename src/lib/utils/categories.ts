import { categoryPatterns } from '../db/defaults'

export function autoDetectCategory(description: string): string | null {
  const lower = description.toLowerCase()
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => lower.includes(pattern))) {
      return category
    }
  }
  
  return null
}

export function parseAmount(input: string): { amount: number; description: string } | null {
  const patterns = [
    /^([\d.]+)\s+(.+)$/,
    /^(.+)\s+([\d.]+)$/,
    /^\$([\d.]+)\s+(.+)$/,
    /^(.+)\s+\$([\d.]+)$/
  ]
  
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) {
      const [, part1, part2] = match
      const amount = parseFloat(part1.replace('$', ''))
      const description = part2
      
      if (!isNaN(amount)) {
        return { amount, description: description.trim() }
      }
      
      const amount2 = parseFloat(part2.replace('$', ''))
      if (!isNaN(amount2)) {
        return { amount: amount2, description: part1.trim() }
      }
    }
  }
  
  const amount = parseFloat(input.replace(/[^0-9.-]/g, ''))
  if (!isNaN(amount)) {
    return { amount, description: '' }
  }
  
  return null
}

export function suggestTags(description: string, category: string): string[] {
  const tags: string[] = []
  const lower = description.toLowerCase()
  
  if (lower.includes('recurring') || lower.includes('monthly') || lower.includes('subscription')) {
    tags.push('recurring')
  }
  
  if (lower.includes('work') || lower.includes('business')) {
    tags.push('business')
  }
  
  if (lower.includes('personal')) {
    tags.push('personal')
  }
  
  if (lower.includes('urgent') || lower.includes('emergency')) {
    tags.push('urgent')
  }
  
  if (category === 'Travel') {
    tags.push('travel')
  }
  
  if (category === 'Healthcare') {
    tags.push('health')
  }
  
  return tags
}

export function getEmojiForAmount(amount: number, type: 'income' | 'expense'): string {
  if (type === 'income') {
    if (amount < 100) return '💵'
    if (amount < 1000) return '💰'
    return '🤑'
  } else {
    if (amount < 10) return '☕'
    if (amount < 50) return '🛒'
    if (amount < 200) return '💳'
    return '💸'
  }
}