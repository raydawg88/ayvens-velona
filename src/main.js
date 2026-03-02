import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './theme/main.css'
import 'perfect-scrollbar/css/perfect-scrollbar.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Wait for router to complete initial navigation before mounting
// This prevents layout flash when refreshing on different routes
router.isReady().then(() => {
  app.mount('#app')
})

// Register Service Worker for caching and offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
