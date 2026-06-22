export function getChangePerformanceClass(value: number | null): string {
  if (value == null) return 'neutral-change'

  const rounded = Number(value.toFixed(2))
  if (rounded > 0) return 'positive-change'
  if (rounded < 0) return 'negative-change'
  return 'neutral-change'
}
