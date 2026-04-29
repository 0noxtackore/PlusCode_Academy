<template>
  <div>
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="card-title">Estado de Resultados</h4>
        <div class="card-tools d-flex gap-2">
          <input type="date" v-model="startDate" class="form-control" @change="updateReport">
          <input type="date" v-model="endDate" class="form-control" @change="updateReport">
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-6">
            <h5 class="text-success">INGRESOS</h5>
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Total de Ingresos</td>
                  <td class="text-right">${{ formatMoney(incomeStatement.revenues.totalRevenue) }}</td>
                </tr>
                <tr>
                  <td>Número de Pagos</td>
                  <td class="text-right">{{ incomeStatement.revenues.paymentCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="col-6">
            <h5 class="text-danger">GASTOS</h5>
            <table class="table table-sm">
              <tbody>
                <tr v-for="(amount, categoryId) in incomeStatement.expenses.expensesByCategory" :key="categoryId">
                  <td>{{ getCategoryName(categoryId) }}</td>
                  <td class="text-right">${{ formatMoney(amount) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total de Gastos Operativos</td>
                  <td class="text-right">${{ formatMoney(incomeStatement.expenses.totalOperatingExpenses) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <canvas ref="revenueExpensesChartEl" style="max-height: 260px;"></canvas>
                  </div>
                  <div class="col-6">
                    <canvas ref="expensesByCategoryChartEl" style="max-height: 260px;"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <h5 class="text-info">ANÁLISIS DE RENTABILIDAD</h5>
            <div class="card bg-light">
              <div class="card-body">
                <div class="row">
                  <div class="col-3">
                    <strong>Utilidad Bruta:</strong><br>
                    <span class="text-success">${{ formatMoney(incomeStatement.profitability.grossProfit) }}</span>
                  </div>
                  <div class="col-3">
                    <strong>Utilidad Operativa:</strong><br>
                    <span :class="incomeStatement.profitability.operatingIncome >= 0 ? 'text-success' : 'text-danger'">
                      ${{ formatMoney(incomeStatement.profitability.operatingIncome) }}
                    </span>
                  </div>
                  <div class="col-3">
                    <strong>Utilidad Neta:</strong><br>
                    <span :class="incomeStatement.profitability.netIncome >= 0 ? 'text-success' : 'text-danger'">
                      ${{ formatMoney(incomeStatement.profitability.netIncome) }}
                    </span>
                  </div>
                  <div class="col-3">
                    <strong>Margen:</strong><br>
                    <span :class="incomeStatement.profitability.profitMargin >= 0 ? 'text-success' : 'text-danger'">
                      {{ formatPercent(incomeStatement.profitability.profitMargin) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { generateIncomeStatement } from '../../js/financial-reports.js'
import { getExpenseCategories } from '../../js/expenses.js'

const props = defineProps({
  startDate: {
    type: String,
    default: () => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  },
  endDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
})

const incomeStatement = ref({
  revenues: { totalRevenue: 0, paymentCount: 0 },
  expenses: { totalOperatingExpenses: 0, expensesByCategory: {}, expenseCount: 0 },
  profitability: { grossProfit: 0, operatingIncome: 0, netIncome: 0, profitMargin: 0 }
})

const startDate = ref(props.startDate)
const endDate = ref(props.endDate)
const categories = ref([])

const revenueExpensesChartEl = ref(null)
const expensesByCategoryChartEl = ref(null)
const revenueExpensesChart = ref(null)
const expensesByCategoryChart = ref(null)

const updateReport = async () => {
  incomeStatement.value = await generateIncomeStatement(new Date(startDate.value), new Date(endDate.value))
  renderCharts()
}

const getCategoryName = (categoryId) => {
  if (String(categoryId) === 'teacher_payroll') return 'Nómina Docente'
  const category = categories.value.find(cat => cat.id == categoryId)
  return category ? category.name : 'Categoría desconocida'
}

const formatMoney = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatPercent = (value) => {
  return value.toFixed(1)
}

const renderCharts = () => {
  const revenue = incomeStatement.value.revenues.totalRevenue || 0
  const expenses = incomeStatement.value.expenses.totalOperatingExpenses || 0

  if (revenueExpensesChart.value) {
    revenueExpensesChart.value.destroy()
    revenueExpensesChart.value = null
  }
  if (expensesByCategoryChart.value) {
    expensesByCategoryChart.value.destroy()
    expensesByCategoryChart.value = null
  }

  if (revenueExpensesChartEl.value) {
    revenueExpensesChart.value = new Chart(revenueExpensesChartEl.value, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [
          {
            label: 'Monto',
            data: [revenue, expenses],
            backgroundColor: ['rgba(40, 167, 69, 0.65)', 'rgba(220, 53, 69, 0.65)'],
            borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Ingresos vs Gastos' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  const byCategory = incomeStatement.value.expenses.expensesByCategory || {}
  const categoryEntries = Object.entries(byCategory)
    .map(([categoryId, amount]) => ({
      label: getCategoryName(categoryId),
      value: Number(amount) || 0
    }))
    .filter(x => x.value > 0)

  if (expensesByCategoryChartEl.value) {
    expensesByCategoryChart.value = new Chart(expensesByCategoryChartEl.value, {
      type: 'doughnut',
      data: {
        labels: categoryEntries.map(x => x.label),
        datasets: [
          {
            data: categoryEntries.map(x => x.value),
            backgroundColor: [
              'rgba(0, 123, 181, 0.65)',
              'rgba(255, 193, 7, 0.65)',
              'rgba(23, 162, 184, 0.65)',
              'rgba(108, 117, 125, 0.65)',
              'rgba(102, 16, 242, 0.65)',
              'rgba(32, 201, 151, 0.65)'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Gastos por categoría' }
        }
      }
    })
  }
}

watch(() => props.startDate, (newDate) => {
  startDate.value = newDate
  updateReport()
})

watch(() => props.endDate, (newDate) => {
  endDate.value = newDate
  updateReport()
})

onMounted(async () => {
  categories.value = await getExpenseCategories()
  await updateReport()
})
</script>
