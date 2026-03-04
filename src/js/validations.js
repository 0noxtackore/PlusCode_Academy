/**
 * validations.js — Módulo de validaciones de negocio
 * Contiene todas las reglas de validación para el sistema académico
 */

import { getStudents, getCourses, getEnrollments, getPayments } from './data.js'
import { getExpenses } from './expenses.js'

// -----------------------------------------------------------------------
// Validaciones de Estudiantes
// -----------------------------------------------------------------------
export function validateStudent(studentData) {
    const errors = []
    
    // Validar cédula única
    if (!studentData.idNumber || studentData.idNumber.trim() === '') {
        errors.push('ID number is required')
    } else {
        const students = getStudents()
        const existingStudent = students.find(s => 
            s.idNumber === studentData.idNumber && 
            s.id !== studentData.id
        )
        if (existingStudent) {
            errors.push('ID number already exists')
        }
    }
    
    // Validar email único
    if (studentData.email && studentData.email.trim() !== '') {
        const students = getStudents()
        const existingEmail = students.find(s => 
            s.email === studentData.email && 
            s.id !== studentData.id
        )
        if (existingEmail) {
            errors.push('Email already exists')
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(studentData.email)) {
            errors.push('Invalid email format')
        }
    }
    
    // Validar campos requeridos
    if (!studentData.name || studentData.name.trim() === '') {
        errors.push('First name is required')
    }
    
    if (!studentData.lastName || studentData.lastName.trim() === '') {
        errors.push('Last name is required')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Cursos
// -----------------------------------------------------------------------
export function validateCourse(courseData) {
    const errors = []
    
    // Validar código único
    if (!courseData.code || courseData.code.trim() === '') {
        errors.push('Course code is required')
    } else {
        const courses = getCourses()
        const existingCourse = courses.find(c => 
            c.code === courseData.code && 
            c.id !== courseData.id
        )
        if (existingCourse) {
            errors.push('Course code already exists')
        }
    }
    
    // Validar campos requeridos
    if (!courseData.name || courseData.name.trim() === '') {
        errors.push('Course name is required')
    }
    
    if (!courseData.credits || courseData.credits <= 0) {
        errors.push('Credits must be greater than 0')
    }
    
    if (!courseData.fee || courseData.fee <= 0) {
        errors.push('Fee must be greater than 0')
    }
    
    // Validar capacidad máxima
    if (courseData.maxCapacity && courseData.maxCapacity <= 0) {
        errors.push('Maximum capacity must be greater than 0')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Matrículas
// -----------------------------------------------------------------------
export function validateEnrollment(enrollmentData) {
    const errors = []
    
    // Validar que el estudiante exista
    const students = getStudents()
    const student = students.find(s => s.id === enrollmentData.studentId)
    if (!student) {
        errors.push('Student not found')
    } else if (student.status !== 'Active') {
        errors.push('Cannot enroll inactive students')
    }
    
    // Validar que el curso exista
    const courses = getCourses()
    const course = courses.find(c => c.id === enrollmentData.courseId)
    if (!course) {
        errors.push('Course not found')
    } else if (course.status !== 'Active') {
        errors.push('Cannot enroll in inactive courses')
    }
    
    // Validar cupos disponibles
    if (course) {
        const enrollments = getEnrollments()
        const currentEnrollments = enrollments.filter(e => 
            e.courseId === enrollmentData.courseId && 
            e.status === 'Active'
        ).length
        
        if (currentEnrollments >= course.maxCapacity) {
            errors.push('Course has reached maximum capacity')
        }
    }
    
    // Validar matrícula duplicada
    const enrollments = getEnrollments()
    const existingEnrollment = enrollments.find(e => 
        e.studentId === enrollmentData.studentId && 
        e.courseId === enrollmentData.courseId && 
        e.status === 'Active' &&
        e.id !== enrollmentData.id
    )
    if (existingEnrollment) {
        errors.push('Student is already enrolled in this course')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Pagos
// -----------------------------------------------------------------------
export function validatePayment(paymentData) {
    const errors = []
    
    // Validar que la matrícula exista
    const enrollments = getEnrollments()
    const enrollment = enrollments.find(e => e.id === paymentData.enrollmentId)
    if (!enrollment) {
        errors.push('Enrollment not found')
    }
    
    // Validar referencia única
    if (paymentData.reference && paymentData.reference.trim() !== '') {
        const payments = getPayments()
        const existingPayment = payments.find(p => 
            p.reference === paymentData.reference && 
            p.id !== paymentData.id
        )
        if (existingPayment) {
            errors.push('Payment reference already exists')
        }
    }
    
    // Validar campos requeridos
    if (!paymentData.amount || paymentData.amount <= 0) {
        errors.push('Payment amount must be greater than 0')
    }
    
    if (!paymentData.paymentDate) {
        errors.push('Payment date is required')
    }
    
    if (!paymentData.method) {
        errors.push('Payment method is required')
    }
    
    // Validar que la fecha no sea futura
    if (paymentData.paymentDate) {
        const paymentDate = new Date(paymentData.paymentDate)
        const today = new Date()
        if (paymentDate > today) {
            errors.push('Payment date cannot be in the future')
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// -----------------------------------------------------------------------
// Validaciones de Egresos
// -----------------------------------------------------------------------
export function validateExpense(expenseData) {
    const errors = []
    
    // Validar campos requeridos
    if (!expenseData.categoryId) {
        errors.push('Expense category is required')
    }
    
    if (!expenseData.description || expenseData.description.trim() === '') {
        errors.push('Expense description is required')
    }
    
    if (!expenseData.amount || expenseData.amount <= 0) {
        errors.push('Expense amount must be greater than 0')
    }
    
    if (!expenseData.date) {
        errors.push('Expense date is required')
    }
    
    if (!expenseData.paymentMethod) {
        errors.push('Payment method is required')
    }
    
    // Validar que la fecha no sea futura
    if (expenseData.date) {
        const expenseDate = new Date(expenseData.date)
        const today = new Date()
        if (expenseDate > today) {
            errors.push('Expense date cannot be in the future')
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
export function validateCourseCapacity(courseId) {
    const course = getCourses().find(c => c.id === courseId)
    if (!course) {
        return { isValid: false, errors: ['Course not found'] }
    }
    
    const enrollments = getEnrollments().filter(e => 
        e.courseId === courseId && e.status === 'Active'
    )
    
    const isFull = enrollments.length >= course.maxCapacity
    
    return {
        isValid: !isFull,
        errors: isFull ? ['Course has reached maximum capacity'] : [],
        currentEnrollment: enrollments.length,
        maxCapacity: course.maxCapacity,
        availableSlots: course.maxCapacity - enrollments.length
    }
}

export function validatePaymentReference(reference, excludeId = null) {
    const payments = getPayments()
    const existingPayment = payments.find(p => 
        p.reference === reference && 
        p.id !== excludeId
    )
    
    return {
        isValid: !existingPayment,
        errors: existingPayment ? ['Payment reference already exists'] : []
    }
}

export function validateStudentStatus(studentId) {
    const student = getStudents().find(s => s.id === studentId)
    
    if (!student) {
        return { isValid: false, errors: ['Student not found'], status: null }
    }
    
    const isActive = student.status === 'Active'
    
    return {
        isValid: isActive,
        errors: isActive ? [] : ['Student is not active'],
        status: student.status
    }
}

export function validateCourseStatus(courseId) {
    const course = getCourses().find(c => c.id === courseId)
    
    if (!course) {
        return { isValid: false, errors: ['Course not found'], status: null }
    }
    
    const isActive = course.status === 'Active'
    
    return {
        isValid: isActive,
        errors: isActive ? [] : ['Course is not active'],
        status: course.status
    }
}

// -----------------------------------------------------------------------
// Funciones de utilidad para validaciones
// -----------------------------------------------------------------------
export function formatValidationErrors(errors) {
    return errors.map(error => `• ${error}`).join('\n')
}

export function showValidationAlert(errors) {
    alert(`Validation Errors:\n\n${formatValidationErrors(errors)}`)
}

// -----------------------------------------------------------------------
// Validaciones de integridad de datos
// -----------------------------------------------------------------------
export function validateDataIntegrity() {
    const issues = []
    
    // Verificar matrículas huérfanas
    const enrollments = getEnrollments()
    const students = getStudents()
    const courses = getCourses()
    
    enrollments.forEach(enrollment => {
        const studentExists = students.some(s => s.id === enrollment.studentId)
        const courseExists = courses.some(c => c.id === enrollment.courseId)
        
        if (!studentExists) {
            issues.push(`Enrollment ${enrollment.id} references non-existent student ${enrollment.studentId}`)
        }
        
        if (!courseExists) {
            issues.push(`Enrollment ${enrollment.id} references non-existent course ${enrollment.courseId}`)
        }
    })
    
    // Verificar pagos huérfanos
    const payments = getPayments()
    payments.forEach(payment => {
        const enrollmentExists = enrollments.some(e => e.id === payment.enrollmentId)
        if (!enrollmentExists) {
            issues.push(`Payment ${payment.id} references non-existent enrollment ${payment.enrollmentId}`)
        }
    })
    
    // Verificar consistencia de cupos
    courses.forEach(course => {
        const actualEnrollment = enrollments.filter(e => 
            e.courseId === course.id && e.status === 'Active'
        ).length
        
        if (course.currentEnrollment !== actualEnrollment) {
            issues.push(`Course ${course.code} has inconsistent enrollment count: ${course.currentEnrollment} vs ${actualEnrollment}`)
        }
    })
    
    return {
        hasIssues: issues.length > 0,
        issues: issues
    }
}
