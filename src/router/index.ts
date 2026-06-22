import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/CryptoMarketDataView.vue'),
    },
    {
      path: '/market',
      name: 'market',
      component: () => import('../views/CryptoMarketDataView.vue'),
    },
    {
      path: '/:id/chart',
      name: 'crypto-chart',
      component: () => import('../views/CryptoHistoricalDataView.vue'),
    },
  ],
})

export default router
