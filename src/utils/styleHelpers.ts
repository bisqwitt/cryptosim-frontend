export function getChangePerformanceClass(value: number): string {
  const rounded = Number(value.toFixed(2))

  if (rounded > 0) return 'positive-change'
  if (rounded < 0) return 'negative-change'
  return 'neutral-change'
}
