<template>
  <div v-if="currentRoute === '#login' || !isAuthenticated">
    <!-- Vista de Login sin Layout -->
    <LoginView @login-success="handleLoginSuccess" />
  </div>

  <div v-else class="app-layout" :class="{ 'is-admin': isAdmin }">
    <Sidebar :current-route="currentRoute" />
    <Downbar :current-route="currentRoute" @logout="handleLogout" />
    
    <!-- Area principal con Topbar y Contenido -->
    <div id="main-content" class="has-sidebar">
      <Topbar @logout="handleLogout" />

      <!-- Vista Activa -->
      <component :is="activeView" class="page-enter"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { isLoggedIn, logout } from './js/auth.js'

// Componentes Layout
import Topbar from './components/Topbar.vue'
import Downbar from './components/Downbar.vue'
import Sidebar from './components/Sidebar.vue'

// Vistas
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import StudentsView from './views/StudentsView.vue'
import CoursesView from './views/CoursesView.vue'
import EnrollmentsView from './views/EnrollmentsView.vue'
import PaymentsView from './views/PaymentsView.vue'
import ReportsView from './views/ReportsView.vue'
import ExpensesView from './views/ExpensesView.vue'
import TeachersView from './views/TeachersView.vue'

// Estado
const currentRoute = ref(window.location.hash)
const isAuthenticated = ref(isLoggedIn())
const userRole = ref(sessionStorage.getItem('userRole') || '')
const isAdmin = computed(() => userRole.value === 'admin')

// Enrutador simple basado en hash
const routes = {
  '#login': LoginView,
  '#dashboard': DashboardView,
  '#students': StudentsView,
  '#courses': CoursesView,
  '#enrollments': EnrollmentsView,
  '#payments': PaymentsView,
  '#reports': ReportsView,
  '#expenses': ExpensesView,
  '#teachers': TeachersView
}

// Obtener la vista correcta según el hash
const activeView = computed(() => {
  return routes[currentRoute.value] || DashboardView
})

let tableCardsObserver = null
let applyCardsTimer = null

const isMobileViewport = () => {
  return !!(window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
}

const applyMobileTableCardsNow = () => {
  const isMobile = isMobileViewport()

  const tables = document.querySelectorAll('table')
  tables.forEach((table) => {
    if (!isMobile) {
      table.classList.remove('is-card-table')
      return
    }

    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')
    if (!thead || !tbody) return

    const headerCells = Array.from(thead.querySelectorAll('th'))
    if (headerCells.length === 0) return

    const headers = headerCells.map((th) => (th.textContent || '').replace(/\s+/g, ' ').trim())
    if (headers.every((h) => !h)) return

    const bodyRows = Array.from(tbody.querySelectorAll('tr'))
    bodyRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td'))
      cells.forEach((td, idx) => {
        const label = headers[idx] || ''
        if (label) td.setAttribute('data-label', label)
      })
    })

    table.classList.add('is-card-table')
  })
}

const scheduleApplyMobileTableCards = () => {
  if (applyCardsTimer) window.clearTimeout(applyCardsTimer)
  applyCardsTimer = window.setTimeout(async () => {
    await nextTick()
    applyMobileTableCardsNow()
  }, 60)
}

// Escuchar cambios de hash en la URL
onMounted(() => {
  window.addEventListener('hashchange', () => {
    currentRoute.value = window.location.hash
    userRole.value = sessionStorage.getItem('userRole') || ''
    // Proteger las rutas privadas
    if (currentRoute.value !== '#login' && !isLoggedIn()) {
      window.location.hash = '#login'
    }
  })

  // Redirecciones iniciales
  if (!isLoggedIn()) {
    window.location.hash = '#login'
  } else if (!currentRoute.value || currentRoute.value === '#login') {
    window.location.hash = '#dashboard'
  }

  nextTick(() => {
    scheduleApplyMobileTableCards()
  })

  const mainContent = document.getElementById('main-content')
  if (mainContent && window.MutationObserver) {
    tableCardsObserver = new MutationObserver(() => {
      scheduleApplyMobileTableCards()
    })

    tableCardsObserver.observe(mainContent, {
      childList: true,
      subtree: true
    })
  }

  window.addEventListener('resize', scheduleApplyMobileTableCards)
})

watch(activeView, async () => {
  await nextTick()
  scheduleApplyMobileTableCards()
})

onBeforeUnmount(() => {
  if (tableCardsObserver) tableCardsObserver.disconnect()
  tableCardsObserver = null
  if (applyCardsTimer) window.clearTimeout(applyCardsTimer)
  applyCardsTimer = null
  window.removeEventListener('resize', scheduleApplyMobileTableCards)
})

// Callbacks
const handleLoginSuccess = () => {
  isAuthenticated.value = true
  userRole.value = sessionStorage.getItem('userRole') || ''
  window.location.hash = '#dashboard'
}

const handleLogout = () => {
  logout()
  isAuthenticated.value = false
  userRole.value = ''
}
</script>
