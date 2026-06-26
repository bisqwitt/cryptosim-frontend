export const MAX_DAYS_IN_PAST = 365

function daysInPast(d: Date): number {
  return (Date.now() - d.getTime()) / (24 * 60 * 60 * 1000)
}

export function validatePortfolio(id: number | null, attempted: boolean): string {
  if (!id) return attempted ? 'Please select a portfolio.' : ''
  return ''
}

export interface AmountLimit {
  max: number
  message: string
}

export function validatePortfolioName(name: string): string {
  const trimmedName = name.trim()

  if (!trimmedName) {
    return 'Name is required.'
  }

  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters.'
  }

  if (trimmedName.length > 25) {
    return 'Max length is 25 characters.'
  }

  return ''
}

export function validateAmount(
  amount: number | null,
  attempted: boolean,
  limit: AmountLimit | null,
): string {
  if (amount == null) return attempted ? 'Please enter a valid amount.' : ''
  if (amount <= 0) return 'Please enter a valid amount.'
  if (limit && amount > limit.max) return limit.message
  return ''
}

export function validateDate(d: Date | null, attempted: boolean): string {
  if (!d) return attempted ? 'Please select a date.' : ''
  if (daysInPast(d) > MAX_DAYS_IN_PAST) return 'Date cannot be more than 365 days in the past.'
  if (d > new Date()) return 'Date cannot be in the future.'
  return ''
}

export function buyLimit(portfolio: { credit: number } | null): AmountLimit | null {
  return portfolio ? { max: portfolio.credit, message: 'Not enough credit' } : null
}

export function sellLimit(holding: { value: number } | null): AmountLimit | null {
  return holding ? { max: holding.value, message: 'Not enough holdings' } : null
}
