/**
 * validations.js — Módulo de validaciones de negocio
 * Contiene todas las reglas de validación para el sistema académico
 */

import { getStudents, getCourses, getEnrollments, getPayments } from './data.js'
import { getExpenses } from './expenses.js'

// -----------------------------------------------------------------------
// Validaciones de Estudiantes
// -----------------------------------------------------------------------
export async function validateStudent(studentData) {
    const errors = []
    const students = await getStudents()
    
    // Validar cédula única
    if (!studentData.idNumber || String(studentData.idNumber).trim() === '') {
        errors.push('El número de identificación es requerido')
    } else {
        const existingStudent = students.find(s => 
            s.idNumber === studentData.idNumber && 
            s.id !== studentData.id
        )
        if (existingStudent) {
            errors.push('El número de identificación ya existe')
        }
    }
    
    // Validar email único
    if (studentData.email && studentData.email.trim() !== '') {
        const existingEmail = students.find(s => 
            s.email === studentData.email && 
            s.id !== studentData.id
        )
        if (existingEmail) {
            errors.push('El correo electrónico ya existe')
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(studentData.email)) {
            errors.push('Formato de correo electrónico inválido')
        }
    }
    
    // Validar campos requeridos
    if (!studentData.name || studentData.name.trim() === '') {
        errors.push('El nombre es requerido')
    }
    
    if (!studentData.lastName || studentData.lastName.trim() === '') {
        errors.push('El apellido es requerido')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Cursos
// -----------------------------------------------------------------------
export async function validateCourse(courseData) {
    const errors = []
    const courses = await getCourses()
    
    // Validar código único
    if (!courseData.code || String(courseData.code).trim() === '') {
        errors.push('El código del curso es requerido')
    } else {
        const existingCourse = courses.find(c => 
            c.code === courseData.code && 
            c.id !== courseData.id
        )
        if (existingCourse) {
            errors.push('El código del curso ya existe')
        }
    }
    
    // Validar campos requeridos
    if (!courseData.name || courseData.name.trim() === '') {
        errors.push('El nombre del curso es requerido')
    }
    
    if (!courseData.credits || courseData.credits <= 0) {
        errors.push('Los créditos deben ser mayores a 0')
    }
    
    if (!courseData.fee || courseData.fee <= 0) {
        errors.push('El costo debe ser mayor a 0')
    }
    
    // Validar capacidad máxima
    if (courseData.maxCapacity !== undefined && Number(courseData.maxCapacity) < 0) {
        errors.push('La capacidad máxima no puede ser negativa')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Matrículas
// -----------------------------------------------------------------------
export async function validateEnrollment(enrollmentData) {
    const errors = []
    
    // Validar que el estudiante exista
    const students = await getStudents()
    const student = students.find(s => s.id == enrollmentData.studentId)
    if (!student) {
        errors.push('Estudiante no encontrado')
    } else if (student.status !== 'Active') {
        errors.push('No se puede matricular a un estudiante inactivo')
    }
    
    // Validar que el curso exista
    const courses = await getCourses()
    const course = courses.find(c => c.id == enrollmentData.courseId)
    if (!course) {
        errors.push('Curso no encontrado')
    } else if (course.status !== 'Active') {
        errors.push('No se puede matricular en un curso inactivo')
    }
    
    const enrollments = await getEnrollments()

    // Validar cupos disponibles
    if (course) {
        const currentEnrollments = enrollments.filter(e => 
            e.courseId == enrollmentData.courseId && 
            e.status === 'Active'
        ).length
        
        // Si maxCapacity es 0 o null, asumimos 999
        const rawCap = Number(course.maxCapacity)
        const maxCapacity = (rawCap > 0) ? rawCap : 999 

        if (currentEnrollments >= maxCapacity) {
            errors.push(`El curso ha alcanzado su capacidad máxima (${maxCapacity})`)
        }
    }
    
    // Validar matrícula duplicada
    const existingEnrollment = enrollments.find(e => 
        e.studentId == enrollmentData.studentId && 
        e.courseId == enrollmentData.courseId && 
        e.status === 'Active' &&
        e.id != enrollmentData.id
    )
    if (existingEnrollment) {
        errors.push('El estudiante ya está matriculado en este curso')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Pagos
// -----------------------------------------------------------------------
export async function validatePayment(paymentData) {
    const errors = []
    
    // Validar que la matrícula exista
    const enrollments = await getEnrollments()
    const enrollment = enrollments.find(e => e.id == paymentData.enrollmentId)
    if (!enrollment) {
        errors.push('Matrícula no encontrada')
    }
    
    // Validar referencia única
    if (paymentData.reference && paymentData.reference.trim() !== '') {
        const payments = await getPayments()
        const existingPayment = payments.find(p => 
            p.reference === paymentData.reference && 
            p.id != paymentData.id
        )
        if (existingPayment) {
            errors.push('La referencia de pago ya existe')
        }
    }
    
    // Validar campos requeridos
    if (!paymentData.amount || paymentData.amount <= 0) {
        errors.push('El monto del pago debe ser mayor a 0')
    }
    
    if (!paymentData.paymentDate) {
        errors.push('La fecha de pago es requerida')
    }
    
    if (!paymentData.method) {
        errors.push('El método de pago es requerido')
    }
    
    // Validar que la fecha no sea futura
    if (paymentData.paymentDate) {
        const paymentDate = new Date(paymentData.paymentDate)
        const today = new Date()
        if (paymentDate > today) {
            errors.push('La fecha de pago no puede ser futura')
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Negocio Adicionales
// -----------------------------------------------------------------------
export async function validateCourseCapacity(courseId) {
    const courses = await getCourses()
    const course = courses.find(c => c.id == courseId)
    if (!course) {
        return { isValid: false, errors: ['Curso no encontrado'] }
    }
    
    const enrollments = await getEnrollments()
    const courseEnrollments = enrollments.filter(e => 
        e.courseId == courseId && e.status === 'Active'
    )
    
    const rawCap = Number(course.maxCapacity)
    const maxCapacity = (rawCap > 0) ? rawCap : 999
    const isFull = courseEnrollments.length >= maxCapacity
    
    return {
        isValid: !isFull,
        errors: isFull ? [`El curso ha alcanzado su capacidad máxima (${maxCapacity})`] : [],
        currentEnrollment: courseEnrollments.length,
        maxCapacity: maxCapacity,
        availableSlots: maxCapacity - courseEnrollments.length
    }
}

// -----------------------------------------------------------------------
// Funciones de utilidad para validaciones
// -----------------------------------------------------------------------
export function formatValidationErrors(errors) {
    return errors.map(error => `• ${error}`).join('\n')
}
