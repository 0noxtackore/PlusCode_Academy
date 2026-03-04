import { createApp } from 'vue'
import App from './App.vue'
import './css/style.css'
import { initializeData } from './js/data.js'

// Inicializar datos mock en localStorage si no existen
initializeData()

createApp(App).mount('#app')
