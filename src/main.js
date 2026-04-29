import { createApp } from 'vue'
import App from './App.vue'
import './css/style.css'
import { initializeData } from './js/data.js'

// Inicializar datos mock en localStorage si no existen
initializeData()

const app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

app.mount('#app')
