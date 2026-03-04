<template>
  <div class="page-container">
    <header class="dashboard-hero">
      <div class="dashboard-hero__title">
        <h2>Panel de Control</h2>
        <p>
          <span class="dashboard-hero__greeting">Hola, {{ userName }}.</span>
          <span class="dashboard-hero__subtitle">Aquí tienes un resumen del sistema y la actividad reciente.</span>
        </p>
      </div>

      <div class="dashboard-hero__actions">
        <a class="dash-action" href="#payments" aria-label="Ir a pagos">
          <span class="dash-action__icon"><i class="fa fa-receipt"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Pagos</span>
            <span class="dash-action__meta">Registrar y revisar</span>
          </span>
        </a>

        <a class="dash-action" href="#students" aria-label="Ir a estudiantes">
          <span class="dash-action__icon"><i class="fa fa-user-graduate"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Estudiantes</span>
            <span class="dash-action__meta">Altas y gestión</span>
          </span>
        </a>

        <a class="dash-action" href="#reports" aria-label="Ir a reportes">
          <span class="dash-action__icon"><i class="fa fa-chart-line"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Reportes</span>
            <span class="dash-action__meta">Finanzas y métricas</span>
          </span>
        </a>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid kpi-grid">
      <div class="stat-card kpi-card">
        <div class="stat-icon icon-blue">
          <i class="fa fa-dollar-sign"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(stats.totalRevenue || 0) }}</span>
          </span>
          <span class="label">Ingresos Totales</span>
        </div>
      </div>

      <div class="stat-card kpi-card">
        <div class="stat-icon icon-green">
          <i class="fa fa-user-graduate"></i>
        </div>
        <div class="stat-info">
          <span class="value">{{ stats.totalStudents || 0 }}</span>
          <span class="label">Estudiantes Activos</span>
        </div>
      </div>

      <div class="stat-card kpi-card">
        <div class="stat-icon icon-yellow">
          <i class="fa fa-book"></i>
        </div>
        <div class="stat-info">
          <span class="value">{{ stats.totalCourses || 0 }}</span>
          <span class="label">Cursos Ofrecidos</span>
        </div>
      </div>

      <div class="stat-card kpi-card">
        <div class="stat-icon icon-orange">
          <i class="fa fa-chalkboard-teacher"></i>
        </div>
        <div class="stat-info">
          <span class="value">{{ stats.totalTeachers || 0 }}</span>
          <span class="label">Docentes</span>
        </div>
      </div>
    </div>

    <div class="card-modern">
      <div class="card-header-modern">
        <h4>Matrículas activas por curso</h4>
        <a class="btn-action" href="#courses" title="Ver cursos" aria-label="Ver cursos">
          <i class="fa fa-external-link-alt"></i>
        </a>
      </div>

      <div class="table-wrapper">
        <table class="table-professional">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Código</th>
              <th class="text-center">Alumnos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in topEnrollmentsByCourse" :key="row.courseId">
              <td class="font-semi">{{ row.courseName }}</td>
              <td><code class="text-primary">{{ row.courseCode }}</code></td>
              <td class="text-center font-bold">{{ row.studentsCount }}</td>
            </tr>
            <tr v-if="topEnrollmentsByCourse.length === 0">
              <td colspan="3" class="text-center py-5 text-muted">
                No hay matrículas activas registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Activity Card -->
    <div class="card-modern">
      <div class="card-header-modern">
        <h4>Actividad Reciente de Pagos</h4>
        <a class="btn-action" href="#payments" title="Ver historial de pagos" aria-label="Ver historial de pagos">
          <i class="fa fa-external-link-alt"></i>
        </a>
      </div>
      
      <div class="table-wrapper">
        <table class="table-professional">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Referencia</th>
              <th>Nombre del Estudiante</th>
              <th class="text-right">Monto</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in recentPayments" :key="payment.id">
              <td class="font-semi">{{ formatDate(payment.paymentDate) }}</td>
              <td>
                <code class="text-primary">{{ payment.reference || 'N/A' }}</code>
              </td>
              <td class="font-bold text-blue">{{ payment.studentName }}</td>
              <td class="font-bold text-right text-success">${{ formatMoney(payment.amount) }}</td>
              <td class="text-center">
                <span class="badge-modern" :class="payment.status === 'Paid' ? 'badge-active' : 'badge-pending'">
                  {{ payment.status === 'Paid' ? 'Pagado' : 'Pendiente' }}
                </span>
              </td>
            </tr>
            <tr v-if="recentPayments.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="fa fa-search-minus fa-2x mb-3 d-block"></i>
                No se encontraron transacciones recientes en los registros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats, getPaymentsWithDetails, getEnrollmentsByCourseSummary } from '../js/data.js'
import { getCurrentUserName } from '../js/auth.js'
import { getActiveTeachersCount } from '../js/teachers.js'

const stats = ref({})
const recentPayments = ref([])
const userName = ref('')
const topEnrollmentsByCourse = ref([])

onMounted(() => {
  userName.value = getCurrentUserName() || 'Administrador'

  // Obtener conteos desde data.js
  stats.value = getDashboardStats()

  stats.value.totalTeachers = getActiveTeachersCount()

  topEnrollmentsByCourse.value = getEnrollmentsByCourseSummary().slice(0, 8)

  // Obtener todos los pagos y ordenarlos
  const allPayments = getPaymentsWithDetails()
  // Ordenar descendente por id (simulando fecha más reciente)
  allPayments.sort((a, b) => b.id - a.id)
  recentPayments.value = allPayments
})

// Format helpers
const formatMoney = (val) => {
  const num = Number(val)
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

const formatMoneyFull = (val) => {
  return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleString()
  const d = new Date(dateStr)
  return d.toLocaleString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* 
  No agregamos estilos aquí para dejar que assets/css/style.css mande.
  Solo ajustes preventivos de espaciado.
*/
.container-fluid {
  padding: 0;
}
h3 {
  font-family: "Raleway", sans-serif;
  color: #444444;
}
</style>

