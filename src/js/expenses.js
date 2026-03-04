/**
 * expenses.js — Módulo de gestión de egresos/gastos operativos
 * Contiene funciones CRUD para gestión de gastos del sistema.
 * Los datos se persisten en localStorage.
 */

// -----------------------------------------------------------------------
// Claves de localStorage
// -----------------------------------------------------------------------
const KEYS = {
    expenses: 'academy_expenses',
    categories: 'academy_expense_categories'
}

// -----------------------------------------------------------------------
// Datos iniciales
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

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Sueldos Docentes', description: 'Honorarios y nómina del personal docente' },
  { id: 2, name: 'Servidores Cloud', description: 'Infraestructura cloud, backups y servicios gestionados' },
  { id: 3, name: 'Publicidad AdTech', description: 'Inversión en Ads, campañas y optimización' },
  { id: 4, name: 'Operaciones', description: 'Operación general (alquiler, servicios, internet, etc.)' },
  { id: 5, name: 'Insumos', description: 'Materiales y consumibles (laboratorio, oficina, etc.)' },
  { id: 6, name: 'Mantenimiento', description: 'Mantenimiento preventivo y correctivo' }
]

const INITIAL_EXPENSES = [
  {
    id: 1,
    categoryId: 1,
    description: 'Sueldos Docentes — Corte quincenal (cohorte tecnología)',
    amount: 420.00,
    date: toYMD(daysAgo(13)),
    paymentMethod: 'transfer',
    reference: 'NOM-0001',
    status: 'paid'
  },
  {
    id: 2,
    categoryId: 2,
    description: 'Servidores Cloud — VPS + Backups + Observabilidad',
    amount: 140.00,
    date: toYMD(daysAgo(11)),
    paymentMethod: 'card',
    reference: 'CLD-0007',
    status: 'paid'
  },
  {
    id: 3,
    categoryId: 3,
    description: 'Publicidad AdTech — Campaña de captación (Meta/Google)',
    amount: 160.00,
    date: toYMD(daysAgo(9)),
    paymentMethod: 'card',
    reference: 'ADS-0312',
    status: 'paid'
  },
  {
    id: 4,
    categoryId: 4,
    description: 'Operaciones — Internet corporativo (mes en curso)',
    amount: 38.00,
    date: toYMD(daysAgo(8)),
    paymentMethod: 'transfer',
    reference: 'OPS-1201',
    status: 'paid'
  },
  {
    id: 5,
    categoryId: 5,
    description: 'Insumos — Kits para laboratorio IoT (Raspberry y sensores)',
    amount: 85.00,
    date: toYMD(daysAgo(6)),
    paymentMethod: 'transfer',
    reference: 'LAB-0094',
    status: 'paid'
  }
]

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializeExpensesData() {
    if (!localStorage.getItem(KEYS.categories)) {
        localStorage.setItem(KEYS.categories, JSON.stringify(INITIAL_CATEGORIES))
    }
    if (!localStorage.getItem(KEYS.expenses)) {
        localStorage.setItem(KEYS.expenses, JSON.stringify(INITIAL_EXPENSES))
    }
}

// -----------------------------------------------------------------------
// Funciones CRUD para Categorías
// -----------------------------------------------------------------------
export function getExpenseCategories() {
    const data = localStorage.getItem(KEYS.categories)
    return data ? JSON.parse(data) : []
}

export function addExpenseCategory(category) {
    const categories = getExpenseCategories()
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        ...category
    }
    categories.push(newCategory)
    localStorage.setItem(KEYS.categories, JSON.stringify(categories))
    return newCategory
}

export function updateExpenseCategory(id, updates) {
    const categories = getExpenseCategories()
    const index = categories.findIndex(cat => cat.id === id)
    if (index !== -1) {
        categories[index] = { ...categories[index], ...updates }
        localStorage.setItem(KEYS.categories, JSON.stringify(categories))
        return categories[index]
    }
    return null
}

export function deleteExpenseCategory(id) {
    const categories = getExpenseCategories()
    const filtered = categories.filter(cat => cat.id !== id)
    localStorage.setItem(KEYS.categories, JSON.stringify(filtered))
    return true
}

// -----------------------------------------------------------------------
// Funciones CRUD para Gastos
// -----------------------------------------------------------------------
export function getExpenses() {
    const data = localStorage.getItem(KEYS.expenses)
    return data ? JSON.parse(data) : []
}

function getPaymentsSafe() {
  try {
    return JSON.parse(localStorage.getItem('academy_payments') || '[]')
  } catch {
    return []
  }
}

function getTeacherPaymentsSafe() {
  try {
    return JSON.parse(localStorage.getItem('academy_teacher_payments') || '[]')
  } catch {
    return []
  }
}

export function getCashBalance() {
  const payments = getPaymentsSafe()
  const teacherPayments = getTeacherPaymentsSafe()
  const expenses = getExpenses()

  const income = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const expensesOutflow = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const payrollOutflow = teacherPayments.reduce((sum, p) => sum + (Number(p.totalSalary) || 0), 0)
  const outflow = expensesOutflow + payrollOutflow

  return {
    income,
    outflow,
    balance: income - outflow
  }
}

function assertSufficientFunds(additionalOutflow) {
  const { balance } = getCashBalance()
  const delta = Number(additionalOutflow) || 0

  if (delta <= 0) return

  if (delta > balance) {
    throw new Error(`Saldo insuficiente en Caja/Bancos. Disponible: $${balance.toFixed(2)} | Intento de egreso: $${delta.toFixed(2)}`)
  }
}

export function addExpense(expense) {
    assertSufficientFunds(expense?.amount)
    const expenses = getExpenses()
    const newExpense = {
        id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        ...expense,
        createdAt: new Date().toISOString()
    }
    expenses.push(newExpense)
    localStorage.setItem(KEYS.expenses, JSON.stringify(expenses))
    return newExpense
}

export function updateExpense(id, updates) {
    const expenses = getExpenses()
    const index = expenses.findIndex(exp => exp.id === id)
    if (index !== -1) {
        const prev = expenses[index]
        const prevAmount = Number(prev?.amount) || 0
        const nextAmount = Number(updates?.amount) || 0
        const delta = nextAmount - prevAmount
        assertSufficientFunds(delta)
        expenses[index] = { ...expenses[index], ...updates }
        localStorage.setItem(KEYS.expenses, JSON.stringify(expenses))
        return expenses[index]
    }
    return null
}

export function deleteExpense(id) {
    const expenses = getExpenses()
    const filtered = expenses.filter(exp => exp.id !== id)
    localStorage.setItem(KEYS.expenses, JSON.stringify(filtered))
    return true
}

// -----------------------------------------------------------------------
// Funciones de reportes y análisis
// -----------------------------------------------------------------------
export function getExpensesByMonth(year, month) {
    const expenses = getExpenses()
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1
    })
}

export function getTotalExpensesByMonth(year, month) {
    const expenses = getExpensesByMonth(year, month)
    return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function getExpensesByCategory(year, month) {
    const expenses = getExpensesByMonth(year, month)
    const categories = getExpenseCategories()
    
    return categories.map(category => {
        const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id)
        const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        
        return {
            category: category.name,
            total,
            count: categoryExpenses.length,
            expenses: categoryExpenses
        }
    }).filter(item => item.count > 0)
}

export function getExpensesByDateRange(startDate, endDate) {
    const expenses = getExpenses()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= start && expenseDate <= end
    })
}
