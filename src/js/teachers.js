/**
 * teachers.js — Módulo de gestión de docentes y nómina
 * Contiene funciones CRUD para docentes y cálculo de honorarios
 */

// -----------------------------------------------------------------------
// Claves de localStorage
// -----------------------------------------------------------------------
const KEYS = {
    teachers: 'academy_teachers',
    teacherPayments: 'academy_teacher_payments',
    salaryHistory: 'academy_salary_history'
}

// -----------------------------------------------------------------------
// Datos iniciales
// -----------------------------------------------------------------------
const pad2 = (n) => String(n).padStart(2, '0')

const toYMD = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`
}

const monthsAgo = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d
}

const INITIAL_TEACHERS = [
    {
        id: 1,
        idNumber: 'V-18.902.441',
        name: 'Carolina',
        lastName: 'Briceño',
        email: 'carolina.briceno@pluscode.edu',
        phone: '+58 414-555-2441',
        specialty: 'DevSecOps',
        hourlyRate: 18.50,
        weeklyHours: 8,
        status: 'Active',
        hireDate: toYMD(monthsAgo(14))
    },
    {
        id: 2,
        idNumber: 'V-21.774.609',
        name: 'Miguel',
        lastName: 'Torres',
        email: 'miguel.torres@pluscode.edu',
        phone: '+58 412-555-4609',
        specialty: 'Business Intelligence',
        hourlyRate: 16.00,
        weeklyHours: 6,
        status: 'Active',
        hireDate: toYMD(monthsAgo(10))
    },
    {
        id: 3,
        idNumber: 'V-20.118.337',
        name: 'Daniela',
        lastName: 'López',
        email: 'daniela.lopez@pluscode.edu',
        phone: '+58 424-555-8337',
        specialty: 'AdTech',
        hourlyRate: 15.50,
        weeklyHours: 6,
        status: 'Active',
        hireDate: toYMD(monthsAgo(8))
    },
    {
        id: 4,
        idNumber: 'V-16.330.918',
        name: 'Alejandro',
        lastName: 'Sánchez',
        email: 'alejandro.sanchez@pluscode.edu',
        phone: '+58 416-555-0918',
        specialty: 'Branding con IA',
        hourlyRate: 14.75,
        weeklyHours: 5,
        status: 'Active',
        hireDate: toYMD(monthsAgo(6))
    }
]

const INITIAL_TEACHER_PAYMENTS = [
    {
        id: 1,
        teacherId: 1,
        period: new Date().toISOString().slice(0, 7),
        hoursWorked: 48,
        hourlyRate: 18.50,
        baseSalary: 888.00,
        bonuses: 60.00,
        deductions: 38.00,
        totalSalary: 910.00,
        paymentDate: toYMD(new Date()),
        status: 'Paid',
        reference: 'SAL-0101'
    },
    {
        id: 2,
        teacherId: 2,
        period: new Date().toISOString().slice(0, 7),
        hoursWorked: 44,
        hourlyRate: 16.00,
        baseSalary: 704.00,
        bonuses: 40.00,
        deductions: 22.00,
        totalSalary: 722.00,
        paymentDate: toYMD(new Date()),
        status: 'Paid',
        reference: 'SAL-0102'
    }
]

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializeTeachersData() {
    if (!localStorage.getItem(KEYS.teachers)) {
        localStorage.setItem(KEYS.teachers, JSON.stringify(INITIAL_TEACHERS))
    }
    if (!localStorage.getItem(KEYS.teacherPayments)) {
        localStorage.setItem(KEYS.teacherPayments, JSON.stringify(INITIAL_TEACHER_PAYMENTS))
    }
    if (!localStorage.getItem(KEYS.salaryHistory)) {
        localStorage.setItem(KEYS.salaryHistory, JSON.stringify([]))
    }
}

// -----------------------------------------------------------------------
// Funciones CRUD para Docentes
// -----------------------------------------------------------------------
export function getTeachers() {
    const data = localStorage.getItem(KEYS.teachers)
    return data ? JSON.parse(data) : []
}

export function addTeacher(teacher) {
    const teachers = getTeachers()
    const newTeacher = {
        id: teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
        ...teacher,
        hireDate: teacher.hireDate || new Date().toISOString().split('T')[0],
        weeklyHours: teacher.weeklyHours ?? 0,
        status: teacher.status || 'Active'
    }
    teachers.push(newTeacher)
    localStorage.setItem(KEYS.teachers, JSON.stringify(teachers))
    return newTeacher
}

export function updateTeacher(id, updates) {
    const teachers = getTeachers()
    const index = teachers.findIndex(t => t.id === id)
    if (index !== -1) {
        teachers[index] = { ...teachers[index], ...updates }
        if (teachers[index].weeklyHours === undefined || teachers[index].weeklyHours === null) {
          teachers[index].weeklyHours = 0
        }
        localStorage.setItem(KEYS.teachers, JSON.stringify(teachers))
        return teachers[index]
    }
    return null
}

export function deleteTeacher(id) {
    const teachers = getTeachers().filter(t => t.id !== id)
    localStorage.setItem(KEYS.teachers, JSON.stringify(teachers))
    return true
}

export function getTeacherById(id) {
    return getTeachers().find(t => t.id === id)
}

// -----------------------------------------------------------------------
// Funciones CRUD para Pagos de Docentes
// -----------------------------------------------------------------------
export function getTeacherPayments() {
    const data = localStorage.getItem(KEYS.teacherPayments)
    return data ? JSON.parse(data) : []
}

export function addTeacherPayment(payment) {
    const payments = getTeacherPayments()
    const newPayment = {
        id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
        ...payment,
        createdAt: new Date().toISOString()
    }
    payments.push(newPayment)
    localStorage.setItem(KEYS.teacherPayments, JSON.stringify(payments))
    
    // Actualizar historial de salarios
    updateSalaryHistory(newPayment)
    
    return newPayment
}

export function updateTeacherPayment(id, updates) {
    const payments = getTeacherPayments()
    const index = payments.findIndex(p => p.id === id)
    if (index !== -1) {
        payments[index] = { ...payments[index], ...updates }
        localStorage.setItem(KEYS.teacherPayments, JSON.stringify(payments))
        return payments[index]
    }
    return null
}

export function deleteTeacherPayment(id) {
    const payments = getTeacherPayments().filter(p => p.id !== id)
    localStorage.setItem(KEYS.teacherPayments, JSON.stringify(payments))
    return true
}

// -----------------------------------------------------------------------
// Cálculo de Nómina
// -----------------------------------------------------------------------
export function calculateTeacherSalary(teacherId, hoursWorked, period, bonuses = 0, deductions = 0) {
    const teacher = getTeacherById(teacherId)
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

export function recordTeacherPayroll({ teacherId, period, hoursWorked, bonuses = 0, deductions = 0, reference = '' }) {
    if (!teacherId) throw new Error('Teacher not found')
    if (!period) throw new Error('Period is required')
    if (!hoursWorked || Number(hoursWorked) <= 0) throw new Error('Hours worked must be greater than 0')

    const calc = calculateTeacherSalary(
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

    return addTeacherPayment(payment)
}

export function generateMonthlyPayroll(period) {
    const teachers = getTeachers()
    const payroll = []
    
    teachers.filter(t => t.status === 'Active').forEach(teacher => {
        // Simular horas trabajadas (en un sistema real vendría de un sistema de asistencia)
        const hoursWorked = Math.floor(Math.random() * 20) + 30 // 30-50 horas
        
        const salaryCalculation = calculateTeacherSalary(
            teacher.id, 
            hoursWorked, 
            period,
            0, // bonuses
            0  // deductions
        )
        
        payroll.push({
            teacher: teacher,
            ...salaryCalculation,
            status: 'Pending'
        })
    })
    
    return payroll
}

export function processPayroll(period, payrollData) {
    const processedPayments = []
    
    payrollData.forEach(payrollItem => {
        const payment = {
            ...payrollItem,
            paymentDate: new Date().toISOString().split('T')[0],
            status: 'Paid',
            reference: `SAL-${Date.now()}-${payrollItem.teacherId}`
        }
        
        const savedPayment = addTeacherPayment(payment)
        processedPayments.push(savedPayment)
    })
    
    return processedPayments
}

// -----------------------------------------------------------------------
// Reportes y Análisis de Nómina
// -----------------------------------------------------------------------
export function getPayrollSummary(period) {
    const payments = getTeacherPayments().filter(p => p.period === period)
    
    const totalPayroll = payments.reduce((sum, p) => sum + p.totalSalary, 0)
    const totalHours = payments.reduce((sum, p) => sum + p.hoursWorked, 0)
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

export function getTeacherPaymentHistory(teacherId) {
    return getTeacherPayments()
        .filter(p => p.teacherId === teacherId)
        .sort((a, b) => new Date(b.period) - new Date(a.period))
}

export function getYearlyPayrollReport(year) {
    const payments = getTeacherPayments()
    const yearlyPayments = payments.filter(p => p.period.startsWith(year))
    
    const monthlyData = []
    for (let month = 1; month <= 12; month++) {
        const monthPeriod = `${year}-${String(month).padStart(2, '0')}`
        const monthPayments = yearlyPayments.filter(p => p.period === monthPeriod)
        
        monthlyData.push({
            month: monthPeriod,
            totalPayroll: monthPayments.reduce((sum, p) => sum + p.totalSalary, 0),
            teacherCount: monthPayments.length,
            totalHours: monthPayments.reduce((sum, p) => sum + p.hoursWorked, 0)
        })
    }
    
    return {
        year: year,
        monthlyData: monthlyData,
        totalYearPayroll: yearlyPayments.reduce((sum, p) => sum + p.totalSalary, 0),
        totalYearHours: yearlyPayments.reduce((sum, p) => sum + p.hoursWorked, 0)
    }
}

// -----------------------------------------------------------------------
// Funciones auxiliares
// -----------------------------------------------------------------------
function updateSalaryHistory(payment) {
    const history = JSON.parse(localStorage.getItem(KEYS.salaryHistory) || '[]')
    
    const historyEntry = {
        teacherId: payment.teacherId,
        period: payment.period,
        salary: payment.totalSalary,
        hours: payment.hoursWorked,
        paymentDate: payment.paymentDate,
        createdAt: new Date().toISOString()
    }
    
    history.push(historyEntry)
    localStorage.setItem(KEYS.salaryHistory, JSON.stringify(history))
}

export function getTeacherStats(teacherId) {
    const payments = getTeacherPayments().filter(p => p.teacherId === teacherId)
    
    if (payments.length === 0) {
        return {
            totalEarned: 0,
            totalHours: 0,
            averageHourlyRate: 0,
            paymentCount: 0
        }
    }
    
    const totalEarned = payments.reduce((sum, p) => sum + p.totalSalary, 0)
    const totalHours = payments.reduce((sum, p) => sum + p.hoursWorked, 0)
    
    return {
        totalEarned: totalEarned,
        totalHours: totalHours,
        averageHourlyRate: totalHours > 0 ? totalEarned / totalHours : 0,
        paymentCount: payments.length
    }
}

export function getActiveTeachersCount() {
    return getTeachers().filter(t => t.status === 'Active').length
}

export function getMonthlyPayrollTotal(period) {
    const payments = getTeacherPayments().filter(p => p.period === period)
    return payments.reduce((sum, p) => sum + p.totalSalary, 0)
}
