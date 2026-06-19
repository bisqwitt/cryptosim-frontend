export function formatName(name: string, symbol: string) {
  return `${name} (${symbol.toUpperCase()})`
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }

  return `$${value.toLocaleString()}`
}

export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
