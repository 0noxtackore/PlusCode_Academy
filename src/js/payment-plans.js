/**
 * payment-plans.js — Módulo de planes de pago y control de deuda
 * Contiene funciones para generar planes de pago automáticos y controlar la deuda de estudiantes
 */

import { getStudents, getCourses, getEnrollments } from './data.js'
import { getPayments } from './data.js'

// -----------------------------------------------------------------------
// Claves de localStorage
// -----------------------------------------------------------------------
const KEYS = {
    paymentPlans: 'academy_payment_plans',
    studentDebts: 'academy_student_debts'
}

// -----------------------------------------------------------------------
// Configuración de planes de pago
// -----------------------------------------------------------------------
const PAYMENT_PLAN_CONFIG = {
    default: {
        inscriptionPercentage: 0.3,      // 30% de inscripción
        monthlyInstallments: 4,          // 4 cuotas mensuales
        gracePeriodDays: 7              // 7 días de gracia
    },
    premium: {
        inscriptionPercentage: 0.5,      // 50% de inscripción
        monthlyInstallments: 2,          // 2 cuotas mensuales
        gracePeriodDays: 10             // 10 días de gracia
    }
}

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializePaymentPlans() {
    if (!localStorage.getItem(KEYS.paymentPlans)) {
        localStorage.setItem(KEYS.paymentPlans, JSON.stringify([]))
    }
    if (!localStorage.getItem(KEYS.studentDebts)) {
        localStorage.setItem(KEYS.studentDebts, JSON.stringify([]))
    }
}

// -----------------------------------------------------------------------
// Generación automática de planes de pago
// -----------------------------------------------------------------------
export function generatePaymentPlan(enrollmentId, planType = 'default') {
    const enrollments = getEnrollments()
    const courses = getCourses()
    
    const enrollment = enrollments.find(e => e.id === enrollmentId)
    if (!enrollment) {
        throw new Error('Enrollment not found')
    }
    
    const course = courses.find(c => c.id === enrollment.courseId)
    if (!course) {
        throw new Error('Course not found')
    }
    
    const config = PAYMENT_PLAN_CONFIG[planType] || PAYMENT_PLAN_CONFIG.default
    const totalFee = course.fee
    
    // Calcular montos
    const inscriptionAmount = totalFee * config.inscriptionPercentage
    const remainingAmount = totalFee - inscriptionAmount
    const monthlyAmount = remainingAmount / config.monthlyInstallments
    
    // Generar fechas de pago
    const enrollmentDate = new Date(enrollment.enrollmentDate)
    const payments = []
    
    // Pago de inscripción (inmediato)
    payments.push({
        id: 1,
        description: 'Inscription Payment',
        amount: inscriptionAmount,
        dueDate: enrollmentDate.toISOString().split('T')[0],
        status: 'pending',
        type: 'inscription'
    })
    
    // Cuotas mensuales
    for (let i = 1; i <= config.monthlyInstallments; i++) {
        const dueDate = new Date(enrollmentDate)
        dueDate.setMonth(dueDate.getMonth() + i)
        
        payments.push({
            id: i + 1,
            description: `Monthly Installment ${i}/${config.monthlyInstallments}`,
            amount: monthlyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending',
            type: 'installment'
        })
    }
    
    const paymentPlan = {
        id: Date.now(),
        enrollmentId: enrollmentId,
        planType: planType,
        totalAmount: totalFee,
        inscriptionAmount: inscriptionAmount,
        monthlyAmount: monthlyAmount,
        installmentsCount: config.monthlyInstallments,
        payments: payments,
        createdAt: new Date().toISOString(),
        status: 'active'
    }
    
    // Guardar plan de pago
    const plans = getPaymentPlans()
    plans.push(paymentPlan)
    localStorage.setItem(KEYS.paymentPlans, JSON.stringify(plans))
    
    // Actualizar deuda del estudiante
    updateStudentDebt(enrollment.studentId, paymentPlan)
    
    return paymentPlan
}

// -----------------------------------------------------------------------
// Funciones CRUD para planes de pago
// -----------------------------------------------------------------------
export function getPaymentPlans() {
    const data = localStorage.getItem(KEYS.paymentPlans)
    return data ? JSON.parse(data) : []
}

export function getPaymentPlansByStudent(studentId) {
    const plans = getPaymentPlans()
    const enrollments = getEnrollments()
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId)
    
    return plans.filter(plan => 
        studentEnrollments.some(e => e.id === plan.enrollmentId)
    )
}

export function updatePaymentPlanStatus(planId, paymentId, status) {
    const plans = getPaymentPlans()
    const planIndex = plans.findIndex(p => p.id === planId)
    
    if (planIndex !== -1) {
        const paymentIndex = plans[planIndex].payments.findIndex(p => p.id === paymentId)
        if (paymentIndex !== -1) {
            plans[planIndex].payments[paymentIndex].status = status
            
            // Actualizar estado general del plan
            const allPaid = plans[planIndex].payments.every(p => p.status === 'paid')
            if (allPaid) {
                plans[planIndex].status = 'completed'
            }
            
            localStorage.setItem(KEYS.paymentPlans, JSON.stringify(plans))
            
            // Actualizar deuda del estudiante
            const enrollment = getEnrollments().find(e => e.id === plans[planIndex].enrollmentId)
            if (enrollment) {
                updateStudentDebt(enrollment.studentId, plans[planIndex])
            }
        }
    }
}

// -----------------------------------------------------------------------
// Control de deuda de estudiantes
// -----------------------------------------------------------------------
export function updateStudentDebt(studentId, paymentPlan) {
    const debts = getStudentDebts()
    const existingDebtIndex = debts.findIndex(d => d.studentId === studentId && d.enrollmentId === paymentPlan.enrollmentId)
    
    const pendingPayments = paymentPlan.payments.filter(p => p.status === 'pending')
    const totalDebt = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    
    const debtRecord = {
        studentId: studentId,
        enrollmentId: paymentPlan.enrollmentId,
        totalAmount: paymentPlan.totalAmount,
        paidAmount: paymentPlan.totalAmount - totalDebt,
        remainingDebt: totalDebt,
        pendingPayments: pendingPayments.length,
        nextPaymentDate: pendingPayments.length > 0 ? pendingPayments[0].dueDate : null,
        status: totalDebt === 0 ? 'paid' : pendingPayments.length > 0 ? 'active' : 'overdue',
        lastUpdated: new Date().toISOString()
    }
    
    if (existingDebtIndex !== -1) {
        debts[existingDebtIndex] = debtRecord
    } else {
        debts.push(debtRecord)
    }
    
    localStorage.setItem(KEYS.studentDebts, JSON.stringify(debts))
}

export function getStudentDebts() {
    const data = localStorage.getItem(KEYS.studentDebts)
    return data ? JSON.parse(data) : []
}

export function getStudentDebtSummary(studentId) {
    const debts = getStudentDebts().filter(d => d.studentId === studentId)
    
    const totalDebt = debts.reduce((sum, d) => sum + d.remainingDebt, 0)
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0)
    const totalPending = debts.reduce((sum, d) => sum + d.pendingPayments, 0)
    
    // Encontrar próxima fecha de pago
    const nextPayments = debts
        .filter(d => d.nextPaymentDate)
        .map(d => new Date(d.nextPaymentDate))
        .sort((a, b) => a - b)
    
    return {
        studentId: studentId,
        totalDebt: totalDebt,
        totalPaid: totalPaid,
        totalPendingPayments: totalPending,
        nextPaymentDate: nextPayments.length > 0 ? nextPayments[0].toISOString().split('T')[0] : null,
        status: totalDebt === 0 ? 'paid' : 'active',
        debtCount: debts.length
    }
}

// -----------------------------------------------------------------------
// Reportes y análisis
// -----------------------------------------------------------------------
export function getDebtorsReport() {
    const students = getStudents()
    const debts = getStudentDebts()
    
    const debtors = debts
        .filter(d => d.remainingDebt > 0)
        .map(debt => {
            const student = students.find(s => s.id === debt.studentId)
            return {
                ...debt,
                studentName: student ? `${student.name} ${student.lastName}` : 'Unknown',
                studentIdNumber: student ? student.idNumber : 'N/A',
                studentEmail: student ? student.email : 'N/A'
            }
        })
        .sort((a, b) => b.remainingDebt - a.remainingDebt)
    
    return debtors
}

export function getOverduePayments() {
    const plans = getPaymentPlans()
    const today = new Date().toISOString().split('T')[0]
    
    const overduePayments = []
    
    plans.forEach(plan => {
        plan.payments.forEach(payment => {
            if (payment.status === 'pending' && payment.dueDate < today) {
                overduePayments.push({
                    ...payment,
                    planId: plan.id,
                    enrollmentId: plan.enrollmentId,
                    daysOverdue: Math.floor((new Date(today) - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))
                })
            }
        })
    })
    
    return overduePayments.sort((a, b) => b.daysOverdue - a.daysOverdue)
}

export function getPaymentPlanSummary(enrollmentId) {
    const plans = getPaymentPlans()
    const plan = plans.find(p => p.enrollmentId === enrollmentId)
    
    if (!plan) {
        return null
    }
    
    const paidPayments = plan.payments.filter(p => p.status === 'paid')
    const pendingPayments = plan.payments.filter(p => p.status === 'pending')
    const paidAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    
    return {
        ...plan,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
        progressPercentage: (paidAmount / plan.totalAmount) * 100,
        nextPayment: pendingPayments.length > 0 ? pendingPayments[0] : null
    }
}
