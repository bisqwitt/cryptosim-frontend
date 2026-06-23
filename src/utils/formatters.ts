export function formatName(name: string, symbol: string) {
  return `${name} (${symbol.toUpperCase()})`
}

export function formatCurrency(value: number | null): string {
  if (value == null) return '-'

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

export function formatPercentage(value: number | null): string {
  if (value == null) return '-'

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatUsd(value: number, options: Intl.NumberFormatOptions = {}): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', ...options })
}

export function formatPrice(value: number): string {
  return formatUsd(value, { maximumFractionDigits: value < 10 ? 6 : 2 })
}

export function formatCrypto(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })
}

export function formatDate(value: Date): string {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
