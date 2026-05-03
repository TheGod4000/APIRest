import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#42b883',
          secondary: '#35495e',
          accent: '#7c4dff',
          error: '#ff5252',
          success: '#4caf50',
          warning: '#ffc107',
          info: '#2196f3'
        }
      },
      light: {
        colors: {
          primary: '#42b883',
          secondary: '#35495e',
          accent: '#7c4dff'
        }
      }
    }
  }
})

createApp(App).use(vuetify).mount('#app')
