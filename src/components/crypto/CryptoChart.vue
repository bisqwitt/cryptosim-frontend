<script setup lang="ts">
import { getCrypto, getHistoricalCryptoData } from '@/api/cryptoApi'
import type { CryptoHistoricalData } from '@/types/CryptoHistoricalData'
import type { CryptoHistoricalDataPoint } from '@/types/CryptoHistoricalDataPoint'
import type { CryptoMarketData } from '@/types/CryptoMarketData'
import Chart from 'primevue/chart'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const cryptoData = ref<CryptoMarketData>({
  id: '',
  name: '',
  symbol: '',
  currentPrice: null,
  priceChangePercentage24h: null,
  priceChangePercentage7d: null,
  marketCap: null,
  totalVolume: null,
})
const historicalData = ref<CryptoHistoricalData>({
  prices: [],
  total_volumes: [],
  market_caps: [],
})

onMounted(async () => {
  const id = route.params.id as string
  cryptoData.value = await getCrypto(id)
  historicalData.value = await getHistoricalCryptoData(id)
})

const rangeLabels: Record<RangeKey, string> = {
  '7D': 'Last 7 Days',
  '1M': 'Last Month',
  '3M': 'Last 3 Months',
  '1Y': 'Last Year',
}

const rangeLabel = computed(() => rangeLabels[selectedRange.value])

type RangeKey = '7D' | '1M' | '3M' | '1Y'
type MetricKey = 'price' | 'volume'

type LineSegmentContext = {
  p0: { parsed: { y: number } }
  p1: { parsed: { y: number } }
}

const selectedRange = ref<RangeKey>('1M')
const selectedMetric = ref<MetricKey>('price')

const ranges: RangeKey[] = ['7D', '1M', '3M', '1Y']

const metrics: { key: MetricKey; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'volume', label: 'Volume' },
]

const rangeDays: Record<RangeKey, number> = {
  '7D': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
}

const metricConfig = computed<{
  label: string
  data: CryptoHistoricalDataPoint[]
}>(() => {
  switch (selectedMetric.value) {
    case 'volume':
      return {
        label: 'Total Volumes',
        data: historicalData.value.total_volumes,
      }
    default:
      return {
        label: 'Prices',
        data: historicalData.value.prices,
      }
  }
})

const filteredData = computed(() => {
  const data = metricConfig.value.data

  if (selectedRange.value === '1Y') {
    return data
  }

  const latestTimestamp = data.at(-1)?.timestamp ?? Date.now()
  const cutoff = latestTimestamp - rangeDays[selectedRange.value] * 24 * 60 * 60 * 1000

  return data.filter((point) => point.timestamp >= cutoff)
})

const chartData = computed(() => ({
  labels: filteredData.value.map((point) => new Date(point.timestamp).toLocaleDateString()),
  datasets: [
    {
      label: metricConfig.value.label,
      data: filteredData.value.map((point) => point.value),
      tension: 0,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 5,
      segment: {
        borderColor: (context: LineSegmentContext) => {
          const previous = context.p0.parsed.y
          const current = context.p1.parsed.y

          return current >= previous ? '#16a34a' : '#dc2626'
        },
      },
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) =>
          `$${context.parsed.y.toLocaleString(undefined, {
            notation: selectedMetric.value === 'price' ? 'standard' : 'compact',
            maximumFractionDigits: 2,
          })}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 8,
        maxRotation: 0,
        minRotation: 0,
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        callback: (value: string | number) =>
          `$${Number(value).toLocaleString(undefined, {
            notation: selectedMetric.value === 'price' ? 'standard' : 'compact',
            maximumFractionDigits: 2,
          })}`,
      },
    },
  },
}
</script>

<template>
  <section class="coin-chart">
    <div class="chart-header">
      <div>
        <h2>Coin Chart</h2>
        <p>{{ cryptoData.name }} {{ metricConfig.label }} · {{ rangeLabel }}</p>
      </div>

      <div class="button-groups">
        <div class="metric-buttons">
          <button
            v-for="metric in metrics"
            :key="metric.key"
            type="button"
            :class="{ active: selectedMetric === metric.key }"
            @click="selectedMetric = metric.key"
          >
            {{ metric.label }}
          </button>
        </div>

        <div class="range-buttons">
          <button
            v-for="range in ranges"
            :key="range"
            type="button"
            :class="{ active: selectedRange === range }"
            @click="selectedRange = range"
          >
            {{ range }}
          </button>
        </div>
      </div>
    </div>

    <Chart type="line" :data="chartData" :options="chartOptions" style="height: 650px" />
  </section>
</template>

<style scoped>
.coin-chart {
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chart-header h2 {
  margin: 0;
}

.chart-header p {
  margin: 0.25rem 0 0;
  color: #9ca3af;
}

.button-groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.range-buttons,
.metric-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.range-buttons button,
.metric-buttons button {
  border: 1px solid #334155;
  background: transparent;
  color: #cbd5e1;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.range-buttons button.active,
.metric-buttons button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}
</style>
