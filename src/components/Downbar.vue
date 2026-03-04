<template>
  <div class="downbar-container">
    <div class="downbar" role="navigation" aria-label="Navegación">
      <a href="#dashboard" class="downbar-item" :class="{ active: currentRoute === '#dashboard' }" @click="navigate">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
          </svg>
        </span>
        <span class="label">Inicio</span>
      </a>

      <a v-if="hasPermission('students')" href="#students" class="downbar-item" :class="{ active: currentRoute === '#students' }" @click="navigate">
        <span class="nav-icon"><i class="fa fa-users"></i></span>
        <span class="label">Estudiantes</span>
      </a>

      <a v-if="hasPermission('payments')" href="#payments" class="downbar-item" :class="{ active: currentRoute === '#payments' }" @click="navigate">
        <span class="nav-icon"><i class="fa fa-receipt"></i></span>
        <span class="label">Pagos</span>
      </a>

      <button class="downbar-item menu" type="button" :class="{ active: isMenuOpen }" @click="toggleMenu" aria-label="Abrir menú">
        <span class="nav-icon">
          <i class="fa fa-bars"></i>
        </span>
        <span class="label">Menú</span>
      </button>
    </div>

    <div class="overlay" :class="{ show: isMenuOpen }" @click="closeMenu"></div>

    <aside class="sheet" :class="{ open: isMenuOpen }" role="dialog" aria-modal="true" aria-label="Menú">
      <div class="sheet-header">
        <div class="brand">
          <img class="brand-logo" src="/assets/uploads/favicon.png" alt="+code Logo">
          <div class="brand-text">
            <div class="brand-title">Academia +code</div>
            <div class="brand-subtitle">Navegación</div>
          </div>
        </div>
        <button class="icon-btn" type="button" @click="closeMenu" aria-label="Cerrar menú">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <nav class="sheet-nav">
        <div class="section">
          <div class="section-title">Principal</div>
          <a href="#dashboard" class="nav-item" :class="{ active: currentRoute === '#dashboard' }" @click="navigate">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
              </svg>
            </span>
            <span>Panel de Control</span>
          </a>
        </div>

        <div class="section">
          <div class="section-title">Registros</div>
          <a v-if="hasPermission('students')" href="#students" class="nav-item" :class="{ active: currentRoute === '#students' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-users"></i></span>
            <span>Estudiantes</span>
          </a>
          <a v-if="hasPermission('courses')" href="#courses" class="nav-item" :class="{ active: currentRoute === '#courses' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-scroll"></i></span>
            <span>Cursos</span>
          </a>
        </div>

        <div class="section">
          <div class="section-title">Gestión</div>
          <a v-if="hasPermission('enrollments')" href="#enrollments" class="nav-item" :class="{ active: currentRoute === '#enrollments' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-address-book"></i></span>
            <span>Matrículas</span>
          </a>
          <a v-if="hasPermission('payments')" href="#payments" class="nav-item" :class="{ active: currentRoute === '#payments' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-receipt"></i></span>
            <span>Pagos</span>
          </a>
          <a v-if="hasPermission('expenses')" href="#expenses" class="nav-item" :class="{ active: currentRoute === '#expenses' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-money-bill-wave"></i></span>
            <span>Gastos</span>
          </a>
          <a v-if="hasPermission('teachers')" href="#teachers" class="nav-item" :class="{ active: currentRoute === '#teachers' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-chalkboard-teacher"></i></span>
            <span>Docentes</span>
          </a>
        </div>

        <div class="section">
          <div class="section-title">Reportes</div>
          <a v-if="hasPermission('reports')" href="#reports" class="nav-item" :class="{ active: currentRoute === '#reports' }" @click="navigate">
            <span class="nav-icon"><i class="fa fa-chart-bar"></i></span>
            <span>Reportes Financieros</span>
          </a>
        </div>
      </nav>

      <div class="sheet-footer">
        <button class="logout" type="button" @click="handleLogout">
          <span class="nav-icon"><i class="fa fa-sign-out-alt"></i></span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { logout, hasPermission } from '../js/auth.js'

const props = defineProps({
  currentRoute: {
    type: String,
    default: '#dashboard'
  }
})

const emit = defineEmits(['logout'])

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const navigate = () => {
  closeMenu()
}

const handleLogout = () => {
  logout()
  emit('logout')
  closeMenu()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.downbar-container {
  position: relative;
  z-index: 1000;
}

.downbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 12px;
  border-radius: 0;
  background: rgba(11, 18, 32, 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -16px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
}

.downbar-item {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 14px;
  transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
  cursor: pointer;
}

.downbar-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.downbar-item.active {
  color: rgba(255, 255, 255, 0.98);
  background: rgba(255, 255, 255, 0.06);
}

.label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1;
}

.nav-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-icon i,
.nav-icon svg {
  color: rgba(255, 255, 255, 0.78);
}

.nav-icon svg {
  width: 18px;
  height: 18px;
  display: block;
}

.downbar-item.active .nav-icon {
  background: rgba(255, 206, 0, 0.12);
  border-color: rgba(255, 206, 0, 0.22);
}

.downbar-item.active .nav-icon i,
.downbar-item.active .nav-icon svg {
  color: #FFCE00;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 998;
}

.overlay.show {
  opacity: 1;
  visibility: visible;
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 72px;
  max-height: calc(100vh - 72px);
  border-radius: 18px 18px 0 0;
  background: linear-gradient(180deg, #0b1220 0%, #0a1020 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.45);
  transform: translateY(18px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sheet.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.sheet-header {
  padding: 14px 14px 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 12px;
}

.brand-title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  letter-spacing: -0.2px;
  font-size: 0.95rem;
  line-height: 1.1;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
  font-size: 0.78rem;
  margin-top: 2px;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.14);
}

.sheet-nav {
  padding: 10px 12px 12px 12px;
  overflow: auto;
}

.section-title {
  margin: 12px 6px 8px 6px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
}

.nav-item {
  background-color: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.86);
  text-decoration: none;
  font-weight: 650;
  position: relative;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  border-color: rgba(255, 206, 0, 0.25);
}

.nav-item.active .nav-icon {
  background: rgba(255, 206, 0, 0.12);
  border-color: rgba(255, 206, 0, 0.25);
}

.nav-item.active .nav-icon i,
.nav-item.active .nav-icon svg {
  color: #FFCE00;
}

.sheet-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(220, 53, 69, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 750;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.logout:hover {
  background: rgba(220, 53, 69, 0.20);
  border-color: rgba(220, 53, 69, 0.28);
  transform: translateY(-1px);
}

@media (min-width: 769px) {
  .downbar-container {
    display: none;
  }
}
</style>