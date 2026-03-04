<template>
  <div class="page-container">
    <header class="payment-hero">
      <div class="payment-hero__title">
        <h2>Gestión de Pagos</h2>
        <p>
          <span class="payment-hero__greeting">Hola, {{ userName }}.</span>
          <span class="payment-hero__subtitle">Administra y rastrea todas las transacciones y registros de pagos.</span>
        </p>
      </div>

      <div class="payment-hero__actions">
        <button class="dash-action" type="button" @click="scrollToHistory" aria-label="Ver pagos">
          <span class="dash-action__icon"><i class="fa fa-receipt"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Pagos</span>
            <span class="dash-action__meta">Historial y recibos</span>
          </span>
        </button>

        <a class="dash-action" href="#enrollments" aria-label="Ir a matrículas">
          <span class="dash-action__icon"><i class="fa fa-clipboard-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Matrículas</span>
            <span class="dash-action__meta">Referencias</span>
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

    <!-- Toast Notifications -->
    <div class="toast-container" v-if="toastMsg">
      <div :class="['toast', toastType]">
        <i :class="toastIcon"></i> {{ toastMsg }}
      </div>
    </div>

    <!-- Payment Table Card -->
    <div id="payments-history" class="card-modern">
      <div class="card-header-modern">
        <h4>Historial de Pagos</h4>
        <div class="table-controls-modern">
          <div class="search-input-modern">
            <i class="fa fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar por Referencia, Estudiante o Fecha..."
            >
          </div>

          <button class="btn-primary-modern" type="button" @click="openModal()" aria-label="Registrar pago">
            <i class="fa fa-plus"></i>
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="table-professional table-payments-compact">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Referencia</th>
              <th>Nombre del Estudiante</th>
              <th>Curso</th>
              <th width="12%">Método</th>
              <th class="text-right">Monto</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td>{{ formatDate(payment.paymentDate) }}</td>
              <td>
                <code class="text-primary">{{ payment.reference }}</code>
              </td>
              <td class="font-bold">{{ payment.studentName }}</td>
              <td>{{ payment.courseName }}</td>
              <td>
                <span class="badge-modern" :class="getPaymentMethodBadge(payment.method)" style="display: inline-flex;">
                  {{ getPaymentMethodLabel(payment.method) }}
                </span>
              </td>
              <td class="font-bold text-right text-success">
                <div>
                  ${{ formatMoneyFull(payment.amount) }}
                </div>
              </td>
              <td class="text-center">
                <div class="actions-cell">
                  <button class="btn-action" @click="generateReceipt(payment.id)" title="Generar Recibo">
                    <i class="fa fa-file-pdf"></i>
                  </button>
                  <button class="btn-action" @click="editPayment(payment)" :disabled="!canManagePayments" :title="canManagePayments ? 'Editar Pago' : 'Sin permiso para editar'">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="requestDeletePayment(payment.id)" :class="{ 'btn-disabled': !canManagePayments }" :title="canManagePayments ? 'Eliminar Pago' : 'Sin permiso para eliminar'">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="fa fa-search-minus fa-2x mb-3 d-block"></i>
                No se encontraron pagos que coincidan con los criterios de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Create/Edit -->
    <Modal v-model="isModalOpen" :title="modalTitle" @confirm="savePayment">
      <form ref="formRef" @submit.prevent class="student-form">
        <div class="form-section">
          <div class="section-header">
            <i class="fa fa-receipt"></i>
            <h5>Información del Pago</h5>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Referencia de Matrícula (Estudiante - Curso) *</label>
              <div class="select-wrapper">
                <i class="fa fa-clipboard-list input-icon"></i>
                <select class="form-control" v-model="formData.enrollmentId" required @change="onEnrollmentChange">
                  <option value="" disabled>Seleccionar Matrícula...</option>
                  <option v-for="e in activeEnrollments" :key="e.id" :value="e.id">
                    {{ e.studentName }} - {{ e.courseName }} (Cuota: ${{ formatMoneyFull(e.courseFee) }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Fecha de Pago *</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt input-icon"></i>
                <input type="date" class="form-control" v-model="formData.paymentDate" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Número de Referencia *</label>
              <div class="input-wrapper">
                <i class="fa fa-hashtag input-icon"></i>
                <input type="text" class="form-control" v-model="formData.reference" required placeholder="Ej: REF-001">
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Monto (USD) *</label>
              <div class="input-wrapper">
                <i class="fa fa-dollar-sign input-icon"></i>
                <input type="number" class="form-control" v-model="formData.amount" required min="1" step="0.01">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Método de Pago *</label>
              <div class="select-wrapper">
                <i class="fa fa-credit-card input-icon"></i>
                <select class="form-control" v-model="formData.method" required>
                  <option value="Cash">Efectivo</option>
                  <option value="Card">Tarjeta de Crédito/Débito</option>
                  <option value="Transfer">Transferencia Bancaria</option>
                  <option value="Check">Cheque</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" :showDefaultFooter="false">
      <div class="student-form">
        <div class="form-section" style="margin-bottom: 0;">
          <div class="section-header" style="margin-bottom: 0.75rem;">
            <i class="fa fa-trash"></i>
            <h5>Eliminar pago</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            Esta acción no se puede deshacer.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>
        <button type="button" class="btn-primary-modern" @click="confirmDeletePayment">
          Eliminar
        </button>
      </template>
    </Modal>

    <Modal v-model="showNoPermissionModal" title="Acceso denegado" :showDefaultFooter="false">
      <div class="student-form">
        <div class="form-section" style="margin-bottom: 0;">
          <div class="section-header" style="margin-bottom: 0.75rem;">
            <i class="fa fa-lock"></i>
            <h5>Permisos insuficientes</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            No tienes permiso para eliminar pagos.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-primary-modern" @click="showNoPermissionModal = false">Entendido</button>
      </template>
    </Modal>
  </div>
</template>



<script setup>

import { ref, computed, onMounted } from 'vue'
import { 
  getPaymentsWithDetails, 
  addPayment, 
  updatePayment, 
  deletePayment,
  getEnrollments,
  getStudents,
  getCourses
} from '../js/data.js'
import { validatePayment } from '../js/validations.js'
import { getCurrentUserName, getCurrentUserRole } from '../js/auth.js'
import { generatePaymentReceipt } from '../js/pdf-generator.js'
import Modal from '../components/Modal.vue'

const paymentsList = ref([])
const activeEnrollments = ref([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref(null)

const toastMsg = ref('')
const toastType = ref('')
const toastIcon = ref('')

const userName = ref('')
const userRole = ref('')
const showDeleteModal = ref(false)
const showNoPermissionModal = ref(false)
const pendingDeletePaymentId = ref(null)

const canManagePayments = computed(() => {
  // Caja/Facturación: puede registrar/emitir recibos, pero no editar/eliminar.
  // Administración y Recepción: gestión completa.
  return userRole.value === 'admin' || userRole.value === 'receptionist'
})

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg
  toastType.value = type === 'success' ? 'toast-success' : 'toast-danger'
  toastIcon.value = type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle'
  setTimeout(() => toastMsg.value = '', 3000)
}

const formData = ref({
  id: null,
  enrollmentId: '',
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  method: 'Cash',
  reference: '',
  status: 'Paid'
})

// Helper function for payment method badges
const getPaymentMethodBadge = (method) => {
  const badges = {
    'Cash': 'badge-active',
    'Card': 'badge-pending',
    'Transfer': 'badge-active',
    'Check': 'badge-pending'
  }
  return badges[method] || 'badge-pending'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    Cash: 'Efectivo',
    Card: 'Tarjeta',
    Transfer: 'Transferencia',
    Check: 'Cheque'
  }
  return labels[method] || method
}

// Format Helpers
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

const formatMoneyDual = (usdVal) => {
  const usd = Number(usdVal) || 0
  return `$${formatMoney(usd)}`
}

const formatMoneyFull = (val) => {
  return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d.toLocaleDateString('es-ES')
}

const scrollToHistory = () => {
  const el = document.getElementById('payments-history')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loadData = () => {
  // Cargar lista enriquecida (con nombres)
  paymentsList.value = getPaymentsWithDetails()

  // Preparar select de matrículas
  const enrollments = getEnrollments()
  const students = getStudents()
  const courses = getCourses()

  activeEnrollments.value = enrollments.map(e => {
    const student = students.find(s => s.id === e.studentId) || {}
    const course = courses.find(c => c.id === e.courseId) || {}
    return {
      id: e.id,
      studentName: student.name ? `${student.name} ${student.lastName}` : 'Unknown',
      courseName: course.name || 'Unknown',
      courseFee: course.fee || 0
    }
  })
}

onMounted(() => {
  userName.value = getCurrentUserName() || 'Administrador'
  userRole.value = getCurrentUserRole() || ''
  loadData()
})

// Computed property de búsqueda
const filteredPayments = computed(() => {
  if (!searchQuery.value) return paymentsList.value
  const q = searchQuery.value.toLowerCase()
  return paymentsList.value.filter(p => 
    p.reference?.toLowerCase().includes(q) || 
    p.studentName?.toLowerCase().includes(q) ||
    p.paymentDate?.includes(q)
  )
})

const onEnrollmentChange = () => {
  // Autocompletar el monto basándose en la matrícula seleccionada (si es nuevo pago)
  if (!formData.value.id) {
    const selected = activeEnrollments.value.find(e => e.id === formData.value.enrollmentId)
    if (selected) {
      formData.value.amount = selected.courseFee
      formData.value.reference = `REF-${Math.floor(1000 + Math.random() * 9000)}` 
    }
  }
}

const openModal = (payment = null) => {
  if (payment) {
    modalTitle.value = 'Editar Pago'
    formData.value = { ...payment }
  } else {
    modalTitle.value = 'Nuevo Pago'
    formData.value = { 
      id: null, 
      enrollmentId: '', 
      amount: '', 
      paymentDate: new Date().toISOString().split('T')[0], 
      method: 'Cash',
      reference: '',
      status: 'Paid'
    }
  }
  isModalOpen.value = true
}

const savePayment = () => {
  if (!formRef.value.checkValidity()) {
    formRef.value.reportValidity()
    return
  }

  const data = { ...formData.value }
  data.enrollmentId = Number(data.enrollmentId)
  data.amount = Number(data.amount)

  const validation = validatePayment(data)
  if (!validation.isValid) {
    const msg = (validation.errors || []).includes('Payment reference already exists')
      ? 'El número de referencia ya existe. Debes usar uno diferente.'
      : `Errores de validación:\n${(validation.errors || []).join('\n')}`

    showToast(msg, 'danger')
    return
  }

  if (data.id && !canManagePayments.value) {
    showToast('No tienes permiso para editar pagos', 'danger')
    return
  }

  if (data.id) {
    updatePayment(data.id, data)
    showToast('Pago actualizado exitosamente')
  } else {
    addPayment(data)
    showToast('Pago procesado exitosamente')
  }

  loadData()
  isModalOpen.value = false
}

const generateReceipt = (paymentId) => {
  generatePaymentReceipt(paymentId)
}

const editPayment = (payment) => {
  if (!canManagePayments.value) {
    showToast('No tienes permiso para editar pagos', 'danger')
    return
  }
  openModal(payment)
}

const requestDeletePayment = (id) => {
  if (!canManagePayments.value) {
    showNoPermissionModal.value = true
    return
  }
  pendingDeletePaymentId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeletePaymentId.value = null
}

const confirmDeletePayment = () => {
  if (!pendingDeletePaymentId.value) {
    closeDeleteModal()
    return
  }
  deletePayment(pendingDeletePaymentId.value)
  loadData()
  showToast('Pago eliminado', 'success')
  closeDeleteModal()
}

</script>



<style scoped>
/* 
  No agregamos estilos aquí para dejar que assets/css/style.css mande.
  Solo ajustes preventivos de espaciado.
*/

.table-payments-compact {
  font-size: 0.85rem;
}

.table-payments-compact th,
.table-payments-compact td {
  padding-top: 0.45rem;
  padding-bottom: 0.45rem;
}

.table-payments-compact th {
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
}

.table-payments-compact .badge-modern {
  padding: 0.25rem 0.55rem;
  font-size: 0.78rem;
}

.table-payments-compact .actions-cell {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  gap: clamp(0.1rem, 0.4vw, 0.22rem);
  white-space: nowrap;
}

.table-payments-compact .actions-cell .btn-action {
  width: clamp(20px, 2.1vw, 24px);
  height: clamp(20px, 2.1vw, 24px);
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-payments-compact .actions-cell .btn-action i {
  font-size: clamp(10px, 1.3vw, 12px);
  line-height: 1;
}

.table-payments-compact .actions-cell .btn-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.table-payments-compact .actions-cell .btn-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.table-payments-compact code {
  font-size: 0.8rem;
}

/* Form layout improvements */
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--primary-blue);
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 51, 86, 0.1);
}

/* Toast styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideInRight 0.3s ease-out;
}

.toast-success {
  border-left: 4px solid #10b981;
  color: #059669;
}

.toast-danger {
  border-left: 4px solid #ef4444;
  color: #dc2626;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

