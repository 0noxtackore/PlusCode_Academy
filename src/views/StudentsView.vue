<template>

  <div class="page-container">

    <header class="student-hero">
      <div class="student-hero__title">
        <h2>Gestión de Estudiantes</h2>
        <p>
          <span class="student-hero__greeting">Hola, {{ userName }}.</span>
          <span class="student-hero__subtitle">Administra y gestiona toda la información de los estudiantes.</span>
        </p>
      </div>

      <div class="student-hero__actions">
        <button class="dash-action" type="button" @click="scrollToStudentsRegistry" aria-label="Ver estudiantes">
          <span class="dash-action__icon"><i class="fa fa-users"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Estudiantes</span>
            <span class="dash-action__meta">Registro y estados</span>
          </span>
        </button>

        <a class="dash-action" href="#enrollments" aria-label="Ir a matrículas">
          <span class="dash-action__icon"><i class="fa fa-clipboard-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Matrículas</span>
            <span class="dash-action__meta">Inscripción y control</span>
          </span>
        </a>

        <a class="dash-action" href="#payments" aria-label="Ir a pagos">
          <span class="dash-action__icon"><i class="fa fa-receipt"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Pagos</span>
            <span class="dash-action__meta">Cobros y estados</span>
          </span>
        </a>
      </div>
    </header>



    <!-- Student Table Card -->

    <div id="students-registry" class="card-modern">

      <div class="card-header-modern">

        <h4>Registro de Estudiantes</h4>

        <div class="table-controls-modern">

          <div class="search-input-modern">

            <i class="fa fa-search"></i>

            <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, apellido o cédula..." />

          </div>

          <button class="btn-primary-modern" type="button" @click="openModal()" aria-label="Inscribir estudiante">
            <i class="fa fa-user-plus"></i>
            <span>Inscribir Estudiante</span>
          </button>

        </div>

      </div>

      

      <div class="table-wrapper">

        <table class="table-professional">

          <thead>

            <tr>

              <th width="20%">Identificación</th>

              <th width="35%">Nombre Completo</th>

              <th width="25%">Detalles de Contacto</th>

              <th width="10%">Estado</th>

              <th width="10%" class="text-center">Operaciones</th>

            </tr>

          </thead>

          <tbody>

            <tr v-for="student in filteredStudents" :key="student.id">

              <td class="font-semi">{{ student.idNumber }}</td>

              <td class="font-bold text-blue">{{ student.name }} {{ student.lastName }}</td>

              <td>

                <div class="mb-1"><small><i class="fa fa-envelope text-muted mr-1"></i> {{ student.email }}</small></div>

                <div><small><i class="fa fa-phone text-muted mr-1"></i> {{ student.phone }}</small></div>

              </td>

              <td>

                <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">

                  <span class="badge-modern" :class="student.status === 'Active' ? 'badge-active' : 'badge-inactive'">

                    {{ student.status === 'Active' ? 'Activo' : 'Retirado' }}

                  </span>

                  <span
                    v-if="student.status === 'Active'"
                    class="badge-modern"
                    :class="financialStatuses[student.id] === 'moroso' ? 'badge-pending' : 'badge-active'"
                    style="background-color: #fff;"
                  >

                    {{ financialStatuses[student.id] === 'moroso' ? 'Moroso' : 'Solvente' }}

                  </span>

                </div>

              </td>

              <td>

                <div class="actions-cell">

                  <button class="btn-action" @click="openStatementModal(student)" title="Estado de Cuenta">

                    <i class="fa fa-file-invoice-dollar"></i>

                  </button>

                  <button class="btn-action" @click="openModal(student)" title="Editar Estudiante">

                    <i class="fa fa-edit"></i>

                  </button>

                  <button class="btn-action delete" @click="confirmDelete(student.id)" title="Eliminar Estudiante">

                    <i class="fa fa-trash-alt"></i>

                  </button>

                </div>

              </td>

            </tr>

            <tr v-if="filteredStudents.length === 0">

              <td colspan="5" class="text-center py-5 text-muted">

                <i class="fa fa-search-minus fa-2x mb-3 d-block"></i>

                No se encontraron registros de estudiantes coincidentes.

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>



    <!-- Modal for Create/Edit -->

    <Modal v-model="isModalOpen" :title="modalTitle" @confirm="saveStudent">

      <form ref="formRef" @submit.prevent class="student-form">

        <!-- Personal Information Section -->

        <div class="form-section">

          <div class="section-header">

            <i class="fa fa-user"></i>

            <h5>Información Personal</h5>

          </div>

          

          <div class="form-row">

            <div class="form-group">

              <label class="form-label">Nombre *</label>

              <div class="input-wrapper">

                <i class="fa fa-user input-icon"></i>

                <input 

                  type="text" 

                  class="form-control" 

                  v-model="formData.name" 

                  required

                  placeholder="Ingrese el nombre"

                >

              </div>

            </div>

            <div class="form-group">

              <label class="form-label">Apellido *</label>

              <div class="input-wrapper">

                <i class="fa fa-user input-icon"></i>

                <input 

                  type="text" 

                  class="form-control" 

                  v-model="formData.lastName" 

                  required

                  placeholder="Ingrese el apellido"

                >

              </div>

            </div>

          </div>

        </div>



        <!-- Academic Information Section -->

        <div class="form-section">

          <div class="section-header">

            <i class="fa fa-id-card"></i>

            <h5>Información Académica</h5>

          </div>

          

          <div class="form-row">

            <div class="form-group">

              <label class="form-label">Número de Cédula *</label>

              <div class="input-wrapper">

                <i class="fa fa-id-badge input-icon"></i>

                <input 

                  type="text" 

                  class="form-control" 

                  v-model="formData.idNumber" 

                  required 

                  placeholder="V-00.000.000"

                >

              </div>

            </div>

            <div class="form-group">

              <label class="form-label">Estado Académico</label>

              <div class="select-wrapper">

                <i class="fa fa-toggle-on input-icon"></i>

                <select class="form-control" v-model="formData.status">

                  <option value="Active">Activo</option>

                  <option value="Retired">Retirado</option>

                </select>

              </div>

            </div>

          </div>

        </div>



        <!-- Contact Information Section -->

        <div class="form-section">

          <div class="section-header">

            <i class="fa fa-address-book"></i>

            <h5>Información de Contacto</h5>

          </div>

          

          <div class="form-row">

            <div class="form-group">

              <label class="form-label">Correo Electrónico</label>

              <div class="input-wrapper">

                <i class="fa fa-envelope input-icon"></i>

                <input 

                  type="email" 

                  class="form-control" 

                  v-model="formData.email"

                  placeholder="estudiante@email.com"

                >

              </div>

            </div>

            <div class="form-group">

              <label class="form-label">Número de Teléfono</label>

              <div class="input-wrapper">

                <i class="fa fa-phone input-icon"></i>

                <input 

                  type="text" 

                  class="form-control" 

                  v-model="formData.phone"

                  placeholder="+1 234 567 8900"

                >

              </div>

            </div>

          </div>

        </div>

      </form>

    </Modal>

    <Modal v-model="isStatementModalOpen" title="Estado de Cuenta" :showDefaultFooter="false">

      <div v-if="selectedStatementStudent" class="student-form">

        <div class="form-section" style="margin-bottom: 1rem;">

          <div class="section-header" style="margin-bottom: 0.75rem;">

            <i class="fa fa-file-invoice-dollar"></i>

            <h5>Resumen del Estudiante</h5>

          </div>

          <div class="form-row" style="margin-bottom: 0;">

            <div class="form-group">

              <div class="form-label" style="margin-bottom: 0.35rem;">Nombre</div>

              <div class="font-bold text-blue">{{ selectedStatementStudent.name }} {{ selectedStatementStudent.lastName }}</div>

              <div class="text-muted"><small>C.I: {{ selectedStatementStudent.idNumber }}</small></div>

            </div>

            <div class="form-group">

              <div class="form-label" style="margin-bottom: 0.35rem;">Totales</div>

              <div class="font-semi">Pagado: <span class="text-success font-bold">${{ formatMoneyFull(statementTotals.totalPaid) }}</span></div>

              <div class="font-semi">Debe: <span class="text-danger font-bold">${{ formatMoneyFull(statementTotals.totalOwed) }}</span></div>

            </div>

          </div>

        </div>

        <div class="form-section" style="margin-bottom: 0;">

          <div class="section-header" style="margin-bottom: 0.75rem;">

            <i class="fa fa-list"></i>

            <h5>Detalle por Curso</h5>

          </div>

          <div class="table-wrapper" style="margin-top: 0;">

            <table class="table-professional">

              <thead>

                <tr>

                  <th>Curso</th>

                  <th class="text-right">Cuota</th>

                  <th class="text-right">Pagado</th>

                  <th class="text-right">Saldo</th>

                  <th class="text-center">Estado</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="row in statementRows" :key="row.enrollmentId">

                  <td>

                    <div class="font-bold text-blue">{{ row.courseName }}</div>

                    <div class="text-muted"><small>{{ row.courseCode }}</small></div>

                  </td>

                  <td class="text-right font-semi">${{ formatMoneyFull(row.fee) }}</td>

                  <td class="text-right font-semi text-success">${{ formatMoneyFull(row.paid) }}</td>

                  <td class="text-right font-bold" :class="row.balance > 0 ? 'text-danger' : 'text-success'">

                    ${{ formatMoneyFull(Math.max(0, row.balance)) }}

                  </td>

                  <td class="text-center">

                    <span class="badge-modern" :class="row.balance > 0 ? 'badge-pending' : 'badge-active'">

                      {{ row.balance > 0 ? 'Pendiente' : 'Solvente' }}

                    </span>

                  </td>

                </tr>

                <tr v-if="statementRows.length === 0">

                  <td colspan="5" class="text-center py-5 text-muted">

                    <i class="fa fa-info-circle fa-2x mb-3 d-block"></i>

                    Este estudiante no tiene matrículas registradas.

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <template #footer>

        <button type="button" class="btn-secondary-modern" @click="closeStatementModal">Cerrar</button>

        <button type="button" class="btn-primary-modern" @click="printStatement" :disabled="!selectedStatementStudent">

          <i class="fa fa-print" style="margin-right: 8px;"></i>

          Imprimir

        </button>

      </template>

    </Modal>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" :showDefaultFooter="false">

      <div class="student-form">

        <div class="form-section" style="margin-bottom: 0;">

          <div class="section-header" style="margin-bottom: 0.75rem;">

            <i class="fa fa-trash-alt"></i>

            <h5>Eliminar estudiante</h5>

          </div>

          <div class="text-muted" style="line-height: 1.5;">
            Esta acción no se puede deshacer.
          </div>

        </div>

      </div>

      <template #footer>

        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>

        <button type="button" class="btn-primary-modern" @click="confirmDeleteStudent">Eliminar</button>

      </template>

    </Modal>

  </div>

</template>



<script setup>

import { ref, computed, onMounted } from 'vue'

import { getStudents, addStudent, updateStudent, deleteStudent, getEnrollments, getCourses, getPayments } from '../js/data.js'

import { getCurrentUserName } from '../js/auth.js'

import { initializePaymentPlans, getStudentDebtSummary } from '../js/payment-plans.js'

import { generateEnrollmentStatement } from '../js/pdf-generator.js'

import Modal from '../components/Modal.vue'



// Estado

const studentsList = ref([])

const searchQuery = ref('')

const isModalOpen = ref(false)

const modalTitle = ref('')

const formRef = ref(null)



// Notificaciones

const toastMsg = ref('')

const toastType = ref('')

const toastIcon = ref('')

const userName = ref('')

const isStatementModalOpen = ref(false)
const selectedStatementStudent = ref(null)
const statementRows = ref([])
const statementTotals = ref({ totalPaid: 0, totalOwed: 0 })

const showDeleteModal = ref(false)
const pendingDeleteStudentId = ref(null)



const showToast = (msg, type = 'success') => {

  toastMsg.value = msg

  toastType.value = type === 'success' ? 'toast-success' : 'toast-danger'

  toastIcon.value = type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle'

  setTimeout(() => toastMsg.value = '', 3000)

}

const formatMoneyFull = (val) => {

  return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

}



// Datos de Formulario

const formData = ref({

  id: null,

  idNumber: '',

  name: '',

  lastName: '',

  email: '',

  phone: '',

  status: 'Active'

})



const scrollToStudentsRegistry = () => {

  const el = document.getElementById('students-registry')

  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })

}



// Carga Inicial

const financialStatuses = ref({})

// Carga Inicial

const loadStudents = async () => {

  const [students, enrollments, courses, payments] = await Promise.all([
    getStudents(),
    getEnrollments(),
    getCourses(),
    getPayments()
  ])

  studentsList.value = students

  const newStatuses = {}
  students.forEach(student => {
    const studentEnrollments = enrollments.filter(e => e.studentId == student.id)
    let totalFee = 0
    let totalPaid = 0
    
    studentEnrollments.forEach(e => {
      const course = courses.find(c => c.id == e.courseId)
      if (course) totalFee += Number(course.fee) || 0
      
      const enrollmentPayments = payments.filter(p => p.enrollmentId == e.id)
      totalPaid += enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    })
    
    newStatuses[student.id] = (totalFee > totalPaid) ? 'moroso' : 'solvente'
  })
  
  financialStatuses.value = newStatuses

}



onMounted(() => {

  userName.value = getCurrentUserName() || 'Administrador'

  loadStudents()

})



// Búsqueda en tabla

const filteredStudents = computed(() => {

  if (!searchQuery.value) return studentsList.value

  const q = searchQuery.value.toLowerCase()

  return studentsList.value.filter(s => 

    s.name.toLowerCase().includes(q) || 

    s.lastName.toLowerCase().includes(q) || 

    s.idNumber.toLowerCase().includes(q)

  )

})



// Acciones Modal

const openModal = (student = null) => {

  if (student) {

    modalTitle.value = 'Editar información del estudiante'

    formData.value = { ...student }

  } else {

    modalTitle.value = 'Inscribir nuevo estudiante'

    formData.value = { id: null, idNumber: '', name: '', lastName: '', email: '', phone: '', status: 'Active' }

  }

  isModalOpen.value = true

}



const saveStudent = async () => {

  // Validación básica del HTML5

  if (!formRef.value.checkValidity()) {

    formRef.value.reportValidity()

    return

  }



  if (formData.value.id) {

    await updateStudent(formData.value.id, formData.value)

    showToast('Estudiante actualizado correctamente')

  } else {

    await addStudent(formData.value)

    showToast('Estudiante registrado correctamente')

  }

  

  await loadStudents()

  isModalOpen.value = false

}



const confirmDelete = (id) => {
  pendingDeleteStudentId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeleteStudentId.value = null
}

const confirmDeleteStudent = async () => {
  if (!pendingDeleteStudentId.value) {
    closeDeleteModal()
    return
  }

  await deleteStudent(pendingDeleteStudentId.value)
  await loadStudents()
  showToast('Estudiante eliminado correctamente', 'success')
  closeDeleteModal()
}

const openStatementModal = async (student) => {
  selectedStatementStudent.value = student

  const [enrollmentsRaw, courses, payments] = await Promise.all([
    getEnrollments(),
    getCourses(),
    getPayments()
  ])
  const enrollments = enrollmentsRaw.filter(e => e.studentId == student.id)

  const rows = enrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId) || {}
    const enrollmentPayments = payments.filter(p => p.enrollmentId === e.id)
    const paid = enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const fee = Number(course.fee) || 0
    const balance = fee - paid

    return {
      enrollmentId: e.id,
      courseName: course.name || 'N/A',
      courseCode: course.code || '',
      fee,
      paid,
      balance
    }
  })

  const totalPaid = rows.reduce((sum, r) => sum + (Number(r.paid) || 0), 0)
  const totalOwed = rows.reduce((sum, r) => sum + Math.max(0, Number(r.balance) || 0), 0)

  statementRows.value = rows
  statementTotals.value = { totalPaid, totalOwed }

  isStatementModalOpen.value = true
}

const closeStatementModal = () => {
  isStatementModalOpen.value = false
}

const printStatement = async () => {
  if (!selectedStatementStudent.value) return
  await generateEnrollmentStatement(selectedStatementStudent.value.id)
}

</script>



<style scoped>

  /* 

    No agregamos estilos aquí para dejar que assets/css/style.css mande.

    Solo ajustes preventivos de espaciado.

  */



  /* Enhanced Student Form Styles */

  .student-form {

    max-width: 100%;

  }



  .form-section {

    margin-bottom: 2rem;

    padding: 1.5rem;

    background: #f8fafc;

    border-radius: 12px;

    border: 1px solid #e2e8f0;

  }



  .section-header {

    display: flex;

    align-items: center;

    gap: 0.75rem;

    margin-bottom: 1.5rem;

    padding-bottom: 0.75rem;

    border-bottom: 2px solid #e2e8f0;

  }



  .section-header i {

    color: var(--primary-blue);

    font-size: 1.1rem;

    width: 24px;

    text-align: center;

  }



  .section-header h5 {

    margin: 0;

    color: var(--primary-blue);

    font-weight: 600;

    font-size: 1rem;

    text-transform: uppercase;

    letter-spacing: 0.5px;

  }



  .form-row {

    display: flex;

    gap: 1.5rem;

    margin-bottom: 0;

  }



  .form-group {

    flex: 1;

    margin-bottom: 0;

  }



  .form-label {

    display: block;

    margin-bottom: 0.5rem;

    font-weight: 600;

    color: var(--primary-blue);

    font-size: 0.9rem;

  }



  .input-wrapper, .select-wrapper {

    position: relative;

  }



  .input-icon {

    position: absolute;

    left: 1rem;

    top: 50%;

    transform: translateY(-50%);

    color: #64748b;

    font-size: 0.9rem;

    z-index: 1;

  }



  .form-control {

    width: 100%;

    padding: 0.875rem 1rem 0.875rem 2.75rem;

    border: 2px solid #e2e8f0;

    border-radius: 10px;

    font-size: 0.9rem;

    outline: none;

    transition: all 0.3s ease;

    background: white;

  }



  .form-control:focus {

    border-color: var(--primary-blue);

    box-shadow: 0 0 0 4px rgba(0, 51, 86, 0.1);

    transform: translateY(-1px);

  }



  .form-control::placeholder {

    color: #94a3b8;

    font-style: italic;

  }



  /* Enhanced Table Styles */

  .table-professional {

    border-collapse: separate;

    border-spacing: 0;

    border-radius: 12px;

    overflow: hidden;

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  }



  .table-professional thead {

    background: linear-gradient(135deg, var(--primary-blue), #1e40af);

  }



  .table-professional th {

    color: #64748b;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.5px;

    font-size: 0.85rem;

    padding: 1.25rem 1.5rem;

    border: none;

  }



  .table-professional tbody tr {

    transition: all 0.2s ease;

    border-bottom: 1px solid #f1f5f9;

  }



  .table-professional tbody tr:hover {

    background-color: #f8fafc;

    transform: scale(1.01);

    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  }



  .table-professional td {

    padding: 1.25rem 1.5rem;

    vertical-align: middle;

    border: none;

  }



  /* Enhanced Action Buttons */

  .actions-cell {

    display: flex;

    gap: 0.5rem;

    justify-content: center;

  }



  .btn-action {

    width: 36px;

    height: 36px;

    border-radius: 8px;

    border: none;

    display: flex;

    align-items: center;

    justify-content: center;

    cursor: pointer;

    transition: all 0.2s ease;

    font-size: 0.9rem;

  }



  .btn-action:hover {

    transform: translateY(-2px);

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  }



  .btn-action.delete:hover {

    background-color: #fee2e2;

    color: #dc2626;

  }



  /* Enhanced Badge Styles */

  .badge-modern {

    padding: 0.375rem 0.875rem;

    border-radius: 20px;

    font-size: 0.8rem;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.5px;

  }



  .badge-active {

    background: linear-gradient(135deg, #dcfce7, #bbf7d0);

    color: #166534;

    border: 1px solid #86efac;

  }



  .badge-inactive {

    background: linear-gradient(135deg, #fee2e2, #fecaca);

    color: #991b1b;

    border: 1px solid #fca5a5;

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

    border-radius: 12px;

    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    margin-bottom: 1rem;

    display: flex;

    align-items: center;

    gap: 0.75rem;

    animation: slideInRight 0.3s ease-out;

    border-left: 4px solid;

  }



  .toast-success {

    border-left-color: #10b981;

    color: #059669;

  }



  .toast-danger {

    border-left-color: #ef4444;

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



  /* Responsive adjustments */

  @media (max-width: 768px) {

    .form-row {

      flex-direction: column;

      gap: 1rem;

    }

    

    .form-section {

      padding: 1rem;

    }

    

    .section-header {

      margin-bottom: 1rem;

    }

  }

</style>

