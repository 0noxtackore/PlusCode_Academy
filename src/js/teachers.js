/**
 * teachers.js — Módulo de gestión de docentes y nómina (MySQL/PHP API)
 * Contiene funciones CRUD asíncronas para docentes y pagos.
 */

import { api } from './apiClient.js'

// -----------------------------------------------------------------------
// Funciones CRUD para Docentes
// -----------------------------------------------------------------------
export async function getTeachers() {
    return (await api.get('teachers')) || []
}

export async function addTeacher(teacher) {
    return await api.post('teachers', teacher)
}

export async function updateTeacher(id, updates) {
    return await api.put('teachers', id, updates)
}

export async function deleteTeacher(id) {
    return await api.delete('teachers', id)
}

export async function getTeacherById(id) {
    return await api.get('teachers', id)
}

// -----------------------------------------------------------------------
// Funciones CRUD para Pagos de Docentes
// -----------------------------------------------------------------------
export async function getTeacherPayments() {
    return (await api.get('teacher_payments')) || []
}

export async function addTeacherPayment(payment) {
    return await api.post('teacher_payments', payment)
}

export async function updateTeacherPayment(id, updates) {
    return await api.put('teacher_payments', id, updates)
}

export async function deleteTeacherPayment(id) {
    return await api.delete('teacher_payments', id)
}

// -----------------------------------------------------------------------
// Cálculo de Nómina
// -----------------------------------------------------------------------
export async function calculateTeacherSalary(teacherId, hoursWorked, period, bonuses = 0, deductions = 0) {
    const teacher = await getTeacherById(teacherId)
    if (!teacher) {
        throw new Error('Teacher not found')
    }
    
    const baseSalary = hoursWorked * teacher.hourlyRate
    const totalSalary = baseSalary + bonuses - deductions
    
    return {
        teacherId: teacherId,
        period: period,
        hoursWorked: hoursWorked,
        hourlyRate: teacher.hourlyRate,
        baseSalary: baseSalary,
        bonuses: bonuses,
        deductions: deductions,
        totalSalary: totalSalary
    }
}

export async function recordTeacherPayroll({ teacherId, period, hoursWorked, bonuses = 0, deductions = 0, reference = '' }) {
    if (!teacherId) throw new Error('Teacher not found')
    if (!period) throw new Error('Period is required')
    if (!hoursWorked || Number(hoursWorked) <= 0) throw new Error('Hours worked must be greater than 0')

    const calc = await calculateTeacherSalary(
        Number(teacherId),
        Number(hoursWorked),
        period,
        Number(bonuses) || 0,
        Number(deductions) || 0
    )

    const payment = {
        ...calc,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Paid',
        reference: reference && String(reference).trim() !== ''
          ? String(reference).trim()
          : `SAL-${Date.now()}-${calc.teacherId}`
    }

    return await addTeacherPayment(payment)
}

// -----------------------------------------------------------------------
// Reportes y Análisis de Nómina
// -----------------------------------------------------------------------
export async function getPayrollSummary(period) {
    const paymentsRaw = await getTeacherPayments()
    const payments = paymentsRaw.filter(p => p.period === period)
    
    const totalPayroll = payments.reduce((sum, p) => sum + Number(p.totalSalary), 0)
    const totalHours = payments.reduce((sum, p) => sum + Number(p.hoursWorked), 0)
    const totalTeachers = payments.length
    
    return {
        period: period,
        totalPayroll: totalPayroll,
        totalHours: totalHours,
        totalTeachers: totalTeachers,
        averageSalary: totalTeachers > 0 ? totalPayroll / totalTeachers : 0,
        averageHourlyRate: totalHours > 0 ? totalPayroll / totalHours : 0
    }
}

export async function getTeacherPaymentHistory(teacherId) {
    const paymentsRaw = await getTeacherPayments()
    return paymentsRaw
        .filter(p => p.teacherId == teacherId)
        .sort((a, b) => new Date(b.period) - new Date(a.period))
}

export async function getActiveTeachersCount() {
    const teachers = await getTeachers()
    return teachers.filter(t => t.status === 'Active').length
}
