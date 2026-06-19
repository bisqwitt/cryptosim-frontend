import Aura from '@primeuix/themes/aura'
import { PrimeVue } from '@primevue/core'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'
import { ToastService } from 'primevue'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(ToastService)

app.mount('#app')
