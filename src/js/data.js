/**
 * data.js — Módulo de datos del sistema
 * Contiene los datos mock iniciales y funciones CRUD para cada entidad.
 * Los datos se persisten en localStorage para sobrevivir recargas de página.
 *
 * Entidades:
 *  - students   (estudiantes)
 *  - courses    (cursos)
 *  - enrollments (matrículas: estudiante + curso)
 *  - payments   (pagos de matrículas)
 */

// -----------------------------------------------------------------------
// Claves de localStorage para cada entidad
// -----------------------------------------------------------------------
const KEYS = {
    students: 'academy_students',
    courses: 'academy_courses',
    enrollments: 'academy_enrollments',
    payments: 'academy_payments'
}

// -----------------------------------------------------------------------
// Datos iniciales (se cargan solo si localStorage está vacío)
// -----------------------------------------------------------------------
const pad2 = (n) => String(n).padStart(2, '0')

const toYMD = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`
}

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const buildInitialStudents = () => ([
  { id: 1, idNumber: 'V-26.445.102', name: 'Mariana', lastName: 'Rivas', email: 'mariana.rivas@pluscode.edu', phone: '+58 412-555-0102', status: 'Active' },
  { id: 2, idNumber: 'V-28.193.774', name: 'José', lastName: 'García', email: 'jose.garcia@pluscode.edu', phone: '+58 414-555-9377', status: 'Active' },
  { id: 3, idNumber: 'V-24.772.901', name: 'Valentina', lastName: 'Pérez', email: 'valentina.perez@pluscode.edu', phone: '+58 424-555-2901', status: 'Active' },
  { id: 4, idNumber: 'V-27.051.663', name: 'Luis', lastName: 'Mendoza', email: 'luis.mendoza@pluscode.edu', phone: '+58 416-555-1663', status: 'Active' },
  { id: 5, idNumber: 'V-22.908.115', name: 'Sofía', lastName: 'Castillo', email: 'sofia.castillo@pluscode.edu', phone: '+58 412-555-8115', status: 'Active' },
  { id: 6, idNumber: 'V-19.664.208', name: 'Andrés', lastName: 'Salazar', email: 'andres.salazar@pluscode.edu', phone: '+58 426-555-4208', status: 'Retired' }
])

const buildInitialCourses = () => ([
  // Programación e IA
  { id: 1, code: 'IA-101', name: 'Ingeniería de Prompts', credits: 200, fee: 180.00, status: 'Active', maxCapacity: 30, currentEnrollment: 0 },
  { id: 2, code: 'SEC-201', name: 'DevSecOps', credits: 300, fee: 260.00, status: 'Active', maxCapacity: 25, currentEnrollment: 0 },
  { id: 3, code: 'LC-110', name: 'Low-Code', credits: 100, fee: 140.00, status: 'Active', maxCapacity: 35, currentEnrollment: 0 },

  // Excel y Datos
  { id: 4, code: 'DATA-120', name: 'Power Query/DAX', credits: 200, fee: 160.00, status: 'Active', maxCapacity: 28, currentEnrollment: 0 },
  { id: 5, code: 'PY-130', name: 'Automatización con Python', credits: 300, fee: 220.00, status: 'Active', maxCapacity: 24, currentEnrollment: 0 },
  { id: 6, code: 'BI-140', name: 'Business Intelligence', credits: 100, fee: 200.00, status: 'Active', maxCapacity: 26, currentEnrollment: 0 },

  // Robótica e IoT
  { id: 7, code: 'IOT-210', name: 'Drones Industriales', credits: 300, fee: 320.00, status: 'Active', maxCapacity: 18, currentEnrollment: 0 },
  { id: 8, code: 'IOT-220', name: 'Domótica con Raspberry Pi', credits: 200, fee: 290.00, status: 'Active', maxCapacity: 20, currentEnrollment: 0 },
  { id: 9, code: 'ROB-230', name: 'Mantenimiento Robótico', credits: 100, fee: 300.00, status: 'Active', maxCapacity: 18, currentEnrollment: 0 },

  // Diseño y UX
  { id: 10, code: 'UX-310', name: 'Interfaces AR', credits: 200, fee: 240.00, status: 'Active', maxCapacity: 22, currentEnrollment: 0 },
  { id: 11, code: 'UX-320', name: 'Branding con IA', credits: 100, fee: 210.00, status: 'Active', maxCapacity: 30, currentEnrollment: 0 },
  { id: 12, code: 'UX-330', name: 'Motion Graphics', credits: 300, fee: 230.00, status: 'Active', maxCapacity: 24, currentEnrollment: 0 },

  // Marketing
  { id: 13, code: 'MKT-410', name: 'Growth Hacking', credits: 200, fee: 200.00, status: 'Active', maxCapacity: 30, currentEnrollment: 0 },
  { id: 14, code: 'MKT-420', name: 'AdTech', credits: 100, fee: 210.00, status: 'Active', maxCapacity: 26, currentEnrollment: 0 },
  { id: 15, code: 'CRM-430', name: 'Automatización CRM', credits: 300, fee: 190.00, status: 'Active', maxCapacity: 28, currentEnrollment: 0 }
])

const buildInitialEnrollments = () => ([
  // Cohorte reciente (fechas cercanas)
  { id: 1, studentId: 1, courseId: 2, enrollmentDate: toYMD(daysAgo(18)), status: 'Active' }, // Mariana -> DevSecOps
  { id: 2, studentId: 2, courseId: 1, enrollmentDate: toYMD(daysAgo(16)), status: 'Active' }, // José -> Ingeniería de Prompts
  { id: 3, studentId: 3, courseId: 5, enrollmentDate: toYMD(daysAgo(15)), status: 'Active' }, // Valentina -> Automatización con Python
  { id: 4, studentId: 4, courseId: 8, enrollmentDate: toYMD(daysAgo(12)), status: 'Active' }, // Luis -> Domótica con Raspberry Pi
  { id: 5, studentId: 5, courseId: 14, enrollmentDate: toYMD(daysAgo(10)), status: 'Active' }, // Sofía -> AdTech
  { id: 6, studentId: 1, courseId: 4, enrollmentDate: toYMD(daysAgo(7)), status: 'Active' },  // Mariana -> Power Query/DAX
  { id: 7, studentId: 2, courseId: 13, enrollmentDate: toYMD(daysAgo(6)), status: 'Active' },  // José -> Growth Hacking
  { id: 8, studentId: 3, courseId: 11, enrollmentDate: toYMD(daysAgo(5)), status: 'Active' }   // Valentina -> Branding con IA
])

const buildInitialPayments = () => ([
  // Pagos por matrícula (montos coherentes con la cuota del curso)
  { id: 1, enrollmentId: 1, amount: 260.00, paymentDate: toYMD(daysAgo(17)), method: 'Transfer', reference: 'TRX-000281', status: 'Paid' },
  { id: 2, enrollmentId: 2, amount: 180.00, paymentDate: toYMD(daysAgo(16)), method: 'Cash', reference: 'CAJA-000134', status: 'Paid' },
  { id: 3, enrollmentId: 3, amount: 120.00, paymentDate: toYMD(daysAgo(14)), method: 'Card', reference: 'POS-884211', status: 'Partial' },
  { id: 4, enrollmentId: 3, amount: 100.00, paymentDate: toYMD(daysAgo(8)), method: 'Transfer', reference: 'TRX-000319', status: 'Paid' },
  { id: 5, enrollmentId: 4, amount: 290.00, paymentDate: toYMD(daysAgo(11)), method: 'Transfer', reference: 'TRX-000412', status: 'Paid' },
  { id: 6, enrollmentId: 5, amount: 210.00, paymentDate: toYMD(daysAgo(9)), method: 'Cash', reference: 'CAJA-000155', status: 'Paid' },
  { id: 7, enrollmentId: 6, amount: 160.00, paymentDate: toYMD(daysAgo(6)), method: 'Transfer', reference: 'TRX-000477', status: 'Paid' },
  { id: 8, enrollmentId: 7, amount: 200.00, paymentDate: toYMD(daysAgo(5)), method: 'Card', reference: 'POS-110920', status: 'Paid' },
  { id: 9, enrollmentId: 8, amount: 210.00, paymentDate: toYMD(daysAgo(4)), method: 'Transfer', reference: 'TRX-000501', status: 'Paid' }
])

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------

/**
 * Inicializa los datos en localStorage si aún no existen.
 * Se llama una vez al arrancar la app.
 */
function initializeStudentsData() {
    if (!localStorage.getItem(KEYS.students)) localStorage.setItem(KEYS.students, JSON.stringify(buildInitialStudents()))
}

function initializeCoursesData() {
    if (!localStorage.getItem(KEYS.courses)) localStorage.setItem(KEYS.courses, JSON.stringify(buildInitialCourses()))
}

function initializeEnrollmentsData() {
    if (!localStorage.getItem(KEYS.enrollments)) localStorage.setItem(KEYS.enrollments, JSON.stringify(buildInitialEnrollments()))
}

function initializePaymentsData() {
    if (!localStorage.getItem(KEYS.payments)) localStorage.setItem(KEYS.payments, JSON.stringify(buildInitialPayments()))
}

import { initializeExpensesData } from './expenses.js'
import { initializePaymentPlans } from './payment-plans.js'
import { initializeTeachersData } from './teachers.js'
import { initializeInventoryData } from './inventory.js'

// -----------------------------------------------------------------------
// Inicialización de todos los datos del sistema
// -----------------------------------------------------------------------
export function initializeData() {
  initializeStudentsData()
  initializeCoursesData()
  initializeEnrollmentsData()
  initializePaymentsData()
  initializeExpensesData()
  initializePaymentPlans()
  initializeTeachersData()
  initializeInventoryData()
}

/**
 * Genera un ID único incrementando el máximo existente.
 * @param {Array} list - Lista de objetos con propiedad 'id'
 * @returns {number} Nuevo ID
 */
function generateId(list) {
    if (list.length === 0) return 1
    return Math.max(...list.map(item => item.id)) + 1
}

// -----------------------------------------------------------------------
// STUDENTS CRUD
// -----------------------------------------------------------------------

/** @returns {Array} Lista de todos los estudiantes */
export function getStudents() {
    return JSON.parse(localStorage.getItem(KEYS.students) || '[]')
}

/** @param {Object} student - Nuevo estudiante (sin id) */
export function addStudent(student) {
    const list = getStudents()
    student.id = generateId(list)
    list.push(student)
    localStorage.setItem(KEYS.students, JSON.stringify(list))
    return student
}

/**
 * Actualiza un estudiante existente.
 * @param {number} id - ID del estudiante
 * @param {Object} data - Campos a actualizar
 */
export function updateStudent(id, data) {
    const list = getStudents()
    const index = list.findIndex(s => s.id === id)
    if (index !== -1) {
        list[index] = { ...list[index], ...data }
        localStorage.setItem(KEYS.students, JSON.stringify(list))
    }
}

/**
 * Elimina un estudiante por ID.
 * @param {number} id - ID del estudiante
 */
export function deleteStudent(id) {
    const list = getStudents().filter(s => s.id !== id)
    localStorage.setItem(KEYS.students, JSON.stringify(list))
}

/** @param {number} id - ID del estudiante @returns {Object|undefined} */
export function getStudentById(id) {
    return getStudents().find(s => s.id === id)
}

// -----------------------------------------------------------------------
// COURSES CRUD
// -----------------------------------------------------------------------

/** @returns {Array} Lista de todos los cursos */
export function getCourses() {
    return JSON.parse(localStorage.getItem(KEYS.courses) || '[]')
}

/** @param {Object} course - Nuevo curso (sin id) */
export function addCourse(course) {
    const list = getCourses()
    course.id = generateId(list)
    list.push(course)
    localStorage.setItem(KEYS.courses, JSON.stringify(list))
    return course
}

export function updateCourse(id, data) {
    const list = getCourses()
    const index = list.findIndex(c => c.id === id)
    if (index !== -1) {
        list[index] = { ...list[index], ...data }
        localStorage.setItem(KEYS.courses, JSON.stringify(list))
    }
}

export function deleteCourse(id) {
    const list = getCourses().filter(c => c.id !== id)
    localStorage.setItem(KEYS.courses, JSON.stringify(list))
}

export function getCourseById(id) {
    return getCourses().find(c => c.id === id)
}

// -----------------------------------------------------------------------
// ENROLLMENTS CRUD
// -----------------------------------------------------------------------

/** @returns {Array} Lista de todas las matrículas */
export function getEnrollments() {
    return JSON.parse(localStorage.getItem(KEYS.enrollments) || '[]')
}

/** @param {Object} enrollment - Nueva matrícula (sin id) */
export function addEnrollment(enrollment) {
    const list = getEnrollments()
    enrollment.id = generateId(list)
    list.push(enrollment)
    localStorage.setItem(KEYS.enrollments, JSON.stringify(list))
    return enrollment
}

export function updateEnrollment(id, data) {
    const list = getEnrollments()
    const index = list.findIndex(e => e.id === id)
    if (index !== -1) {
        list[index] = { ...list[index], ...data }
        localStorage.setItem(KEYS.enrollments, JSON.stringify(list))
    }
}

export function deleteEnrollment(id) {
    const list = getEnrollments().filter(e => e.id !== id)
    localStorage.setItem(KEYS.enrollments, JSON.stringify(list))
}

// -----------------------------------------------------------------------
// PAYMENTS CRUD
// -----------------------------------------------------------------------

/** @returns {Array} Lista de todos los pagos */
export function getPayments() {
    return JSON.parse(localStorage.getItem(KEYS.payments) || '[]')
}

/** @param {Object} payment - Nuevo pago (sin id) */
export function addPayment(payment) {
    const list = getPayments()
    payment.id = generateId(list)
    list.push(payment)
    localStorage.setItem(KEYS.payments, JSON.stringify(list))
    return payment
}

export function updatePayment(id, data) {
    const list = getPayments()
    const index = list.findIndex(p => p.id === id)
    if (index !== -1) {
        list[index] = { ...list[index], ...data }
        localStorage.setItem(KEYS.payments, JSON.stringify(list))
    }
}

export function deletePayment(id) {
    const list = getPayments().filter(p => p.id !== id)
    localStorage.setItem(KEYS.payments, JSON.stringify(list))
}

// -----------------------------------------------------------------------
// Funciones de utilidad / joins
// -----------------------------------------------------------------------

/**
 * Retorna los pagos con información completa del estudiante y curso.
 * Simula un JOIN entre pagos, matrículas, estudiantes y cursos.
 * @returns {Array} Pagos enriquecidos con datos del estudiante y curso
 */
export function getPaymentsWithDetails() {
    const payments = getPayments()
    const enrollments = getEnrollments()
    const students = getStudents()
    const courses = getCourses()

    return payments.map(payment => {
        const enrollment = enrollments.find(e => e.id === payment.enrollmentId) || {}
        const student = students.find(s => s.id === enrollment.studentId) || {}
        const course = courses.find(c => c.id === enrollment.courseId) || {}

        return {
            ...payment,
            studentName: `${student.name || ''} ${student.lastName || ''}`.trim(),
            studentId: student.idNumber || '',
            courseName: course.name || '',
            courseCode: course.code || ''
        }
    })
}

/**
 * Calcula las estadísticas generales del dashboard.
 * @returns {Object} Objeto con totales
 */
export function getDashboardStats() {
    const students = getStudents()
    const courses = getCourses()
    const enrollments = getEnrollments()
    const payments = getPayments()

    // Sumar el monto total pagado
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    return {
        totalStudents: students.filter(s => s.status === 'Active').length,
        activeStudents: students.filter(s => s.status === 'Active').length,
        totalCourses: courses.filter(c => c.status === 'Active').length,
        totalEnrollments: enrollments.length,
        totalPayments: payments.length,
        totalRevenue: totalPaid
    }
}

export function getEnrollmentsByCourseSummary() {
  const courses = getCourses()
  const enrollments = getEnrollments().filter(e => e.status === 'Active')

  const counts = new Map()
  enrollments.forEach((e) => {
    counts.set(e.courseId, (counts.get(e.courseId) || 0) + 1)
  })

  return courses
    .filter(c => c.status === 'Active')
    .map(c => ({
      courseId: c.id,
      courseName: c.name,
      courseCode: c.code,
      studentsCount: counts.get(c.id) || 0
    }))
    .sort((a, b) => b.studentsCount - a.studentsCount)
}
