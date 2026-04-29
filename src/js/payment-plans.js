/**
 * payment-plans.js — Módulo de control de deuda
 * Refactorizado para calcular la deuda dinámicamente usando la API.
 */

import { getStudents, getCourses, getEnrollments, getPayments } from './data.js'

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export async function initializePaymentPlans() {
    // Ya no es necesario inicializar localStorage
    return true
}

export async function generatePaymentPlan(enrollmentId, planType = 'default') {
    // La generación de planes de pago estáticos en localStorage se ha eliminado
    // La deuda se calcula dinámicamente
    return null
}

export async function getPaymentPlans() {
    return []
}

// -----------------------------------------------------------------------
// Reportes y análisis
// -----------------------------------------------------------------------
export async function getDebtorsReport() {
    const students = await getStudents()
    const enrollments = (await getEnrollments()).filter(e => e.status === 'Active')
    const courses = await getCourses()
    const payments = await getPayments()
    
    const debtors = []
    
    for (const enrollment of enrollments) {
        const course = courses.find(c => c.id == enrollment.courseId)
        if (!course) continue
        
        const totalFee = Number(course.fee) || 0
        const enrollmentPayments = payments.filter(p => p.enrollmentId == enrollment.id)
        const paidAmount = enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        
        if (paidAmount < totalFee) {
            const student = students.find(s => s.id == enrollment.studentId)
            debtors.push({
                enrollmentId: enrollment.id,
                studentId: enrollment.studentId,
                totalAmount: totalFee,
                paidAmount: paidAmount,
                remainingDebt: totalFee - paidAmount,
                pendingPayments: 1, // Simplificado, todo se consolida
                nextPaymentDate: null,
                studentName: student ? `${student.name} ${student.lastName}` : 'Unknown',
                studentIdNumber: student ? student.idNumber : 'N/A',
                studentEmail: student ? student.email : 'N/A'
            })
        }
    }
    
    return debtors.sort((a, b) => b.remainingDebt - a.remainingDebt)
}

export async function getOverduePayments() {
    // La funcionalidad de pagos vencidos requeriría tablas de cuotas en MySQL
    // Por ahora retornamos vacío
    return []
}

export async function getPaymentPlanSummary(enrollmentId) {
    const enrollments = await getEnrollments()
    const enrollment = enrollments.find(e => e.id == enrollmentId)
    if (!enrollment) return null
    
    const courses = await getCourses()
    const course = courses.find(c => c.id == enrollment.courseId)
    if (!course) return null
    
    const payments = await getPayments()
    const enrollmentPayments = payments.filter(p => p.enrollmentId == enrollmentId)
    const paidAmount = enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    
    const totalFee = Number(course.fee) || 0
    const pendingAmount = Math.max(0, totalFee - paidAmount)
    
    return {
        enrollmentId: enrollmentId,
        totalAmount: totalFee,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
        progressPercentage: totalFee > 0 ? (paidAmount / totalFee) * 100 : 100,
        nextPayment: null
    }
}

export async function getStudentDebtSummary(studentId) {
    const enrollments = (await getEnrollments()).filter(e => e.studentId == studentId && e.status === 'Active')
    const courses = await getCourses()
    const payments = await getPayments()
    
    let totalDebt = 0
    let totalPaid = 0
    let totalOriginal = 0
    
    for (const enrollment of enrollments) {
        const course = courses.find(c => c.id == enrollment.courseId)
        if (!course) continue
        
        const enrollmentPayments = payments.filter(p => p.enrollmentId == enrollment.id)
        const paid = enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        const fee = Number(course.fee) || 0
        
        totalOriginal += fee
        totalPaid += paid
        totalDebt += Math.max(0, fee - paid)
    }
    
    return {
        totalDebt,
        totalPaid,
        totalOriginal,
        isSolvent: totalDebt <= 0
    }
}
