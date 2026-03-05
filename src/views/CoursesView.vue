<template>
  <div class="page-container">
    <header class="course-hero">
      <div class="course-hero__title">
        <h2>Gestión de Cursos</h2>
        <p>
          <span class="course-hero__greeting">Hola, {{ userName }}.</span>
          <span class="course-hero__subtitle">Administra el catálogo de cursos y sus programas académicos.</span>
        </p>
      </div>

      <div class="course-hero__actions">
        <button class="dash-action" type="button" @click="scrollToCatalog" aria-label="Ver cursos">
          <span class="dash-action__icon"><i class="fa fa-th-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Cursos</span>
            <span class="dash-action__meta">Catálogo y estados</span>
          </span>
        </button>

        <a class="dash-action" href="#students" aria-label="Ir a estudiantes">
          <span class="dash-action__icon"><i class="fa fa-user-graduate"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Estudiantes</span>
            <span class="dash-action__meta">Gestión general</span>
          </span>
        </a>

        <a class="dash-action" href="#enrollments" aria-label="Ir a matrículas">
          <span class="dash-action__icon"><i class="fa fa-clipboard-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Matrículas</span>
            <span class="dash-action__meta">Inscripción y control</span>
          </span>
        </a>
      </div>
    </header>

    <!-- Notification Toast -->
    <div class="toast-container" v-if="toastMsg">
      <div :class="['toast', toastType]">
        <i :class="toastIcon"></i> {{ toastMsg }}
      </div>
    </div>

    <!-- Course Table Card -->
    <div id="courses-catalog" class="card-modern">
      <div class="card-header-modern">
        <h4>Catálogo de Cursos</h4>
        <div class="table-controls-modern">
          <div class="search-input-modern">
            <i class="fa fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o código de curso..." />
          </div>

          <button class="btn-primary-modern" type="button" @click="openModal()" aria-label="Registrar curso">
            <i class="fa fa-plus"></i>
            <span>Registrar Curso</span>
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="table-professional">
          <thead>
            <tr>
              <th width="20%">Código</th>
              <th width="35%">Título del Curso</th>
              <th width="10%" class="text-center">Créditos</th>
              <th width="15%" class="text-right">Monto Cuota</th>
              <th width="10%">Estado</th>
              <th width="10%" class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in filteredCourses" :key="course.id">
              <td class="font-bold text-blue">{{ course.code }}</td>
              <td class="font-semi">{{ course.name }}</td>
              <td class="text-center">
                <span :class="creditsStatusClass(course.credits)">{{ formatCredits(course.credits) }}</span>
              </td>
              <td class="text-right font-bold text-success">
                <div>
                  ${{ formatMoneyFull(course.fee) }}
                </div>
              </td>
              <td>
                <span class="badge-modern" :class="course.status === 'Active' ? 'badge-active' : 'badge-inactive'">
                  {{ course.status === 'Active' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="actions-cell">
                  <button class="btn-action" @click="openModal(course)" title="Editar Curso">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="confirmDelete(course.id)" title="Eliminar Curso">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCourses.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fa fa-search-minus fa-2x mb-3 d-block"></i>
                No se encontraron cursos que coincidan con sus criterios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Create/Edit -->
    <Modal v-model="isModalOpen" :title="modalTitle" @confirm="saveCourse">
      <form ref="formRef" @submit.prevent class="student-form">
        <div class="form-section">
          <div class="section-header">
            <i class="fa fa-scroll"></i>
            <h5>Información del Curso</h5>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Código del Curso *</label>
              <div class="input-wrapper">
                <i class="fa fa-hashtag input-icon"></i>
                <input type="text" class="form-control" v-model="formData.code" required placeholder="Ej: MAT101">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre del Curso *</label>
              <div class="input-wrapper">
                <i class="fa fa-book-open input-icon"></i>
                <input type="text" class="form-control" v-model="formData.name" required placeholder="Ej: Matemáticas Básicas">
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Créditos *</label>
              <div class="input-wrapper">
                <i class="fa fa-layer-group input-icon"></i>
                <input type="number" class="form-control" v-model="formData.credits" required min="0" max="300">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Cuota del Curso (USD) *</label>
              <div class="input-wrapper">
                <i class="fa fa-dollar-sign input-icon"></i>
                <input type="number" class="form-control" v-model="formData.fee" required min="0" step="0.01">
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
        </div>
      </form>
    </Modal>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" :showDefaultFooter="false">
      <div class="student-form">
        <div class="form-section" style="margin-bottom: 0;">
          <div class="section-header" style="margin-bottom: 0.75rem;">
            <i class="fa fa-trash"></i>
            <h5>Eliminar curso</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            NOTA: Asegúrese de que no haya matrículas activas.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>
        <button type="button" class="btn-primary-modern" @click="confirmDeleteCourse">Eliminar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCourses, addCourse, updateCourse, deleteCourse } from '../js/data.js'
import Modal from '../components/Modal.vue'
import { getCurrentUserName } from '../js/auth.js'

const coursesList = ref([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalTitle = ref('')
const formRef = ref(null)

const userName = ref('')

const toastMsg = ref('')
const toastType = ref('')
const toastIcon = ref('')

const showDeleteModal = ref(false)
const pendingDeleteCourseId = ref(null)

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg
  toastType.value = type === 'success' ? 'toast-success' : 'toast-danger'
  toastIcon.value = type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle'
  setTimeout(() => toastMsg.value = '', 3000)
}

const formData = ref({
  id: null,
  code: '',
  name: '',
  credits: '',
  fee: 0,
  status: 'Active'
})

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

const formatCredits = (val) => {
  const n = Number(val)
  const credits = Number.isFinite(n) ? n : 0
  if (credits <= 0) return 'Agotado'
  return `${credits}`
}

const creditsStatusClass = (val) => {
  const n = Number(val)
  const credits = Number.isFinite(n) ? n : 0
  return credits <= 0 ? 'text-danger font-bold' : 'text-success font-bold'
}

const formatMoneyDual = (usdVal) => {
  const usd = Number(usdVal) || 0
  return `$${formatMoney(usd)}`
}

const loadCourses = () => {
  coursesList.value = getCourses()
}

const scrollToCatalog = () => {
  const el = document.getElementById('courses-catalog')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  userName.value = getCurrentUserName() || 'Administrador'
  loadCourses()
})

const filteredCourses = computed(() => {
  if (!searchQuery.value) return coursesList.value
  const q = searchQuery.value.toLowerCase()
  return coursesList.value.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.code.toLowerCase().includes(q)
  )
})

const openModal = (course = null) => {
  if (course) {
    modalTitle.value = 'Editar Información del Curso'
    formData.value = { ...course }
  } else {
    modalTitle.value = 'Crear Nuevo Curso'
    formData.value = { id: null, code: '', name: '', credits: '', fee: '', status: 'Active' }
  }
  isModalOpen.value = true
}

const saveCourse = () => {
  if (!formRef.value.checkValidity()) {
    formRef.value.reportValidity()
    return
  }

  // Asegurar formato numérico
  const data = { ...formData.value }
  data.credits = Number(data.credits)
  data.fee = Number(data.fee)

  if (data.id) {
    updateCourse(data.id, data)
    showToast('Curso actualizado exitosamente')
  } else {
    addCourse(data)
    showToast('Curso creado exitosamente')
  }
  
  loadCourses()
  isModalOpen.value = false
}

const confirmDelete = (id) => {
  pendingDeleteCourseId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeleteCourseId.value = null
}

const confirmDeleteCourse = () => {
  if (!pendingDeleteCourseId.value) {
    closeDeleteModal()
    return
  }

  deleteCourse(pendingDeleteCourseId.value)
  loadCourses()
  showToast('Curso eliminado', 'success')
  closeDeleteModal()
}
</script>

<style scoped>
.m-title { margin: 0; line-height: 1; }
.py-4 { padding-top: 25px; padding-bottom: 25px; }
.p-3 { padding: 15px; }
.justify-center { justify-content: center; }
</style>
