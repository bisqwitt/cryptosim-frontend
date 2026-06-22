<script setup lang="ts">
import { createPortfolio } from '@/api/portfolioApi'
import { showSuccess } from '@/services/popupService'
import type { Portfolio } from '@/types/Portfolio'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import { ref } from 'vue'

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  created: [portfolio: Portfolio]
}>()

const newPortfolio = ref({
  name: '',
  credit: 500000,
})

const inlineError = ref({
  name: '',
})

function validate(): boolean {
  inlineError.value.name = ''

  if (!newPortfolio.value.name.trim()) {
    inlineError.value.name = 'Name is required.'
    return false
  }

  if (newPortfolio.value.name.trim().length < 2) {
    inlineError.value.name = 'Name must be at least 2 characters.'
    return false
  }

  if (newPortfolio.value.name.trim().length > 25) {
    inlineError.value.name = 'Max length is 25 characters'
    return false
  }

  return true
}

async function createNewPortfolio() {
  if (!validate()) return

  const portfolio = await createPortfolio(newPortfolio.value.name, newPortfolio.value.credit)

  emit('created', portfolio)
  showSuccess('Portfolio created', `"${portfolio.name}" has been created successfully`)
  visible.value = false
  newPortfolio.value = { name: '', credit: 500000 }
  inlineError.value.name = ''
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Create Portfolio"
    :modal="true"
    :style="{ width: '28rem' }"
    class="create-dialog"
  >
    <div class="dialog-body">
      <div class="field">
        <label class="field-label">Portfolio name</label>
        <InputText
          v-model="newPortfolio.name"
          placeholder="e.g. Long-term holds"
          class="w-full"
          :class="{ 'input-error': inlineError.name }"
          @input="inlineError.name = ''"
        />
        <span v-if="inlineError.name" class="field-error">{{ inlineError.name }}</span>
      </div>

      <div class="field">
        <label class="field-label">Starting credit</label>
        <InputNumber
          v-model="newPortfolio.credit"
          mode="decimal"
          class="w-full"
          :min="0"
          disabled
        />
        <span class="field-hint">This is your simulated starting balance.</span>
      </div>
    </div>

    <template #footer>
      <button class="btn-ghost" @click="visible = false">Cancel</button>
      <button class="btn-primary" @click="createNewPortfolio">
        <span class="btn-icon">✓</span>
        Create
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

.field-hint {
  font-size: 0.78rem;
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
  content: '⚠';
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

:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
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
:deep(.p-inputnumber-input:focus) {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

:deep(.input-error .p-inputtext),
:deep(.input-error.p-inputtext) {
  border-color: var(--color-negative);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
}

:deep(.p-inputnumber.p-disabled),
:deep(.p-inputnumber.p-disabled .p-inputnumber-input) {
  opacity: 1;
  cursor: not-allowed;
  background: var(--color-bg);
  border-color: var(--color-border-subtle);
  color: var(--color-text-tertiary);
}
</style>
