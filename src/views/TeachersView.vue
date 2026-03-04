<template>
  <div class="page-container">
    <header class="teacher-hero">
      <div class="teacher-hero__title">
        <h2>Gestión de Docentes</h2>
        <p>
          <span class="teacher-hero__greeting">Hola, {{ userName }}.</span>
          <span class="teacher-hero__subtitle">Administra el personal docente y su información académica.</span>
        </p>
      </div>

      <div class="teacher-hero__actions">
        <button class="dash-action" type="button" @click="scrollToRegistry" aria-label="Ver docentes">
          <span class="dash-action__icon"><i class="fa fa-users"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Docentes</span>
            <span class="dash-action__meta">Registro y estados</span>
          </span>
        </button>

        <a class="dash-action" href="#courses" aria-label="Ir a cursos">
          <span class="dash-action__icon"><i class="fa fa-book"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Cursos</span>
            <span class="dash-action__meta">Oferta académica</span>
          </span>
        </a>

        <a class="dash-action" href="#reports" aria-label="Ir a reportes">
          <span class="dash-action__icon"><i class="fa fa-chart-line"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Reportes</span>
            <span class="dash-action__meta">Nómina y métricas</span>
          </span>
        </a>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <i class="fa fa-money-check-alt"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(currentMonthPayroll) }}</span>
          </span>
          <span class="label">Nómina Mensual</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-green">
          <i class="fa fa-hand-holding-usd"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(averageHourlyRate) }}</span>
          </span>
          <span class="label">Tarifa por Hora Promedio</span>
        </div>
      </div>
    </div>

    <!-- Teacher Table Card -->
    <div id="teachers-registry" class="card-modern">
      <div class="card-header-modern">
        <h4>Registro de Docentes</h4>
        <div class="table-controls-modern">
          <div class="search-input-modern">
            <i class="fa fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, ID o especialidad..." />
          </div>

          <button
            class="btn-primary-modern"
            type="button"
            @click="openModal()"
            v-if="hasPermission('teachers')"
            aria-label="Registrar profesor"
          >
            <i class="fa fa-plus"></i>
            <span>Registrar Docente</span>
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="table-professional table-teachers-compact">
          <thead>
            <tr>
              <th width="20%">Identificación</th>
              <th width="25%">Nombre Completo</th>
              <th width="15%">Especialidad Académica</th>
              <th width="10%">Tarifa por Hora</th>
              <th width="10%" class="text-center">Horas/Sem</th>
              <th width="10%">Estado</th>
              <th width="10%">Fecha de Contratación</th>
              <th width="10%" class="text-center" v-if="hasPermission('teachers')">Operaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in filteredTeachers" :key="teacher.id">
              <td class="font-semi">{{ teacher.idNumber }}</td>
              <td class="font-bold text-blue">{{ teacher.name }} {{ teacher.lastName }}</td>
              <td>{{ teacher.specialty }}</td>
              <td class="font-semi text-success">${{ formatMoneyFull(teacher.hourlyRate) }}</td>
              <td class="text-center font-semi">{{ teacher.weeklyHours ?? 0 }}</td>
              <td>
                <span class="badge-modern" :class="teacher.status === 'Active' ? 'badge-active' : 'badge-inactive'">
                  {{ teacher.status === 'Active' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td><small>{{ formatDate(teacher.hireDate) }}</small></td>
              <td class="text-center" v-if="hasPermission('teachers')">
                <div class="actions-cell">
                  <button class="btn-action" type="button" @click="viewPayroll(teacher.id)" title="Nómina / Historial">
                    <i class="fa fa-money-check-alt"></i>
                  </button>
                  <button class="btn-action" @click="openModal(teacher)" title="Editar docente">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="handleDeleteTeacher(teacher.id)" title="Eliminar docente">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTeachers.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="fa fa-user-slash fa-2x mb-3 d-block"></i>
                No se encontraron miembros del personal docente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <Modal v-model="isModalOpen" :title="modalTitle" @confirm="saveTeacher">
      <form ref="formRef" @submit.prevent class="student-form">
        <div class="form-section">
          <div class="section-header">
            <i class="fa fa-chalkboard-teacher"></i>
            <h5>Información del Docente</h5>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <div class="input-wrapper">
                <i class="fa fa-user input-icon"></i>
                <input type="text" class="form-control" v-model="formData.name" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Apellido *</label>
              <div class="input-wrapper">
                <i class="fa fa-user input-icon"></i>
                <input type="text" class="form-control" v-model="formData.lastName" required>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Número de Cédula *</label>
              <div class="input-wrapper">
                <i class="fa fa-id-badge input-icon"></i>
                <input type="text" class="form-control" v-model="formData.idNumber" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Especialidad *</label>
              <div class="input-wrapper">
                <i class="fa fa-book input-icon"></i>
                <input type="text" class="form-control" v-model="formData.specialty" required>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Tarifa por Hora ($) *</label>
              <div class="input-wrapper">
                <i class="fa fa-dollar-sign input-icon"></i>
                <input type="number" class="form-control" v-model="formData.hourlyRate" required min="0" step="0.01">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Horas por semana *</label>
              <div class="select-wrapper">
                <i class="fa fa-clock input-icon"></i>
                <input type="number" class="form-control" v-model="formData.weeklyHours" required min="0" step="1">
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Estado</label>
              <div class="select-wrapper">
                <i class="fa fa-toggle-on input-icon"></i>
                <select class="form-control" v-model="formData.status">
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Fecha de Contratación *</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt input-icon"></i>
                <input type="date" class="form-control" v-model="formData.hireDate" required>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>

    <!-- Payroll Modal -->
    <Modal
      v-model="showPayrollModal"
      :title="`Historial de nómina - ${selectedTeacher?.name || ''} ${selectedTeacher?.lastName || ''}`"
      :show-default-footer="false"
    >
      <div class="mb-3" v-if="hasPermission('teachers')">
        <div class="form-row" style="margin-bottom: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Período (YYYY-MM) *</label>
            <div class="input-wrapper">
              <i class="fa fa-calendar-alt input-icon"></i>
              <input type="month" class="form-control" v-model="payrollForm.period" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Horas trabajadas (mes) *</label>
            <div class="input-wrapper">
              <i class="fa fa-clock input-icon"></i>
              <input type="number" class="form-control" v-model="payrollForm.hoursWorked" required min="1" step="1">
            </div>
          </div>
        </div>

        <div class="form-row" style="margin-bottom: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Bonos (USD)</label>
            <div class="input-wrapper">
              <i class="fa fa-plus-circle input-icon"></i>
              <input type="number" class="form-control" v-model="payrollForm.bonuses" min="0" step="0.01">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Deducciones (USD)</label>
            <div class="input-wrapper">
              <i class="fa fa-minus-circle input-icon"></i>
              <input type="number" class="form-control" v-model="payrollForm.deductions" min="0" step="0.01">
            </div>
          </div>
        </div>

        <div class="form-row" style="margin-bottom: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Referencia</label>
            <div class="input-wrapper">
              <i class="fa fa-hashtag input-icon"></i>
              <input type="text" class="form-control" v-model="payrollForm.reference" placeholder="Ej: SAL-0003">
            </div>
          </div>
        </div>

        <button class="btn-primary-modern" type="button" @click="recordPayroll()">
          <i class="fa fa-save"></i>
          <span>Registrar pago de nómina</span>
        </button>
      </div>

      <div class="table-wrapper">
        <table class="table-professional">
          <thead>
            <tr>
              <th>Período</th>
              <th class="text-center">Horas</th>
              <th class="text-right">Sueldo base</th>
              <th class="text-right">Bonos</th>
              <th class="text-right">Deducciones</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Fecha de pago</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in teacherPayments" :key="payment.id">
              <td>{{ payment.period }}</td>
              <td class="text-center">{{ payment.hoursWorked }}</td>
              <td class="text-right">${{ formatMoneyFull(payment.baseSalary) }}</td>
              <td class="text-right">${{ formatMoneyFull(payment.bonuses) }}</td>
              <td class="text-right">${{ formatMoneyFull(payment.deductions) }}</td>
              <td class="text-right font-bold">${{ formatMoneyFull(payment.totalSalary) }}</td>
              <td>
                <span class="badge" :class="payment.status === 'Paid' ? 'badge-success' : 'badge-warning'">
                  {{ payment.status === 'Paid' ? 'Pagado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <div>{{ formatDate(payment.paymentDate) }}</div>
                <button class="btn-action" type="button" style="margin-top: 6px;" @click="printTeacherReceipt(payment)" title="Imprimir comprobante">
                  <i class="fa fa-print"></i>
                </button>
              </td>
            </tr>
            <tr v-if="teacherPayments.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                No hay registros de nómina.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closePayrollModal()">Cerrar</button>
      </template>
    </Modal>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" :showDefaultFooter="false">
      <div class="student-form">
        <div class="form-section" style="margin-bottom: 0;">
          <div class="section-header" style="margin-bottom: 0.75rem;">
            <i class="fa fa-trash"></i>
            <h5>Eliminar docente</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            Esta acción no se puede deshacer.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>
        <button type="button" class="btn-primary-modern" @click="confirmDeleteTeacher">Eliminar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getTeachers, 
  addTeacher, 
  updateTeacher, 
  deleteTeacher,
  getTeacherPaymentHistory,
  recordTeacherPayroll,
  getActiveTeachersCount,
  getMonthlyPayrollTotal
} from '../js/teachers.js'
import { hasPermission, getCurrentUserName } from '../js/auth.js'
import { generateTeacherPaymentReceipt } from '../js/pdf-generator.js'
import Modal from '../components/Modal.vue'

// Estado
const teachers = ref([])
const isModalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref(null)

const userName = ref('')
const showPayrollModal = ref(false)
const selectedTeacher = ref(null)
const teacherPayments = ref([])
const searchQuery = ref('')

const showDeleteModal = ref(false)
const pendingDeleteTeacherId = ref(null)

// Formulario
const formData = ref({
  id: null,
  idNumber: '',
  name: '',
  lastName: '',
  specialty: '',
  hourlyRate: 0,
  weeklyHours: 0,
  status: 'Active',
  hireDate: new Date().toISOString().split('T')[0]
})

const payrollForm = ref({
  period: new Date().toISOString().slice(0, 7),
  hoursWorked: 40,
  bonuses: 0,
  deductions: 0,
  reference: ''
})

// Toast
const toastMsg = ref('')
const toastType = ref('success')
const toastIcon = ref('fa-check')

// Computed
const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value
  
  const query = searchQuery.value.toLowerCase()
  return teachers.value.filter(teacher => 
    teacher.name.toLowerCase().includes(query) ||
    teacher.lastName.toLowerCase().includes(query) ||
    teacher.idNumber.toLowerCase().includes(query) ||
    teacher.specialty.toLowerCase().includes(query)
  )
})

const activeTeachersCount = computed(() => {
  return teachers.value.filter(t => t.status === 'Active').length
})

const currentMonthPayroll = computed(() => {
  const currentPeriod = new Date().toISOString().slice(0, 7)
  return getMonthlyPayrollTotal(currentPeriod)
})

const averageHourlyRate = computed(() => {
  const activeTeachers = teachers.value.filter(t => t.status === 'Active')
  if (activeTeachers.length === 0) return 0
  const totalRate = activeTeachers.reduce((sum, t) => sum + t.hourlyRate, 0)
  return totalRate / activeTeachers.length
})

// Métodos
const loadData = () => {
  teachers.value = getTeachers()
}

const scrollToRegistry = () => {
  const el = document.getElementById('teachers-registry')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const openModal = (teacher = null) => {
  isModalOpen.value = true
  modalTitle.value = teacher ? 'Editar docente' : 'Registrar profesor'
  formData.value = teacher
    ? { ...teacher }
    : {
        id: null,
        idNumber: '',
        name: '',
        lastName: '',
        specialty: '',
        hourlyRate: 0,
        weeklyHours: 0,
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0]
      }
}

const saveTeacher = () => {
  try {
    if (formRef.value && !formRef.value.checkValidity()) {
      formRef.value.reportValidity()
      return
    }

    formData.value.hourlyRate = Number(formData.value.hourlyRate)
    formData.value.weeklyHours = Number(formData.value.weeklyHours)

    if (formData.value.id) {
      updateTeacher(formData.value.id, formData.value)
      showToast('Docente actualizado correctamente', 'success')
    } else {
      addTeacher(formData.value)
      showToast('Docente registrado correctamente', 'success')
    }

    isModalOpen.value = false
    loadData()
  } catch (error) {
    showToast('Error al guardar el docente', 'error')
  }
}

const handleDeleteTeacher = (id) => {
  pendingDeleteTeacherId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeleteTeacherId.value = null
}

const confirmDeleteTeacher = () => {
  if (!pendingDeleteTeacherId.value) {
    closeDeleteModal()
    return
  }

  try {
    deleteTeacher(pendingDeleteTeacherId.value)
    showToast('Docente eliminado correctamente', 'success')
    loadData()
  } catch (error) {
    showToast('Error al eliminar el docente', 'error')
  }

  closeDeleteModal()
}

const viewPayroll = (teacherId) => {
  selectedTeacher.value = teachers.value.find(t => t.id === teacherId)
  teacherPayments.value = getTeacherPaymentHistory(teacherId)
  payrollForm.value = {
    period: new Date().toISOString().slice(0, 7),
    hoursWorked: Number(selectedTeacher.value?.weeklyHours || 0) * 4 || 40,
    bonuses: 0,
    deductions: 0,
    reference: ''
  }
  showPayrollModal.value = true
}

const closePayrollModal = () => {
  showPayrollModal.value = false
  selectedTeacher.value = null
  teacherPayments.value = []
}

const recordPayroll = () => {
  if (!selectedTeacher.value) return
  if (!hasPermission('teachers')) {
    showToast('Sin permiso para registrar nómina', 'error')
    return
  }

  try {
    recordTeacherPayroll({
      teacherId: selectedTeacher.value.id,
      period: payrollForm.value.period,
      hoursWorked: payrollForm.value.hoursWorked,
      bonuses: payrollForm.value.bonuses,
      deductions: payrollForm.value.deductions,
      reference: payrollForm.value.reference
    })

    showToast('Pago de nómina registrado correctamente', 'success')
    teacherPayments.value = getTeacherPaymentHistory(selectedTeacher.value.id)
  } catch (error) {
    showToast(error?.message || 'Error al registrar nómina', 'error')
  }
}

const printTeacherReceipt = (payment) => {
  generateTeacherPaymentReceipt(payment?.id)
}

const showToast = (message, type = 'success') => {
  toastMsg.value = message
  toastType.value = type
  toastIcon.value = type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'
  setTimeout(() => {
    toastMsg.value = ''
  }, 3000)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

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

onMounted(() => {
  userName.value = getCurrentUserName() || 'Administrador'
  loadData()
})
</script>
