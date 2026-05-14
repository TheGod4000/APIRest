import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import api from './api/http'
import authStore from './store/auth'

async function bootstrap() {
  // Pre-fetch CSRF token so subsequent mutating requests have it
  try {
    await api.get('/csrf')
  } catch (e) {
    // ignore — UI will still mount
  }

  // Try to restore session
  try {
    await authStore.loadMe()
  } catch (e) {
    // ignore
  }

  const app = createApp(App)
  app.use(vuetify)
  app.use(router)
  app.mount('#app')
}

bootstrap()
