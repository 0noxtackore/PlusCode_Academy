/**
 * financial-reports.js — Módulo de reportes financieros
 * Contiene funciones para generar Balance General y Estado de Resultados
 */

import { getPayments } from './data.js'
import { getExpenses, getCashBalance } from './expenses.js'
import { getEnrollments } from './data.js'
import { getCourses } from './data.js'
import { getTeacherPayments } from './teachers.js'

// -----------------------------------------------------------------------
// Balance General
// -----------------------------------------------------------------------
export async function generateBalanceSheet(date = new Date()) {
    const payments = await getPayments()
    const expenses = await getExpenses()
    const teacherPayments = await getTeacherPayments()
    const enrollments = await getEnrollments()
    const courses = await getCourses()
    
    // Filtrar por período (mes y año actual)
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    
    const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    
    // ACTIVOS
    const totalIncome = filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
    
    // Cuentas por cobrar (matrículas pendientes)
    const accountsReceivable = calculateAccountsReceivable(enrollments, payments, courses)
    
    // PASIVOS
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

    // Sueldos por pagar (pagos docentes pendientes dentro del mes)
    const filteredPayroll = teacherPayments.filter(p => {
      const d = new Date(p.paymentDate)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const salariesPayable = filteredPayroll
      .filter(p => String(p.status || '').toLowerCase() !== 'paid')
      .reduce((sum, p) => sum + (Number(p.totalSalary) || 0), 0)
    
    // Caja/Bancos real (ingresos - egresos + nómina) acumulado
    const cashInfo = await getCashBalance()
    const cash = cashInfo.balance

    // PATRIMONIO (simplificado): caja real + CxC - pasivos - capital
    const totalAssets = cash + accountsReceivable
    const equity = totalAssets - salariesPayable - 10000
    
    return {
        date: date.toISOString().split('T')[0],
        assets: {
            cash: cash,
            accountsReceivable: accountsReceivable,
            totalAssets: totalAssets
        },
        liabilities: {
            payableCommissions: salariesPayable,
            totalLiabilities: salariesPayable
        },
        equity: {
            capital: 10000, // Capital inicial (simulado)
            currentEarnings: equity,
            totalEquity: 10000 + equity
        },
        summary: {
            totalAssets: totalAssets,
            totalLiabilitiesPlusEquity: salariesPayable + 10000 + equity
        }
    }
}

// -----------------------------------------------------------------------
// Estado de Resultados
// -----------------------------------------------------------------------
export async function generateIncomeStatement(startDate, endDate = new Date()) {
    const payments = await getPayments()
    const expenses = await getExpenses()
    const teacherPayments = await getTeacherPayments()
    
    // Filtrar por rango de fechas
    const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate)
        return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)
    })
    
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
    })

    const filteredPayroll = teacherPayments.filter(p => {
        const d = new Date(p.paymentDate)
        return d >= new Date(startDate) && d <= new Date(endDate)
    })
    
    // INGRESOS
    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
    
    // GASTOS OPERATIVOS
    const totalOperatingExpenses = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

    const totalPayrollExpenses = filteredPayroll.reduce((sum, p) => sum + (Number(p.totalSalary) || 0), 0)
    
    // Gastos por categoría
    const expensesByCategory = {}
    filteredExpenses.forEach(expense => {
        if (!expensesByCategory[expense.categoryId]) {
            expensesByCategory[expense.categoryId] = 0
        }
        expensesByCategory[expense.categoryId] += Number(expense.amount)
    })

    // Incluir nómina docente como categoría virtual
    expensesByCategory['teacher_payroll'] = (expensesByCategory['teacher_payroll'] || 0) + totalPayrollExpenses
    
    // UTILIDAD
    const operatingIncome = totalRevenue - (totalOperatingExpenses + totalPayrollExpenses)
    const netIncome = operatingIncome
    
    return {
        period: {
            startDate: startDate,
            endDate: new Date(endDate).toISOString().split('T')[0]
        },
        revenues: {
            totalRevenue: totalRevenue,
            paymentCount: filteredPayments.length
        },
        expenses: {
            totalOperatingExpenses: totalOperatingExpenses + totalPayrollExpenses,
            expensesByCategory: expensesByCategory,
            expenseCount: filteredExpenses.length + filteredPayroll.length
        },
        profitability: {
            grossProfit: totalRevenue,
            operatingIncome: operatingIncome,
            netIncome: netIncome,
            profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
        }
    }
}

// -----------------------------------------------------------------------
// Funciones auxiliares
// -----------------------------------------------------------------------
function calculateAccountsReceivable(enrollments, payments, courses) {
    let totalReceivable = 0
    
    enrollments.forEach(enrollment => {
        const course = courses.find(c => c.id == enrollment.courseId)
        if (course && enrollment.status === 'Active') {
            const enrollmentPayments = payments.filter(p => p.enrollmentId == enrollment.id)
            const paidAmount = enrollmentPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            const remainingBalance = Number(course.fee) - paidAmount
            
            if (remainingBalance > 0) {
                totalReceivable += remainingBalance
            }
        }
    })
    
    return totalReceivable
}

// -----------------------------------------------------------------------
// Reportes adicionales
// -----------------------------------------------------------------------
export async function generateCashFlowStatement(date = new Date()) {
    const payments = await getPayments()
    const expenses = await getExpenses()
    
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    
    const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    
    // Flujo de entrada por método de pago
    const cashInByMethod = {}
    filteredPayments.forEach(payment => {
        if (!cashInByMethod[payment.method]) {
            cashInByMethod[payment.method] = 0
        }
        cashInByMethod[payment.method] += Number(payment.amount)
    })
    
    // Flujo de salida por método de pago
    const cashOutByMethod = {}
    filteredExpenses.forEach(expense => {
        if (!cashOutByMethod[expense.paymentMethod]) {
            cashOutByMethod[expense.paymentMethod] = 0
        }
        cashOutByMethod[expense.paymentMethod] += Number(expense.amount)
    })
    
    const totalCashIn = Object.values(cashInByMethod).reduce((sum, amount) => sum + amount, 0)
    const totalCashOut = Object.values(cashOutByMethod).reduce((sum, amount) => sum + amount, 0)
    
    return {
        period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
        cashIn: {
            total: totalCashIn,
            byMethod: cashInByMethod
        },
        cashOut: {
            total: totalCashOut,
            byMethod: cashOutByMethod
        },
        netCashFlow: totalCashIn - totalCashOut
    }
}

export async function generateProfitabilityAnalysis() {
    const payments = await getPayments()
    const expenses = await getExpenses()
    const enrollments = await getEnrollments()
    const courses = await getCourses()
    
    // Análisis por curso
    const courseProfitability = courses.map(course => {
        const courseEnrollments = enrollments.filter(e => e.courseId == course.id && e.status === 'Active')
        const enrollmentIds = courseEnrollments.map(e => e.id)
        const coursePayments = payments.filter(p => enrollmentIds.includes(p.enrollmentId))
        
        const revenue = coursePayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const studentCount = courseEnrollments.length
        
        return {
            courseCode: course.code,
            courseName: course.name,
            studentCount: studentCount,
            revenue: revenue,
            averageRevenuePerStudent: studentCount > 0 ? revenue / studentCount : 0
        }
    })
    
    // Análisis temporal
    const monthlyData = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
        
        const monthPayments = payments.filter(p => {
            const paymentDate = new Date(p.paymentDate)
            return paymentDate.getMonth() === monthDate.getMonth() && 
                   paymentDate.getFullYear() === monthDate.getFullYear()
        })
        
        const monthExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date)
            return expenseDate.getMonth() === monthDate.getMonth() && 
                   expenseDate.getFullYear() === monthDate.getFullYear()
        })
        
        const revenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const exps = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
        
        monthlyData.push({
            month: monthKey,
            revenue: revenue,
            expenses: exps,
            profit: revenue - exps,
            profitMargin: revenue > 0 ? ((revenue - exps) / revenue) * 100 : 0
        })
    }
    
    return {
        courseProfitability: courseProfitability.sort((a, b) => b.revenue - a.revenue),
        monthlyTrends: monthlyData,
        summary: {
            totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount), 0),
            totalExpenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
            totalProfit: 0
        }
    }
}
