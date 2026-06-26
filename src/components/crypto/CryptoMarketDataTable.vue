<script setup lang="ts">
import { getCryptoOverview } from '@/api/cryptoApi'
import type { CryptoMarketData } from '@/types/CryptoMarketData'
import { formatCurrency, formatName, formatPercentage } from '@/utils/formatters'
import { getChangePerformanceClass } from '@/utils/styleHelpers'
import Column from 'primevue/column'
import type { DataTableRowClickEvent } from 'primevue/datatable'
import DataTable from 'primevue/datatable'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CreateTransactionDialog from '../transaction/CreateTransactionDialog.vue'

const marketData = ref<CryptoMarketData[]>([])
const lastUpdated = ref<Date | null>(null)
const now = ref(Date.now())

onMounted(async () => {
  marketData.value = await getCryptoOverview()
  lastUpdated.value = new Date()
})

// Tick every 10s so the relative label stays current without re-fetching.
const ticker = setInterval(() => (now.value = Date.now()), 1_000)
onUnmounted(() => clearInterval(ticker))

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const seconds = Math.floor((now.value - lastUpdated.value.getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds} sec ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
})

const router = useRouter()

function openChart(event: DataTableRowClickEvent) {
  const target = event.originalEvent.target as HTMLElement
  if (target.closest('.action-btn')) return

  router.push({
    name: 'crypto-chart',
    params: {
      id: (event.data as CryptoMarketData).id,
    },
  })
}

const transactionVisible = ref(false)
const transactionType = ref<'BUY' | 'SELL'>('BUY')
const selectedCryptoId = ref<string>('')

function openTransaction(type: 'BUY' | 'SELL', cryptoId: string) {
  transactionType.value = type
  selectedCryptoId.value = cryptoId
  transactionVisible.value = true
}
</script>

<template>
  <div class="table-card">
    <div class="table-card-header">
      <div class="title-group">
        <h1>Market</h1>
        <span v-if="lastUpdated" class="update-badge">
          <span class="status-dot"></span>
          Updated {{ lastUpdatedLabel }}
        </span>
      </div>
      <p class="subtitle">Real-time prices across top crypto assets</p>
    </div>

    <DataTable
      :value="marketData"
      stripedRows
      tableStyle="min-width: 50rem"
      class="market-table"
      @row-click="openChart"
    >
      <Column field="coin" header="Crypto" sortable>
        <template #body="{ data }">
          <span class="asset-name">{{ formatName(data.name, data.symbol) }}</span>
        </template>
      </Column>

      <Column field="currentPrice" header="Price" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric">{{ formatCurrency(data.currentPrice) }}</span>
        </template>
      </Column>

      <Column field="priceChangePercentage24h" header="24h %" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span
            class="change-pill"
            :class="getChangePerformanceClass(data.priceChangePercentage24h)"
          >
            {{ formatPercentage(data.priceChangePercentage24h) }}
          </span>
        </template>
      </Column>

      <Column field="priceChangePercentage7d" header="7d %" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span
            class="change-pill"
            :class="getChangePerformanceClass(data.priceChangePercentage7d)"
          >
            {{ formatPercentage(data.priceChangePercentage7d) }}
          </span>
        </template>
      </Column>

      <Column field="marketCap" header="Market Cap" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric numeric-secondary">{{ formatCurrency(data.marketCap) }}</span>
        </template>
      </Column>

      <Column field="volume24h" header="Volume 24h" sortable bodyClass="col-numeric">
        <template #body="{ data }">
          <span class="numeric numeric-secondary">{{ formatCurrency(data.totalVolume) }}</span>
        </template>
      </Column>

      <Column header="" bodyClass="col-actions">
        <template #body="{ data }">
          <div class="row-actions">
            <button class="action-btn action-buy" @click.stop="openTransaction('BUY', data.id)">
              ↑ Buy
            </button>
            <button class="action-btn action-sell" @click.stop="openTransaction('SELL', data.id)">
              ↓ Sell
            </button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <CreateTransactionDialog
    v-model:visible="transactionVisible"
    v-model:type="transactionType"
    :cryptoId="selectedCryptoId"
    @created="() => {}"
  />
</template>

<style scoped>
.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
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

.update-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
  background: var(--color-surface-raised);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-positive);
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
  cursor: pointer;
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

.market-table :deep(.col-actions) {
  text-align: right;
  width: 1%;
  white-space: nowrap;
  padding-right: 1.75rem;
}

.market-table :deep(th:last-child),
.market-table :deep(td:last-child) {
  width: 0;
  padding-left: 0;
  padding-right: 1rem;
}

.row-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.market-table :deep(.p-datatable-tbody > tr:hover) .row-actions {
  opacity: 1;
}

.action-btn {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.action-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.action-buy {
  color: var(--color-positive);
  background: var(--color-positive-bg);
  border-color: transparent;
}

.action-sell {
  color: var(--color-negative);
  background: var(--color-negative-bg);
  border-color: transparent;
}
</style>
