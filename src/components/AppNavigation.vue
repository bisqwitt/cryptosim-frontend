<script setup lang="ts">
import Menubar from 'primevue/menubar'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = [
  {
    label: 'Market',
    icon: 'pi pi-bitcoin',
    command: () => router.push('/crypto/market'),
  },
  {
    label: 'Portfolios',
    icon: 'pi pi-briefcase',
    command: () => router.push('/portfolios'),
  },
]
</script>

<template>
  <div class="nav-shell">
    <div class="nav-inner">
      <Menubar :model="items" class="nav-menu" />
    </div>
  </div>
</template>

<style scoped>
.nav-shell {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 60px;
}

.nav-menu {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.p-menubar) {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.p-menuitem-link) {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

:deep(.p-menuitem-link:hover) {
  color: var(--color-text-primary);
  background: var(--color-surface-raised);
}
</style>
