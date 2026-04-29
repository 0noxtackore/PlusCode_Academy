<template>
  <div class="page-container">
    <header class="course-hero">
      <div class="course-hero__title">
        <h2>Gestión de Matrículas</h2>
        <p>
          <span class="course-hero__greeting">Hola, {{ userName }}.</span>
          <span class="course-hero__subtitle">Administra las inscripciones de estudiantes en cursos académicos.</span>
        </p>
      </div>

      <div class="course-hero__actions">
        <button class="dash-action" type="button" @click="scrollToRegistry" aria-label="Ver matrículas">
          <span class="dash-action__icon"><i class="fa fa-clipboard-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Matrículas</span>
            <span class="dash-action__meta">Registro y estados</span>
          </span>
        </button>

        <a class="dash-action" href="#students" aria-label="Ir a estudiantes">
          <span class="dash-action__icon"><i class="fa fa-user-graduate"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Estudiantes</span>
            <span class="dash-action__meta">Gestión general</span>
          </span>
        </a>

        <a class="dash-action" href="#courses" aria-label="Ir a cursos">
          <span class="dash-action__icon"><i class="fa fa-book"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Cursos</span>
            <span class="dash-action__meta">Catálogo y cuotas</span>
          </span>
        </a>
      </div>
    </header>

    <!-- Enrollment Table Card -->
    <div id="enrollments-registry" class="card-modern">
      <div class="card-header-modern">
        <h4>Registro de Matrículas</h4>
        <div class="table-controls-modern">
          <div class="search-input-modern">
            <i class="fa fa-filter"></i>
            <input type="text" v-model="searchQuery" placeholder="Filtrar por nombre de estudiante, curso o código..." />
          </div>

          <button class="btn-primary-modern" type="button" @click="openModal()" aria-label="Registrar matrícula">
            <i class="fa fa-plus"></i>
            <span>Registrar Matrícula</span>
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="table-professional">
          <thead>
            <tr>
              <th width="20%">Fecha de Matrícula</th>
              <th width="25%">Nombre del Estudiante</th>
              <th width="25%">Título del Curso</th>
              <th width="15%">Estado</th>
              <th width="15%" class="text-center">Operaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="enroll in filteredEnrollments" :key="enroll.id">
              <td>{{ formatDate(enroll.enrollmentDate) }}</td>
              <td class="font-bold text-blue">{{ enroll.studentName }}</td>
              <td class="font-semi">{{ enroll.courseName }} <small class="text-muted">({{ enroll.courseCode }})</small></td>
              <td>
                <span class="badge-modern" :class="enroll.status === 'Active' ? 'badge-active' : (enroll.status === 'Completed' ? 'badge-active' : 'badge-inactive')">
                  {{ enroll.status === 'Active' ? 'Activa' : (enroll.status === 'Completed' ? 'Completada' : 'Inactiva') }}
                </span>
              </td>
              <td>
                <div class="actions-cell">
                  <button class="btn-action" @click="openModal(enroll)" title="Editar Matrícula">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="confirmDelete(enroll.id)" title="Eliminar matrícula">
                    <i class="fa fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredEnrollments.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="fa fa-search-minus fa-2x mb-3 d-block"></i>
                No se encontraron matrículas para el filtro actual.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Create/Edit -->
    <Modal v-model="isModalOpen" :title="modalTitle" @confirm="saveEnrollment">
      <form ref="formRef" @submit.prevent class="student-form">
        <div class="form-section">
          <div class="section-header">
            <i class="fa fa-clipboard-list"></i>
            <h5>Información de Matrícula</h5>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Estudiante *</label>
              <div class="select-wrapper">
                <i class="fa fa-user-graduate input-icon"></i>
                <select class="form-control" v-model="formData.studentId" required>
                  <option value="" disabled>Seleccionar Estudiante...</option>
                  <option v-for="s in activeStudents" :key="s.id" :value="s.id">
                    {{ s.name }} {{ s.lastName }} ({{ s.idNumber }})
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Curso *</label>
              <div class="select-wrapper">
                <i class="fa fa-book input-icon"></i>
                <select class="form-control" v-model="formData.courseId" required>
                  <option value="" disabled>Seleccionar Curso...</option>
                  <option v-for="c in activeCourses" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.code }}) — {{ c.feeLabel }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Fecha de Matrícula *</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt input-icon"></i>
                <input type="date" class="form-control" v-model="formData.enrollmentDate" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <div class="select-wrapper">
                <i class="fa fa-toggle-on input-icon"></i>
                <select class="form-control" v-model="formData.status">
                  <option value="Active">Activa</option>
                  <option value="Completed">Completada</option>
                  <option value="Inactive">Inactiva</option>
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
            <h5>Eliminar matrícula</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            Los pagos relacionados perderán su referencia válida.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>
        <button type="button" class="btn-primary-modern" @click="confirmDeleteEnrollment">Eliminar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getEnrollments, 
  addEnrollment, 
  updateEnrollment, 
  deleteEnrollment,
  getStudents,
  getCourses
} from '../js/data.js'

import { hasPermission, getCurrentUserName } from '../js/auth.js'
import { validateEnrollment, validateCourseCapacity } from '../js/validations.js'
import Modal from '../components/Modal.vue'

// Data arrays
const enrollmentsList = ref([])
const activeStudents = ref([])
const activeCourses = ref([])

const searchQuery = ref('')
const isModalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref(null)

const showDeleteModal = ref(false)
const pendingDeleteEnrollmentId = ref(null)

const userName = ref('')

const toastMsg = ref('')
const toastType = ref('')
const toastIcon = ref('')

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg
  toastType.value = type === 'success' ? 'toast-success' : 'toast-danger'
  toastIcon.value = type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle'
  setTimeout(() => toastMsg.value = '', 3000)
}

const formData = ref({
  id: null,
  studentId: '',
  courseId: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
  status: 'Active'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset()) // fix timezone shift
  return d.toLocaleDateString('es-ES')
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

const scrollToRegistry = () => {
  const el = document.getElementById('enrollments-registry')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loadData = async () => {
  const [students, courses, rawEnrollments] = await Promise.all([
    getStudents(),
    getCourses(),
    getEnrollments()
  ])
  
  // Guardamos solo los activos para los selects del modal
  activeStudents.value = students.filter(s => s.status === 'Active')
  activeCourses.value = courses
    .filter(c => c.status === 'Active')
    .map(c => ({
      ...c,
      feeLabel: formatMoneyDual(c.fee)
    }))

  // Enriquecemos la lista de matrículas para mostrar nombres en la tabla
  enrollmentsList.value = rawEnrollments.map(e => {
    const s = students.find(xs => xs.id == e.studentId) || {}
    const c = courses.find(xc => xc.id == e.courseId) || {}
    return {
      ...e,
      studentName: s.name ? `${s.name} ${s.lastName}` : 'Unknown',
      courseName: c.name || 'Unknown',
      courseCode: c.code || ''
    }
  })
}

onMounted(async () => {
  userName.value = getCurrentUserName() || 'Administrador'
  await loadData()
})

// Computed property de búsqueda cruzada
const filteredEnrollments = computed(() => {
  if (!searchQuery.value) return enrollmentsList.value
  const q = searchQuery.value.toLowerCase()
  return enrollmentsList.value.filter(e => 
    e.studentName.toLowerCase().includes(q) || 
    e.courseName.toLowerCase().includes(q) ||
    e.courseCode.toLowerCase().includes(q)
  )
})

const openModal = (enroll = null) => {
  if (enroll) {
    modalTitle.value = 'Editar Matrícula'
    formData.value = { 
      id: enroll.id,
      studentId: enroll.studentId,
      courseId: enroll.courseId,
      enrollmentDate: enroll.enrollmentDate,
      status: enroll.status
    }
  } else {
    modalTitle.value = 'Nueva Matrícula'
    formData.value = { 
      id: null, 
      studentId: '', 
      courseId: '', 
      enrollmentDate: new Date().toISOString().split('T')[0], 
      status: 'Active' 
    }
  }
  isModalOpen.value = true
}

const saveEnrollment = async () => {
  if (!formRef.value.checkValidity()) {
    formRef.value.reportValidity()
    return
  }

  const data = { ...formData.value }
  data.studentId = Number(data.studentId)
  data.courseId = Number(data.courseId)

  // Validaciones de negocio
  const validation = await validateEnrollment(data)
  if (!validation.isValid) {
    alert(`Errores de Validación:\n\n${validation.errors.join('\n')}`)
    return
  }

  // Validar capacidad del curso (solo para nuevas matrículas)
  if (!data.id) {
    const capacityValidation = await validateCourseCapacity(data.courseId)
    if (!capacityValidation.isValid) {
      alert(`No se puede matricular:\n\n${capacityValidation.errors.join('\n')}\n\nMatrícula actual: ${capacityValidation.currentEnrollment}/${capacityValidation.maxCapacity}`)
      return
    }
  }

  if (data.id) {
    await updateEnrollment(data.id, data)
    showToast('Matrícula actualizada')
  } else {
    await addEnrollment(data)
    showToast('Matrícula procesada completamente')
  }
  
  await loadData()
  isModalOpen.value = false
}

const confirmDelete = (id) => {
  pendingDeleteEnrollmentId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeleteEnrollmentId.value = null
}

const confirmDeleteEnrollment = async () => {
  if (!pendingDeleteEnrollmentId.value) {
    closeDeleteModal()
    return
  }

  await deleteEnrollment(pendingDeleteEnrollmentId.value)
  await loadData()
  showToast('Matrícula eliminada', 'success')
  closeDeleteModal()
}
</script>

<style scoped>
.m-title { margin: 0; line-height: 1; }
.mr-2 { margin-right: 5px; }
.py-4 { padding-top: 25px; padding-bottom: 25px; }
.p-3 { padding: 15px; }
</style>
