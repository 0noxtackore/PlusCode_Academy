<template>
  <nav id="sidebar">
    <div class="sidebar-header">
      <img src="/assets/uploads/pluscode-logo.png" alt="+code Logo">
    </div>

    <div class="sidebar-nav">
      <div class="sidebar-section-title">Principal</div>
      
      <a href="#dashboard" class="nav-item" :class="{ active: currentRoute === '#dashboard' }">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
          </svg>
        </span>
        <span>Panel de Control</span>
      </a>

      <div class="sidebar-section-title" v-if="showRegistros">Registros</div>
      
      <a href="#students" class="nav-item" :class="{ active: currentRoute === '#students' }" v-if="hasPermission('students')">
        <span class="nav-icon"><i class="fa fa-users"></i></span>
        <span>Estudiantes</span>
      </a>

      <a href="#courses" class="nav-item" :class="{ active: currentRoute === '#courses' }" v-if="hasPermission('courses')">
        <span class="nav-icon"><i class="fa fa-scroll"></i></span>
        <span>Cursos</span>
      </a>

      <div class="sidebar-section-title" v-if="showGestion">Gestión</div>

      <a href="#enrollments" class="nav-item" :class="{ active: currentRoute === '#enrollments' }" v-if="hasPermission('enrollments')">
        <span class="nav-icon"><i class="fa fa-address-book"></i></span>
        <span>Matrículas</span>
      </a>

      <a href="#payments" class="nav-item" :class="{ active: currentRoute === '#payments' }" v-if="hasPermission('payments')">
        <span class="nav-icon"><i class="fa fa-receipt"></i></span>
        <span>Pagos</span>
      </a>

      <a href="#expenses" class="nav-item" :class="{ active: currentRoute === '#expenses' }" v-if="hasPermission('expenses')">
        <span class="nav-icon"><i class="fa fa-money-bill-wave"></i></span>
        <span>Gastos</span>
      </a>

      <a href="#teachers" class="nav-item" :class="{ active: currentRoute === '#teachers' }" v-if="hasPermission('teachers')">
        <span class="nav-icon"><i class="fa fa-chalkboard-teacher"></i></span>
        <span>Docentes</span>
      </a>

      <div class="sidebar-section-title" v-if="showReportes">Reportes</div>

      <a href="#reports" class="nav-item" :class="{ active: currentRoute === '#reports' }" v-if="hasPermission('reports')">
        <span class="nav-icon"><i class="fa fa-chart-bar"></i></span>
        <span>Reportes Financieros</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { hasPermission } from '../js/auth.js'

defineProps({
  currentRoute: {
    type: String,
    required: true
  }
})

const showRegistros = computed(() => {
  return hasPermission('students') || hasPermission('courses')
})

const showGestion = computed(() => {
  return (
    hasPermission('enrollments') ||
    hasPermission('payments') ||
    hasPermission('expenses') ||
    hasPermission('teachers')
  )
})

const showReportes = computed(() => {
  return hasPermission('reports')
})
</script>
