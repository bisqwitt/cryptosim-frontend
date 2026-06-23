<script setup lang="ts">
import { getCryptoPrice } from '@/api/cryptoApi'
import { getAllPortfolios, getHoldingOfPosition } from '@/api/portfolioApi'
import { createTransaction } from '@/api/transactionApi'
import type { HoldingOfPosition } from '@/types/HoldingOfPosition'
import { formatCrypto, formatDate, formatPrice, formatUsd } from '@/utils/formatters'
import {
  validateAmount,
  validateDate,
  validatePortfolio,
  type AmountLimit,
} from '@/utils/validations'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber, { type InputNumberInputEvent } from 'primevue/inputnumber'
import Select from 'primevue/select'
import { computed, onMounted, ref, watch } from 'vue'

type TransactionType = 'BUY' | 'SELL'

type PortfolioResponse = {
  id: number
  name: string
  credit: number
}

const visible = defineModel<boolean>('visible')
const type = defineModel<TransactionType>('type')

const props = defineProps<{
  cryptoId: string
}>()

const emit = defineEmits<{
  created: [transaction: unknown]
}>()

const portfolios = ref<PortfolioResponse[]>([])
const portfolioId = ref<number | null>(null)
const amountUsd = ref<number | null>(null)
const date = ref<Date>(new Date())
const submitAttempted = ref(false)

onMounted(async () => {
  portfolios.value = await getAllPortfolios()
})

const selectedPortfolio = computed(
  () => portfolios.value.find((p) => p.id === portfolioId.value) ?? null,
)

function isToday(d: Date): boolean {
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

const portfolioError = computed(() => validatePortfolio(portfolioId.value, submitAttempted.value))
const dateError = computed(() => validateDate(date.value, submitAttempted.value))

/* ------------------------------------------------------------------ *
 * Price - fetched while the dialog is open and the date is valid.     *
 * Token discards stale responses. Today -> live, past -> snapshot.    *
 * ------------------------------------------------------------------ */
const priceAtDate = ref<number | null>(null)
const priceLoading = ref(false)
let priceRequestId = 0

watch(
  [() => props.cryptoId, () => date.value, () => visible.value, () => dateError.value] as const,
  async () => {
    if (!visible.value || dateError.value) {
      priceAtDate.value = null
      return
    }
    const requestId = ++priceRequestId
    priceLoading.value = true
    try {
      const data = await getCryptoPrice(
        props.cryptoId,
        isToday(date.value) ? undefined : date.value,
      )
      if (requestId === priceRequestId) priceAtDate.value = data.price
    } catch {
      if (requestId === priceRequestId) priceAtDate.value = null
    } finally {
      if (requestId === priceRequestId) priceLoading.value = false
    }
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * Holding - only needed for SELL: how much of this crypto the chosen  *
 * portfolio holds at the selected date, and its USD value. Same token *
 * pattern as the price.                                               *
 * ------------------------------------------------------------------ */
const holding = ref<HoldingOfPosition | null>(null)
const holdingLoading = ref(false)
let holdingRequestId = 0

watch(
  [
    () => type.value,
    () => portfolioId.value,
    () => props.cryptoId,
    () => date.value,
    () => visible.value,
    () => dateError.value,
  ] as const,
  async () => {
    if (!visible.value || type.value !== 'SELL' || !portfolioId.value || dateError.value) {
      holding.value = null
      return
    }
    const requestId = ++holdingRequestId
    holdingLoading.value = true
    try {
      const data = await getHoldingOfPosition(portfolioId.value, props.cryptoId, date.value)
      if (requestId === holdingRequestId) holding.value = data
    } catch {
      if (requestId === holdingRequestId) holding.value = null
    } finally {
      if (requestId === holdingRequestId) holdingLoading.value = false
    }
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * Amount validation - limit depends on transaction type.             *
 * ------------------------------------------------------------------ */
const amountLimit = computed<AmountLimit | null>(() => {
  if (type.value === 'SELL') {
    return holding.value ? { max: holding.value.value, message: 'Not enough holdings' } : null
  }
  return selectedPortfolio.value
    ? { max: selectedPortfolio.value.credit, message: 'Not enough credit' }
    : null
})

const amountError = computed(() =>
  validateAmount(amountUsd.value, submitAttempted.value, amountLimit.value),
)

const cryptoAmount = computed(() => {
  if (!amountUsd.value || !priceAtDate.value) return null
  return amountUsd.value / priceAtDate.value
})

function onAmountInput(event: InputNumberInputEvent) {
  const parsed =
    typeof event.value === 'number' ? event.value : parseFloat(String(event.value ?? ''))
  amountUsd.value = isNaN(parsed) ? null : parsed
}

async function submit() {
  submitAttempted.value = true
  if (portfolioError.value || amountError.value || dateError.value) return

  const transaction = createTransaction(
    portfolioId.value!,
    props.cryptoId,
    amountUsd.value!,
    date.value,
    type.value!,
  )

  emit('created', transaction)
  visible.value = false
  portfolioId.value = null
  amountUsd.value = null
  date.value = new Date()
  submitAttempted.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="`${type === 'BUY' ? 'Buy' : 'Sell'} ${cryptoId}`"
    :modal="true"
    :style="{ width: '28rem' }"
    class="transaction-dialog"
  >
    <div class="dialog-body">
      <div class="field">
        <label class="field-label">Portfolio</label>
        <Select
          v-model="portfolioId"
          :options="portfolios"
          optionLabel="name"
          optionValue="id"
          placeholder="Select portfolio"
          class="w-full"
          :class="{ 'input-error': portfolioError }"
        />
        <span v-if="portfolioError" class="field-error">{{ portfolioError }}</span>
        <span v-else-if="type === 'SELL' && holding" class="field-hint">
          <span class="field-hint-label">Holdings value</span>
          <span class="field-hint-value">{{ formatUsd(holding.value) }}</span>
        </span>
        <span v-else-if="type === 'BUY' && selectedPortfolio" class="field-hint">
          <span class="field-hint-label">Available credit</span>
          <span class="field-hint-value">{{ formatUsd(selectedPortfolio.credit) }}</span>
        </span>
      </div>

      <div class="field">
        <label class="field-label">Date</label>
        <DatePicker v-model="date" class="w-full" :class="{ 'input-error': dateError }" />
        <span v-if="dateError" class="field-error">{{ dateError }}</span>
        <span v-else-if="priceLoading" class="field-hint field-hint--loading">
          <span class="field-hint-skeleton" />
        </span>
        <span v-else-if="priceAtDate" class="field-hint">
          <span class="field-hint-label">Price on</span>
          <span class="field-hint-label">{{ formatDate(date) }}</span>
          <span class="field-hint-value">{{ formatPrice(priceAtDate) }}</span>
        </span>
      </div>

      <div class="field">
        <label class="field-label">Amount (USD)</label>
        <InputNumber
          v-model="amountUsd"
          mode="currency"
          currency="USD"
          locale="en-US"
          class="w-full"
          :class="{ 'input-error': amountError }"
          @input="onAmountInput"
        />
        <span v-if="amountError" class="field-error">{{ amountError }}</span>
        <span v-else-if="cryptoAmount" class="field-hint field-hint--accent">
          <span class="field-hint-value">&#8776; {{ formatCrypto(cryptoAmount) }}</span>
          <span class="field-hint-unit">{{ cryptoId }}</span>
        </span>
      </div>
    </div>

    <template #footer>
      <button class="btn-ghost" @click="visible = false">Cancel</button>
      <button class="btn-primary" @click="submit">
        <span class="btn-icon">&#10003;</span>
        {{ type === 'BUY' ? 'Buy' : 'Sell' }}
      </button>
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-body {
  padding: 0.5rem 0 0.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.field-error {
  font-size: 0.78rem;
  color: var(--color-negative);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.field-error::before {
  content: '\26A0';
  font-size: 0.7rem;
}

/* PrimeVue overrides */
:deep(.p-dialog) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

:deep(.p-dialog-header) {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 1.25rem 1.5rem;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
}

:deep(.p-dialog-content) {
  background: var(--color-surface);
  padding: 1.25rem 1.5rem;
}

:deep(.p-dialog-footer) {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-subtle);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Inputs */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-datepicker-input) {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.6rem 0.85rem;
  width: 100%;
  transition: border-color 0.15s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-datepicker-input:focus) {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

/* Select */
:deep(.p-select) {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  transition: border-color 0.15s ease;
}

:deep(.p-select:not(.p-disabled):hover),
:deep(.p-select.p-focus) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

:deep(.p-select .p-select-label) {
  color: var(--color-text-primary);
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
}

:deep(.p-select-overlay) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

:deep(.p-select-option:hover) {
  background: var(--color-surface-raised);
}

/* Error states */
:deep(.input-error .p-inputtext),
:deep(.input-error.p-inputtext),
:deep(.input-error .p-inputnumber-input),
:deep(.input-error .p-datepicker-input) {
  border-color: var(--color-negative);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
}

:deep(.input-error.p-select),
:deep(.input-error .p-select) {
  border-color: var(--color-negative);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
}

/* Hints read as annotations, NOT inputs:
   no fill, no full border, flat and muted. */
.field-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  max-width: 100%;
  padding: 0.15rem 0; /* no horizontal padding box */
  background: transparent; /* key: no input-like fill */
  border: none; /* key: no input-like border */
  font-size: 0.76rem;
  line-height: 1.2;
}

.field-hint-label {
  color: var(--color-text-tertiary);
}

.field-hint-value {
  color: var(--color-text-secondary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.field-hint--accent .field-hint-value {
  color: var(--color-text-secondary);
}

.field-hint--accent .field-hint-unit {
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.76rem;
  letter-spacing: normal;
  opacity: 1;
}

.field-hint--loading {
  padding: 0.15rem 0;
}

.field-hint-skeleton {
  display: block;
  width: 10rem;
  height: 0.9rem;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-surface-raised) 25%,
    var(--color-border-subtle) 37%,
    var(--color-surface-raised) 63%
  );
  background-size: 200% 100%;
  animation: hint-shimmer 1.4s ease-in-out infinite;
}

@keyframes hint-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
