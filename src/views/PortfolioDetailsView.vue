<script setup lang="ts">
import { deletePortfolio, getPortfolioDetails, updatePortfolio } from '@/api/portfolioApi'
import type { PortfolioDetails } from '@/types/PortfolioDetails'
import {
  formatCrypto,
  formatDate,
  formatName,
  formatPercentage,
  formatUsd,
} from '@/utils/formatters'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  portfolioId: number
}>()

const router = useRouter()

const portfolioDetails = ref<PortfolioDetails | null>(null)
const loading = ref(false)

// Welche Positionen sind aufgeklappt (per cryptoId).
const expanded = ref(new Set<string>())

function toggle(cryptoId: string) {
  if (expanded.value.has(cryptoId)) expanded.value.delete(cryptoId)
  else expanded.value.add(cryptoId)
}

function isExpanded(cryptoId: string): boolean {
  return expanded.value.has(cryptoId)
}

onMounted(async () => {
  loading.value = true
  try {
    portfolioDetails.value = await getPortfolioDetails(props.portfolioId)
  } finally {
    loading.value = false
  }
})

// USD mit Vorzeichen (+/-) - für Gewinn/Verlust-Beträge.
function formatSignedUsd(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatUsd(Math.abs(value))}`
}

/* ------------------------------------------------------------------ *
 * Unrealisierter Gewinn/Verlust (Unrealized PnL)                      *
 *                                                                     *
 * Betrag = aktueller Wert - Kostenbasis.                              *
 * Prozent = Betrag / Kostenbasis.                                     *
 * Kostenbasis = durchschnittlicher Kaufpreis (avg cost) x Bestand.    *
 * Durchschnittspreis = Summe BUY-USD / Summe BUY-Crypto.              *
 * Hinweis: ohne Gebühren, vor Steuern; "unrealized" = Buchgewinn.     *
 * ------------------------------------------------------------------ */
type TxLike = { type: 'BUY' | 'SELL'; amountUsd: number; amountCrypto: number }
type HoldingLike = { holding: number; value: number }

function avgBuyPrice(transactions: TxLike[]): number | null {
  let usd = 0
  let crypto = 0
  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      usd += tx.amountUsd
      crypto += tx.amountCrypto
    }
  }
  return crypto > 0 ? usd / crypto : null
}

function costBasis(holding: HoldingLike, transactions: TxLike[]): number | null {
  const avg = avgBuyPrice(transactions)
  if (avg === null) return null
  return avg * holding.holding
}

function unrealizedAbs(holding: HoldingLike, transactions: TxLike[]): number | null {
  const basis = costBasis(holding, transactions)
  if (basis === null || basis <= 0) return null
  return holding.value - basis
}

function unrealizedPct(holding: HoldingLike, transactions: TxLike[]): number | null {
  const basis = costBasis(holding, transactions)
  if (basis === null || basis <= 0) return null
  return ((holding.value - basis) / basis) * 100
}

// Aktueller Wert aller Positionen.
const totalValue = computed(() => {
  if (!portfolioDetails.value) return 0
  return portfolioDetails.value.positions.reduce((sum, p) => sum + p.holding.value, 0)
})

// Gesamte Kostenbasis = Summe der Positions-Kostenbasen.
const totalCostBasis = computed(() => {
  if (!portfolioDetails.value) return 0
  return portfolioDetails.value.positions.reduce(
    (sum, p) => sum + (costBasis(p.holding, p.transactions) ?? 0),
    0,
  )
})

// Unrealisierter Gewinn/Verlust des gesamten Portfolios (Betrag + %).
const totalGainAbs = computed(() => totalValue.value - totalCostBasis.value)
const totalGainPct = computed(() => {
  const basis = totalCostBasis.value
  if (basis <= 0) return null
  return (totalGainAbs.value / basis) * 100
})

// Positionen nach Wert sortiert, jeweils mit vorberechnetem PnL (Betrag + %).
const sortedPositions = computed(() => {
  if (!portfolioDetails.value) return []
  return [...portfolioDetails.value.positions]
    .sort((a, b) => b.holding.value - a.holding.value)
    .map((p) => ({
      ...p,
      pnlAbs: unrealizedAbs(p.holding, p.transactions),
      pnlPct: unrealizedPct(p.holding, p.transactions),
    }))
})

/* ------------------------------------------------------------------ *
 * Name bearbeiten                                                     *
 * ------------------------------------------------------------------ */
const isEditing = ref(false)
const editedName = ref('')
const saving = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

async function startEdit() {
  if (!portfolioDetails.value) return
  editedName.value = portfolioDetails.value.portfolio.name
  isEditing.value = true
  await nextTick()
  nameInput.value?.focus()
  nameInput.value?.select()
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!portfolioDetails.value) return
  const newName = editedName.value.trim()
  // Leer oder unverändert -> einfach schliessen, kein Request.
  if (!newName || newName === portfolioDetails.value.portfolio.name) {
    isEditing.value = false
    return
  }
  saving.value = true
  try {
    const updated = await updatePortfolio(props.portfolioId, newName)
    portfolioDetails.value.portfolio.name = updated.name
    isEditing.value = false
  } finally {
    saving.value = false
  }
}

/* ------------------------------------------------------------------ *
 * Portfolio löschen                                                  *
 * ------------------------------------------------------------------ */
const deleteDialogVisible = ref(false)
const deleting = ref(false)

async function confirmDelete() {
  deleting.value = true
  try {
    await deletePortfolio(props.portfolioId)
    // Zurück zur Liste. Pfad/Name ggf. an deine Route anpassen.
    router.push('/portfolios')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="portfolio-view">
    <div v-if="loading" class="state">Lädt …</div>

    <div v-else-if="!portfolioDetails" class="state">Portfolio nicht gefunden.</div>

    <template v-else>
      <!-- Kopf: Name + Werte -->
      <header class="portfolio-header">
        <div class="portfolio-title-row">
          <template v-if="!isEditing">
            <h1 class="portfolio-name">{{ portfolioDetails.portfolio.name }}</h1>
            <div class="header-actions">
              <button class="header-btn" @click="startEdit">Bearbeiten</button>
              <button class="header-btn header-btn--danger" @click="deleteDialogVisible = true">
                Löschen
              </button>
            </div>
          </template>

          <template v-else>
            <input
              ref="nameInput"
              v-model="editedName"
              class="name-input"
              :disabled="saving"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
            />
            <div class="header-actions">
              <button class="header-btn" :disabled="saving" @click="cancelEdit">Abbrechen</button>
              <button class="header-btn header-btn--primary" :disabled="saving" @click="saveEdit">
                {{ saving ? 'Speichert …' : 'Speichern' }}
              </button>
            </div>
          </template>
        </div>

        <div class="portfolio-stats">
          <div class="stat">
            <span class="stat-label">Unrealized PnL</span>
            <template v-if="totalGainPct !== null">
              <span
                class="stat-value"
                :class="totalGainAbs >= 0 ? 'stat-value--up' : 'stat-value--down'"
              >
                {{ formatSignedUsd(totalGainAbs) }}
              </span>
              <span
                class="stat-subvalue"
                :class="totalGainAbs >= 0 ? 'stat-value--up' : 'stat-value--down'"
              >
                {{ formatPercentage(totalGainPct) }}
              </span>
            </template>
            <span v-else class="stat-value">—</span>
          </div>

          <div class="stat">
            <span class="stat-label">Holdings value</span>
            <span class="stat-value">{{ formatUsd(totalValue) }}</span>
          </div>

          <div class="stat">
            <span class="stat-label">Available Credit</span>
            <span class="stat-value">{{ formatUsd(portfolioDetails.portfolio.credit) }}</span>
          </div>
        </div>
      </header>

      <!-- Positionen -->
      <section class="positions">
        <h2 class="section-title">Positionen</h2>

        <p v-if="sortedPositions.length === 0" class="state">Noch keine Positionen.</p>

        <div v-for="position in sortedPositions" :key="position.cryptoId" class="position">
          <button
            class="position-row"
            :aria-expanded="isExpanded(position.cryptoId)"
            @click="toggle(position.cryptoId)"
          >
            <span class="chevron" :class="{ 'chevron--open': isExpanded(position.cryptoId) }"
              >&#9656;</span
            >
            <span class="position-name">{{ formatName(position.name, position.symbol) }}</span>
            <span class="position-holding">{{ formatCrypto(position.holding.holding) }}</span>
            <span
              v-if="position.pnlPct !== null"
              class="position-change"
              :class="position.pnlPct >= 0 ? 'position-change--up' : 'position-change--down'"
            >
              {{ formatSignedUsd(position.pnlAbs ?? 0) }} ({{ formatPercentage(position.pnlPct) }})
            </span>
            <span v-else class="position-change position-change--muted">—</span>
            <span class="position-value">{{ formatUsd(position.holding.value) }}</span>
          </button>

          <!-- Aufgeklappt: alle Transaktionen dieses Crypto-Typs -->
          <div v-if="isExpanded(position.cryptoId)" class="transactions">
            <div v-for="tx in position.transactions" :key="tx.id" class="transaction">
              <span class="tx-type" :class="`tx-type--${tx.type.toLowerCase()}`">
                {{ tx.type === 'BUY' ? 'Kauf' : 'Verkauf' }}
              </span>
              <span class="tx-date">{{ formatDate(new Date(tx.date)) }}</span>
              <span class="tx-crypto"
                >{{ formatCrypto(tx.amountCrypto) }} {{ position.symbol.toUpperCase() }}</span
              >
              <span class="tx-amount">{{ formatUsd(tx.amountUsd) }}</span>
            </div>

            <p v-if="position.transactions.length === 0" class="state state--inset">
              Keine Transaktionen.
            </p>
          </div>
        </div>
      </section>
    </template>

    <!-- Lösch-Bestätigung -->
    <div v-if="deleteDialogVisible" class="modal-overlay" @click.self="deleteDialogVisible = false">
      <div class="modal">
        <h3 class="modal-title">Portfolio löschen?</h3>
        <p class="modal-text">
          Möchtest du
          <strong>{{ portfolioDetails?.portfolio.name }}</strong>
          wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div class="modal-actions">
          <button class="header-btn" :disabled="deleting" @click="deleteDialogVisible = false">
            Abbrechen
          </button>
          <button class="header-btn header-btn--danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Löscht …' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portfolio-view {
  max-width: 56rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.state {
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  padding: 1.5rem 0;
}

.state--inset {
  padding: 0.75rem 1rem;
}

/* Kopf */
.portfolio-header {
  margin-bottom: 2rem;
}

.portfolio-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.portfolio-name {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.name-input {
  flex: 1;
  min-width: 12rem;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.3rem 0.6rem;
  font-family: inherit;
}

.name-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.header-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.header-btn:hover:not(:disabled) {
  background: var(--color-surface-raised);
}

.header-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.header-btn--primary {
  color: #fff;
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.header-btn--primary:hover:not(:disabled) {
  background: var(--color-accent);
  filter: brightness(1.1);
}

.header-btn--danger {
  color: var(--color-negative);
  border-color: var(--color-negative);
}

.header-btn--danger:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.1);
}

.portfolio-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-width: 12rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.stat-value--up {
  color: var(--color-positive, #4ade80);
}

.stat-value--down {
  color: var(--color-negative);
}

.stat-subvalue {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Positionen */
.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
  margin: 0 0 0.75rem;
}

.position {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  margin-bottom: 0.6rem;
  overflow: hidden;
}

.position-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
}

.position-row:hover {
  background: var(--color-surface-raised);
}

.chevron {
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
  transition: transform 0.15s ease;
}

.chevron--open {
  transform: rotate(90deg);
}

.position-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.position-holding {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.position-change {
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  min-width: 9rem;
  white-space: nowrap;
}

.position-change--up {
  color: var(--color-positive, #4ade80);
}

.position-change--down {
  color: var(--color-negative);
}

.position-change--muted {
  color: var(--color-text-tertiary);
}

.position-value {
  font-weight: 600;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Transaktionen (aufgeklappt) */
.transactions {
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface-raised);
}

.transaction {
  display: grid;
  grid-template-columns: 5rem auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 1.1rem 0.65rem 2.6rem;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.transaction:last-child {
  border-bottom: none;
}

.tx-type {
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tx-type--buy {
  color: var(--color-positive, #4ade80);
}

.tx-type--sell {
  color: var(--color-negative);
}

.tx-date {
  color: var(--color-text-tertiary);
}

.tx-crypto {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.tx-amount {
  text-align: right;
  font-weight: 600;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Lösch-Bestätigung (eigenes, leichtgewichtiges Modal) */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 24rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.6rem;
}

.modal-text {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 1.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
