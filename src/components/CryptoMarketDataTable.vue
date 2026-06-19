<script setup lang="ts">
import { getCryptoOverview } from '@/api/cryptoApi'
import type { CryptoMarketDataDto } from '@/types/CryptoMarketDataDto'
import { formatCurrency, formatName, formatPercentage } from '@/utils/formatters'
import { getChangePerformanceClass } from '@/utils/styleHelpers'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { onMounted, ref } from 'vue'

const marketData = ref<CryptoMarketDataDto[]>([])

onMounted(async () => {
  marketData.value = await getCryptoOverview()
})
</script>

<template>
  <div class="table-card">
    <div class="table-card-header">
      <div class="title-group">
        <h1>Market</h1>
        <span class="live-badge">
          <span class="live-dot"></span>
          Live
        </span>
      </div>
      <p class="subtitle">Real-time prices across top crypto assets</p>
    </div>

    <DataTable :value="marketData" stripedRows tableStyle="min-width: 50rem" class="market-table">
      <Column field="coin" header="Crypto" sortable>
        <template #body="{ data }">
          <span class="asset-name">{{ formatName(data.name, data.symbol) }}</span>
        </template>
      </Column>

      <Column field="currentPrice" header="Price" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric">{{ formatCurrency(data.current_price) }}</span>
        </template>
      </Column>

      <Column field="priceChangePercentage24h" header="24h %" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span
            class="change-pill"
            :class="getChangePerformanceClass(data.price_change_percentage_24h)"
          >
            {{ formatPercentage(data.price_change_percentage_24h) }}
          </span>
        </template>
      </Column>

      <Column field="priceChangePercentage7d" header="7d %" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span
            class="change-pill"
            :class="getChangePerformanceClass(data.price_change_percentage_7d_in_currency)"
          >
            {{ formatPercentage(data.price_change_percentage_7d_in_currency) }}
          </span>
        </template>
      </Column>

      <Column field="marketCap" header="Market Cap" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric numeric-secondary">{{ formatCurrency(data.market_cap) }}</span>
        </template>
      </Column>

      <Column field="volume24h" header="Volume 24h" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric numeric-secondary">{{ formatCurrency(data.total_volume) }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-top: 2rem;
  overflow: hidden;
}

.table-card-header {
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-group h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-positive);
  background: var(--color-positive-bg);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-positive);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.asset-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.numeric {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.numeric-secondary {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.change-pill {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

:deep(.positive-change) {
  color: var(--color-positive);
  background: var(--color-positive-bg);
}

:deep(.negative-change) {
  color: var(--color-negative);
  background: var(--color-negative-bg);
}

:deep(.neutral-change) {
  color: var(--color-text-secondary);
  background: var(--color-surface-raised);
}

/* PrimeVue table overrides */
.market-table :deep(.p-datatable-table) {
  background: transparent;
}

.market-table :deep(.p-datatable-thead > tr > th) {
  background: var(--color-surface);
  color: var(--color-text-tertiary);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  padding: 0.85rem 1.75rem;
}

.market-table :deep(.p-datatable-tbody > tr) {
  background: var(--color-surface);
  transition: background 0.12s ease;
}

.market-table :deep(.p-datatable-tbody > tr.p-datatable-striped-row) {
  background: var(--color-surface-raised);
}

.market-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--color-accent-soft) !important;
}

.market-table :deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 0.9rem 1.75rem;
  font-size: 0.875rem;
}

.market-table :deep(.col-numeric) {
  text-align: left;
}
</style>
