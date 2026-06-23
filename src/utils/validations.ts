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
