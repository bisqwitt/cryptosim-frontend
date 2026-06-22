<script setup lang="ts">
import type { Portfolio } from '@/types/Portfolio'
import { formatCurrency } from '@/utils/formatters'

defineProps<{
  portfolio: Portfolio
}>()
</script>

<template>
  <RouterLink :to="`/portfolios/${portfolio.id}`" class="portfolio-card">
    <div class="card-top">
      <span class="card-icon">◈</span>
      <span class="card-arrow">→</span>
    </div>

    <h2 class="card-name">{{ portfolio.name }}</h2>

    <div class="card-bottom">
      <p class="label">Available credit</p>
      <p class="credit">{{ formatCurrency(portfolio.credit) }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.portfolio-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
  min-height: 160px;
}

.portfolio-card:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-raised);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.card-icon {
  font-size: 1.1rem;
  color: var(--color-accent);
  opacity: 0.8;
}

.card-arrow {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

.portfolio-card:hover .card-arrow {
  color: var(--color-accent);
  transform: translateX(3px);
}

.card-name {
  margin: 0 0 auto;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  padding-bottom: 1.25rem;
}

.card-bottom {
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 1rem;
}

.label {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
}

.credit {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
</style>
