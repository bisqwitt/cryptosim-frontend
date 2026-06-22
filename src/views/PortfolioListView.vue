<script setup lang="ts">
import { getAllPortfolios } from '@/api/portfolioApi'
import CreatePortfolioDialog from '@/components/portfolio/CreatePortfolioDialog.vue'
import PortfolioCard from '@/components/portfolio/PortfolioCard.vue'
import type { Portfolio } from '@/types/Portfolio'
import { onMounted, ref } from 'vue'

const portfolios = ref<Portfolio[]>([])
const createDialogVisible = ref(false)

onMounted(async () => {
  portfolios.value = await getAllPortfolios()
})

function addPortfolio(portfolio: Portfolio) {
  portfolios.value.push(portfolio)
}
</script>

<template>
  <div class="portfolios-view">
    <div class="page-header">
      <div>
        <h1>Portfolios</h1>
        <p class="subtitle">Manage and track your crypto portfolios</p>
      </div>

      <button class="btn-primary" @click="createDialogVisible = true">
        <span class="btn-icon">+</span>
        New Portfolio
      </button>
    </div>

    <div v-if="portfolios.length === 0" class="empty-state">
      <div class="empty-icon">◈</div>
      <h2>No portfolios yet</h2>
      <p>Create your first portfolio to start tracking crypto positions.</p>

      <button class="btn-primary" @click="createDialogVisible = true">
        <span class="btn-icon">+</span>
        New Portfolio
      </button>
    </div>

    <section v-else class="portfolio-grid">
      <PortfolioCard v-for="portfolio in portfolios" :key="portfolio.id" :portfolio="portfolio" />
    </section>

    <CreatePortfolioDialog v-model:visible="createDialogVisible" @created="addPortfolio" />
  </div>
</template>

<style scoped>
.portfolios-view {
  padding: 2rem 0;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5rem 2rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--color-accent);
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.empty-state h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1rem;
  max-width: 280px;
}

/* Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
</style>
