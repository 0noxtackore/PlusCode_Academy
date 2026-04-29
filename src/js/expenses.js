/**
 * expenses.js — Módulo de gastos y egresos (MySQL/PHP API)
 * Contiene funciones asíncronas para gestionar gastos del sistema.
 */

import { api } from './apiClient.js'
import { getPayments } from './data.js'

// -----------------------------------------------------------------------
// Categorías de Gastos
// -----------------------------------------------------------------------
export async function getExpenseCategories() {
    return (await api.get('expense_categories')) || []
}

export async function addExpenseCategory(category) {
    return await api.post('expense_categories', category)
}

export async function updateExpenseCategory(id, data) {
    return await api.put('expense_categories', id, data)
}

export async function deleteExpenseCategory(id) {
    return await api.delete('expense_categories', id)
}

// -----------------------------------------------------------------------
// Gastos / Egresos
// -----------------------------------------------------------------------
export async function getExpenses() {
    return (await api.get('expenses')) || []
}

export async function addExpense(expense) {
    return await api.post('expenses', expense)
}

export async function updateExpense(id, data) {
    return await api.put('expenses', id, data)
}

export async function deleteExpense(id) {
    return await api.delete('expenses', id)
}

// -----------------------------------------------------------------------
// Reportes y Filtros (Simulados en frontend pero con datos async)
// -----------------------------------------------------------------------
export async function getExpensesByMonth(year, month) {
    const expenses = await getExpenses()
    return expenses.filter(expense => {
        const d = new Date(expense.date)
        return d.getFullYear() === year && (d.getMonth() + 1) === month
    })
}

export async function getTotalExpensesByMonth(year, month) {
    const expenses = await getExpensesByMonth(year, month)
    return expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
}

export async function getExpensesByCategory(categoryId) {
    const expenses = await getExpenses()
    return expenses.filter(e => e.categoryId == categoryId)
}

// -----------------------------------------------------------------------
// Estado de Caja (Flujo de Efectivo)
// -----------------------------------------------------------------------
export async function getCashBalance() {
    const [payments, expenses] = await Promise.all([
        getPayments(),
        getExpenses()
    ])
    
    const totalIncome = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    
    return {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses
    }
}
