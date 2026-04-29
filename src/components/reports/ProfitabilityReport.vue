<template>
  <div>
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="card-title">Análisis de Rentabilidad</h4>
      </div>
      <div class="card-body">
        <!-- Course Profitability -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="text-info">Rentabilidad por Curso</h5>
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Curso</th>
                    <th>Estudiantes</th>
                    <th>Ingresos</th>
                    <th>Ingreso Prom./Est.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in profitability.courseProfitability" :key="course.courseCode">
                    <td>{{ course.courseCode }}</td>
                    <td>{{ course.courseName }}</td>
                    <td class="text-center">{{ course.studentCount }}</td>
                    <td class="text-right">${{ formatMoney(course.revenue) }}</td>
                    <td class="text-right">${{ formatMoney(course.averageRevenuePerStudent) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body">
                <div class="row">
                  <div class="col-7">
                    <canvas ref="monthlyTrendsChartEl" style="max-height: 320px;"></canvas>
                  </div>
                  <div class="col-5">
                    <canvas ref="topCoursesChartEl" style="max-height: 320px;"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Monthly Trends -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="text-info">Tendencias Mensuales</h5>
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Ingresos</th>
                    <th>Gastos</th>
                    <th>Utilidad</th>
                    <th>Margen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="month in profitability.monthlyTrends" :key="month.month">
                    <td>{{ formatMonth(month.month) }}</td>
                    <td class="text-right">${{ formatMoney(month.revenue) }}</td>
                    <td class="text-right">${{ formatMoney(month.expenses) }}</td>
                    <td class="text-right" :class="month.profit >= 0 ? 'text-success' : 'text-danger'">
                      ${{ formatMoney(month.profit) }}
                    </td>
                    <td class="text-right">
                      <span :class="month.profitMargin >= 0 ? 'text-success' : 'text-danger'">
                        {{ formatPercent(month.profitMargin) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="row">
          <div class="col-3">
            <div class="card summary-box bg-success-light">
              <div class="card-body text-center">
                <h6>Total de Ingresos</h6>
                <h4 class="text-success">${{ formatMoney(profitability.summary.totalRevenue) }}</h4>
              </div>
            </div>
          </div>
          <div class="col-3">
            <div class="card summary-box bg-danger-light">
              <div class="card-body text-center">
                <h6>Total de Gastos</h6>
                <h4 class="text-danger">${{ formatMoney(profitability.summary.totalExpenses) }}</h4>
              </div>
            </div>
          </div>
          <div class="col-3">
            <div class="card summary-box bg-info-light">
              <div class="card-body text-center">
                <h6>Total de Utilidad</h6>
                <h4 class="text-info">${{ formatMoney(profitability.summary.totalProfit) }}</h4>
              </div>
            </div>
          </div>
          <div class="col-3">
            <div class="card summary-box bg-primary-light">
              <div class="card-body text-center">
                <h6>Margen General</h6>
                <h4 class="text-primary">{{ formatPercent(overallMargin) }}%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { generateProfitabilityAnalysis } from '../../js/financial-reports.js'

const profitability = ref({
  courseProfitability: [],
  monthlyTrends: [],
  summary: { totalRevenue: 0, totalExpenses: 0, totalProfit: 0 }
})

const monthlyTrendsChartEl = ref(null)
const topCoursesChartEl = ref(null)
const monthlyTrendsChart = ref(null)
const topCoursesChart = ref(null)

const overallMargin = computed(() => {
  const { totalRevenue, totalExpenses } = profitability.value.summary
  return totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
})

const updateReport = async () => {
  profitability.value = await generateProfitabilityAnalysis()
  profitability.value.summary.totalProfit = profitability.value.summary.totalRevenue - profitability.value.summary.totalExpenses
  renderCharts()
}

const formatMoney = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatPercent = (value) => {
  return value.toFixed(1)
}

const formatMonth = (monthString) => {
  const [year, month] = monthString.split('-')
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
}

const renderCharts = () => {
  if (monthlyTrendsChart.value) {
    monthlyTrendsChart.value.destroy()
    monthlyTrendsChart.value = null
  }
  if (topCoursesChart.value) {
    topCoursesChart.value.destroy()
    topCoursesChart.value = null
  }

  const trends = profitability.value.monthlyTrends || []
  const labels = trends.map(t => formatMonth(t.month))
  const revenues = trends.map(t => t.revenue)
  const expenses = trends.map(t => t.expenses)
  const profits = trends.map(t => t.profit)

  if (monthlyTrendsChartEl.value) {
    monthlyTrendsChart.value = new Chart(monthlyTrendsChartEl.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos',
            data: revenues,
            borderColor: 'rgba(40, 167, 69, 1)',
            backgroundColor: 'rgba(40, 167, 69, 0.15)',
            tension: 0.25
          },
          {
            label: 'Gastos',
            data: expenses,
            borderColor: 'rgba(220, 53, 69, 1)',
            backgroundColor: 'rgba(220, 53, 69, 0.15)',
            tension: 0.25
          },
          {
            label: 'Utilidad',
            data: profits,
            borderColor: 'rgba(0, 123, 181, 1)',
            backgroundColor: 'rgba(0, 123, 181, 0.15)',
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Tendencias (últimos 6 meses)' },
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  const topCourses = (profitability.value.courseProfitability || []).slice(0, 7)
  if (topCoursesChartEl.value) {
    topCoursesChart.value = new Chart(topCoursesChartEl.value, {
      type: 'bar',
      data: {
        labels: topCourses.map(c => c.courseCode),
        datasets: [
          {
            label: 'Ingresos',
            data: topCourses.map(c => c.revenue),
            backgroundColor: 'rgba(102, 16, 242, 0.55)',
            borderColor: 'rgba(102, 16, 242, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Top cursos por ingresos' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }
}

onMounted(async () => {
  await updateReport()
})
</script>
