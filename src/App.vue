<script setup lang="ts">
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import AppNavigation from './components/AppNavigation.vue'
import { initPopupService } from './services/popupService.ts'

initPopupService(useToast())
</script>

<template>
  <AppNavigation />

  <main class="page">
    <Toast />
    <RouterView />
  </main>
</template>

<style scoped></style>
