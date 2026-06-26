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
      path: '/crypto/market',
      name: 'market',
      component: () => import('../views/CryptoMarketDataView.vue'),
    },
    {
      path: '/crypto/:id/chart',
      name: 'crypto-chart',
      component: () => import('../views/CryptoHistoricalDataView.vue'),
    },
    {
      path: '/portfolios',
      name: 'portfolios',
      component: () => import('../views/PortfolioListView.vue'),
    },
    {
      path: '/portfolios/:id',
      name: 'portfolio',
      component: () => import('../views/PortfolioDetailsView.vue'),
      props: (route) => ({ portfolioId: Number(route.params.id) }),
    },
  ],
})

export default router
