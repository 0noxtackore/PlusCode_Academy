<template>
  <div class="page-container">
    <header class="expense-hero">
      <div class="expense-hero__title">
        <h2>Gastos y Egresos</h2>
        <p>
          <span class="expense-hero__greeting">Hola, {{ userName }}.</span>
          <span class="expense-hero__subtitle">Controla el gasto institucional y los costos operativos.</span>
        </p>
      </div>

      <div class="expense-hero__actions">
        <button class="dash-action" type="button" @click="scrollToExpenses" aria-label="Ver gastos">
          <span class="dash-action__icon"><i class="fa fa-clipboard-list"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Ver Gastos</span>
            <span class="dash-action__meta">Registro y filtros</span>
          </span>
        </button>

        <a class="dash-action" href="#reports" aria-label="Ir a reportes">
          <span class="dash-action__icon"><i class="fa fa-chart-line"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Reportes</span>
            <span class="dash-action__meta">Finanzas y métricas</span>
          </span>
        </a>

        <button class="dash-action" type="button" @click="openModal()" v-if="hasPermission('expenses')" aria-label="Registrar gasto">
          <span class="dash-action__icon"><i class="fa fa-plus"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Registrar Gasto</span>
            <span class="dash-action__meta">Nuevo egreso</span>
          </span>
        </button>
      </div>
    </header>

    <!-- Notification Toast -->
    <div class="toast-container" v-if="toastMsg">
      <div :class="['toast', toastType]">
        <i :class="toastIcon"></i> {{ toastMsg }}
      </div>
    </div>

    <!-- Professional KPI Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <i class="fa fa-calendar-alt"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(totalMonthExpenses) }}</span>
          </span>
          <span class="label">Total del mes</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon icon-orange">
          <i class="fa fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(totalYearExpenses) }}</span>
          </span>
          <span class="label">Gasto anual</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon icon-green">
          <i class="fa fa-file-invoice-dollar"></i>
        </div>
        <div class="stat-info">
          <span class="value">{{ monthExpensesCount }}</span>
          <span class="label">Registros del mes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" :class="cashBalance.balance >= 0 ? 'icon-green' : 'icon-red'">
          <i class="fa fa-cash-register"></i>
        </div>
        <div class="stat-info">
          <span class="value">
            <span>${{ formatMoneyFull(cashBalance.balance) }}</span>
          </span>
          <span class="label">Caja/Bancos disponible</span>
        </div>
      </div>
    </div>

    <div id="expenses-registry" class="card-modern">
      <div class="card-header-modern">
        <h4>Registro de Gastos</h4>

        <div class="table-controls-modern">
          <div class="search-input-modern">
            <i class="fa fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Buscar por descripción o referencia..." />
          </div>

          <div class="table-filter">
            <select v-model="selectedCategory" class="form-control" style="width: 220px; border-radius: 10px;">
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <button
            class="btn-primary-modern"
            type="button"
            @click="openModal()"
            v-if="hasPermission('expenses')"
            aria-label="Registrar gasto"
          >
            <i class="fa fa-plus"></i>
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table-professional table-expenses-compact">
          <thead>
            <tr>
              <th width="15%">Fecha</th>
              <th width="15%">Categoría</th>
              <th width="30%">Descripción</th>
              <th width="15%">Método</th>
              <th width="15%" class="text-right">Monto</th>
              <th width="10%" class="text-center" v-if="hasPermission('expenses')">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td class="font-semi">{{ formatDate(expense.date) }}</td>
              <td class="font-bold text-blue">{{ getCategoryName(expense.categoryId) }}</td>
              <td>{{ expense.description }}</td>
              <td>
                <div class="badge-modern badge-pending" style="background-color: #f1f5f9; color: #475569;">
                   {{ getPaymentMethodLabel(expense.paymentMethod) }}
                </div>
              </td>
              <td class="text-right font-bold text-danger">-${{ formatMoneyFull(expense.amount) }}</td>
              <td class="text-center" v-if="hasPermission('expenses')">
                <div class="actions-cell">
                  <button class="btn-action" @click="editExpense(expense)" title="Editar gasto">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="handleDeleteExpense(expense.id)" title="Eliminar gasto">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fa fa-clipboard-list fa-2x mb-3 d-block"></i>
                No se encontraron registros de gastos.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <Modal
      v-model="showModal"
      :title="editingExpense ? 'Editar gasto' : 'Registrar gasto'"
      @confirm="saveExpense"
    >
      <form ref="formRef" @submit.prevent class="student-form">
        <div class="form-section">
          <div class="section-header">
            <i class="fa fa-money-bill-wave"></i>
            <h5>Detalles del Gasto</h5>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fecha *</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt input-icon"></i>
                <input type="date" class="form-control" v-model="expenseForm.date" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <div class="select-wrapper">
                <i class="fa fa-tags input-icon"></i>
                <select class="form-control" v-model="expenseForm.categoryId" required>
                  <option value="" disabled>Seleccionar categoría</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Descripción *</label>
              <div class="input-wrapper">
                <i class="fa fa-align-left input-icon"></i>
                <input type="text" class="form-control" v-model="expenseForm.description" required>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Monto (USD) *</label>
              <div class="input-wrapper">
                <i class="fa fa-dollar-sign input-icon"></i>
                <input type="number" class="form-control" v-model="expenseForm.amount" step="0.01" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Método de pago *</label>
              <div class="select-wrapper">
                <i class="fa fa-credit-card input-icon"></i>
                <select class="form-control" v-model="expenseForm.paymentMethod" required>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="mobile">Pago móvil</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Referencia</label>
              <div class="input-wrapper">
                <i class="fa fa-hashtag input-icon"></i>
                <input type="text" class="form-control" v-model="expenseForm.reference">
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" :showDefaultFooter="false">
      <div class="student-form">
        <div class="form-section" style="margin-bottom: 0;">
          <div class="section-header" style="margin-bottom: 0.75rem;">
            <i class="fa fa-trash"></i>
            <h5>Eliminar gasto</h5>
          </div>
          <div class="text-muted" style="line-height: 1.5;">
            Esta acción no se puede deshacer.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn-secondary-modern" @click="closeDeleteModal">Cancelar</button>
        <button type="button" class="btn-primary-modern" @click="confirmDeleteExpense">Eliminar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getExpenses,
  getExpenseCategories,
  addExpense,
  updateExpense,
  deleteExpense,
  getTotalExpensesByMonth,
  getExpensesByMonth,
  getCashBalance
} from '../js/expenses.js'
import { hasPermission, getCurrentUserName } from '../js/auth.js'
import Modal from '../components/Modal.vue'

// Estado
const expenses = ref([])
const categories = ref([])
const showModal = ref(false)
const editingExpense = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')

const showDeleteModal = ref(false)
const pendingDeleteExpenseId = ref(null)

const formRef = ref(null)

const userName = ref('')

// Formulario
const expenseForm = ref({
  date: '',
  categoryId: '',
  description: '',
  amount: 0,
  paymentMethod: 'transfer',
  reference: ''
})

// Toast
const toastMsg = ref('')
const toastType = ref('success')
const toastIcon = ref('fa-check')

// Computed
const filteredExpenses = computed(() => {
  let filtered = expenses.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(expense => 
      expense.description.toLowerCase().includes(query) ||
      expense.reference?.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(expense => expense.categoryId == selectedCategory.value)
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalMonthExpenses = ref(0)
const totalYearExpenses = ref(0)
const monthExpensesCount = ref(0)
const cashBalance = ref({ balance: 0, income: 0, expenses: 0 })

// Métodos
const loadData = async () => {
  const [exps, cats, balance] = await Promise.all([
    getExpenses(),
    getExpenseCategories(),
    getCashBalance()
  ])
  expenses.value = exps
  categories.value = cats
  cashBalance.value = balance

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  const monthExps = exps.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === year && (d.getMonth() + 1) === month
  })
  
  const yearExps = exps.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === year
  })
  
  totalMonthExpenses.value = monthExps.reduce((sum, e) => sum + Number(e.amount), 0)
  monthExpensesCount.value = monthExps.length
  totalYearExpenses.value = yearExps.reduce((sum, e) => sum + Number(e.amount), 0)
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Sin categoría'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    mobile: 'Pago móvil',
    card: 'Tarjeta'
  }
  return labels[method] || method
}

const scrollToExpenses = () => {
  const el = document.getElementById('expenses-registry')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const openModal = () => {
  showModal.value = true
  editingExpense.value = null
  expenseForm.value = {
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: '',
    amount: 0,
    paymentMethod: 'transfer',
    reference: ''
  }
}

const editExpense = (expense) => {
  showModal.value = true
  editingExpense.value = expense
  expenseForm.value = { ...expense }
}

const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
}

const saveExpense = async () => {
  if (formRef.value && !formRef.value.checkValidity()) {
    formRef.value.reportValidity()
    return
  }

  try {
    if (editingExpense.value) {
      await updateExpense(editingExpense.value.id, expenseForm.value)
      showToast('Gasto actualizado correctamente', 'success')
    } else {
      await addExpense(expenseForm.value)
      showToast('Gasto registrado correctamente', 'success')
    }
    closeModal()
    await loadData()
  } catch (error) {
    showToast(error?.message || 'Error al guardar el gasto', 'error')
  }
}

const handleDeleteExpense = (id) => {
  pendingDeleteExpenseId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pendingDeleteExpenseId.value = null
}

const confirmDeleteExpense = async () => {
  if (!pendingDeleteExpenseId.value) {
    closeDeleteModal()
    return
  }

  try {
    await deleteExpense(pendingDeleteExpenseId.value)
    showToast('Gasto eliminado correctamente', 'success')
    await loadData()
  } catch (error) {
    showToast('Error al eliminar el gasto', 'error')
  }

  closeDeleteModal()
}

const showToast = (message, type = 'success') => {
  toastMsg.value = message
  toastType.value = type
  toastIcon.value = type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'
  setTimeout(() => {
    toastMsg.value = ''
  }, 3000)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatMoney = (val) => {
  const num = Number(val)
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

const formatMoneyDual = (usdVal) => {
  const usd = Number(usdVal) || 0
  return `$${formatMoney(usd)}`
}

const formatMoneyFull = (val) => {
  return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(async () => {
  userName.value = getCurrentUserName() || 'Administrador'
  await loadData()
})
</script>
