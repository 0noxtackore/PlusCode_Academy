/**
 * data.js — Módulo de datos del sistema (MySQL/PHP API)
 * Contiene funciones CRUD asíncronas para cada entidad consumiendo el backend.
 */

import { api } from './apiClient.js'

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializeData() {
  // Ya no inicializamos en localStorage
  console.log('App initialization using MySQL Backend')
}

// -----------------------------------------------------------------------
// STUDENTS CRUD
// -----------------------------------------------------------------------
export async function getStudents() {
    return (await api.get('students')) || []
}

export async function addStudent(student) {
    return await api.post('students', student)
}

export async function updateStudent(id, data) {
    return await api.put('students', id, data)
}

export async function deleteStudent(id) {
    return await api.delete('students', id)
}

export async function getStudentById(id) {
    return await api.get('students', id)
}

// -----------------------------------------------------------------------
// COURSES CRUD
// -----------------------------------------------------------------------
export async function getCourses() {
    return (await api.get('courses')) || []
}

export async function addCourse(course) {
    return await api.post('courses', course)
}

export async function updateCourse(id, data) {
    return await api.put('courses', id, data)
}

export async function deleteCourse(id) {
    return await api.delete('courses', id)
}

export async function getCourseById(id) {
    return await api.get('courses', id)
}

// -----------------------------------------------------------------------
// ENROLLMENTS CRUD
// -----------------------------------------------------------------------
export async function getEnrollments() {
    return (await api.get('enrollments')) || []
}

export async function addEnrollment(enrollment) {
    return await api.post('enrollments', enrollment)
}

export async function updateEnrollment(id, data) {
    return await api.put('enrollments', id, data)
}

export async function deleteEnrollment(id) {
    return await api.delete('enrollments', id)
}

// -----------------------------------------------------------------------
// PAYMENTS CRUD
// -----------------------------------------------------------------------
export async function getPayments() {
    return (await api.get('payments')) || []
}

export async function addPayment(payment) {
    return await api.post('payments', payment)
}

export async function updatePayment(id, data) {
    return await api.put('payments', id, data)
}

export async function deletePayment(id) {
    return await api.delete('payments', id)
}

// -----------------------------------------------------------------------
// Funciones de utilidad / joins (ahora en el cliente de forma simple)
// -----------------------------------------------------------------------
export async function getPaymentsWithDetails() {
    const [payments, enrollments, students, courses] = await Promise.all([
        getPayments(),
        getEnrollments(),
        getStudents(),
        getCourses()
    ])

    return payments.map(payment => {
        const enrollment = enrollments.find(e => e.id == payment.enrollmentId) || {}
        const student = students.find(s => s.id == enrollment.studentId) || {}
        const course = courses.find(c => c.id == enrollment.courseId) || {}

        return {
            ...payment,
            studentName: `${student.name || ''} ${student.lastName || ''}`.trim(),
            studentId: student.idNumber || '',
            courseName: course.name || '',
            courseCode: course.code || ''
        }
    })
}

export async function getDashboardStats() {
    const [students, courses, enrollments, payments] = await Promise.all([
        getStudents(),
        getCourses(),
        getEnrollments(),
        getPayments()
    ])

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

export async function getEnrollmentsByCourseSummary() {
  const [courses, enrollmentsRaw] = await Promise.all([
      getCourses(),
      getEnrollments()
  ])
  const enrollments = enrollmentsRaw.filter(e => e.status === 'Active')

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
