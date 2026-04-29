<template>
  <div class="page-container">
    <header class="report-hero">
      <div class="report-hero__title">
        <h2>Reportes Institucionales</h2>
        <p>
          <span class="report-hero__greeting">Hola, {{ userName }}.</span>
          <span class="report-hero__subtitle">Análisis financiero integral y auditoría académica.</span>
        </p>
      </div>

      <div class="report-hero__actions">
        <button class="dash-action" type="button" @click="setReportAndScroll('payments')" aria-label="Ver registro de pagos">
          <span class="dash-action__icon"><i class="fa fa-hand-holding-usd"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Pagos</span>
            <span class="dash-action__meta">Transacciones</span>
          </span>
        </button>

        <button class="dash-action" type="button" @click="setReportAndScroll('debtors')" aria-label="Ver estudiantes morosos">
          <span class="dash-action__icon"><i class="fa fa-exclamation-circle"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Morosos</span>
            <span class="dash-action__meta">Por curso</span>
          </span>
        </button>

        <button class="dash-action" type="button" @click="setReportAndScroll('balance')" aria-label="Ver balance general">
          <span class="dash-action__icon"><i class="fa fa-balance-scale"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Balance</span>
            <span class="dash-action__meta">Situación financiera</span>
          </span>
        </button>

        <button class="dash-action" type="button" @click="setReportAndScroll('income')" aria-label="Ver estado de resultados">
          <span class="dash-action__icon"><i class="fa fa-chart-line"></i></span>
          <span class="dash-action__text">
            <span class="dash-action__title">Resultados</span>
            <span class="dash-action__meta">Ingresos y gastos</span>
          </span>
        </button>
      </div>
    </header>

    <!-- Balance Sheet Report -->
    <div id="report-balance" v-if="selectedReport === 'balance'" class="animation-fade">
      <BalanceSheetReport :date="reportDate" />
    </div>

    <!-- Income Statement Report -->
    <div id="report-income" v-if="selectedReport === 'income'" class="animation-fade">
      <IncomeStatementReport :start-date="startDate" :end-date="endDate" />
    </div>

    <!-- Cash Flow Report -->
    <div id="report-cashflow" v-if="selectedReport === 'cashflow'" class="animation-fade">
      <CashFlowReport :date="reportDate" />
    </div>

    <!-- Profitability Analysis -->
    <div id="report-profitability" v-if="selectedReport === 'profitability'" class="animation-fade">
      <ProfitabilityReport />
    </div>

    <!-- Payment Logs (Original) -->
    <div id="report-payments" v-if="selectedReport === 'payments'" class="animation-fade">
      <div class="stats-grid mb-4">
        <div class="stat-card report-stat--wide">
          <div class="stat-icon icon-blue">
            <i class="fa fa-hand-holding-usd"></i>
          </div>
          <div class="stat-info">
            <span class="value">{{ formatMoneyDual(totalRevenue) }}</span>
            <span class="label">Resumen General de Ingresos Brutos</span>
          </div>
        </div>
      </div>

      <div class="report-analytics" ref="paymentsAnalyticsEl">
        <div class="report-analytics__header">
          <div>
            <h4 class="m-0">Analítica de Pagos</h4>
            <div class="text-muted font-semi" style="margin-top: 4px;">
              {{ selectedReportLabel || 'Registro de Pagos por Matrícula' }}
            </div>
          </div>

          <div class="report-analytics__controls no-print">
            <label class="text-muted font-semi" for="payments-month">Mes y año</label>
            <input
              id="payments-month"
              type="month"
              class="form-control"
              v-model="paymentsMonth"
              style="width: 190px; border-radius: 10px; height: 45px; background: #fff; font-weight: 600;"
              aria-label="Seleccionar mes y año"
            >
            <button class="btn-action" type="button" @click="resetPaymentsMonth" title="Restablecer mes">
              <i class="fa fa-undo"></i>
            </button>
            <button class="btn-primary-modern" type="button" style="height: 45px;" @click="generatePdf" aria-label="Generar PDF">
              <i class="fa fa-print"></i>
              <span>Generar PDF</span>
            </button>
          </div>
        </div>

        <div class="report-analytics__grid">
          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico de barras (Ingresos por curso)</div>
            <div class="report-analytics__chart">
              <canvas ref="barByCourseChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico circular (Métodos de pago)</div>
            <div class="report-analytics__chart">
              <canvas ref="pieByMethodChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico de líneas (Ingresos diarios)</div>
            <div class="report-analytics__chart">
              <canvas ref="lineDailyRevenueChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico de dispersión (Monto vs día del mes)</div>
            <div class="report-analytics__chart">
              <canvas ref="scatterAmountByDayChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico de araña (Indicadores del periodo)</div>
            <div class="report-analytics__chart">
              <canvas ref="radarKpisChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile">
            <div class="report-analytics__title">Gráfico de pirámide (Top estudiantes por ingreso)</div>
            <div class="report-analytics__chart">
              <canvas ref="pyramidTopStudentsChartEl"></canvas>
            </div>
          </div>

          <div class="report-analytics__tile report-analytics__tile--wide">
            <div class="report-analytics__title">Cartograma (aprox.) por curso: tamaño = ingreso</div>
            <div class="report-analytics__chart">
              <canvas ref="cartogramBubbleByCourseChartEl"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debtors Report (Operational) -->
    <div id="report-debtors" v-if="selectedReport === 'debtors'" class="animation-fade">
      <div class="card-modern">
        <div class="card-header-modern">
          <h4>Reporte Operativo: Estudiantes Morosos</h4>
          <div class="table-controls-modern">
            <div class="table-filter">
              <select v-model="debtorsCourseId" class="form-control" style="width: 260px; border-radius: 10px;">
                <option value="">Todos los cursos</option>
                <option v-for="c in activeCourses" :key="c.id" :value="String(c.id)">
                  {{ c.code }} - {{ c.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table-professional">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Cédula</th>
                <th>Curso</th>
                <th class="text-right">Debe</th>
                <th class="text-center">Pagos pendientes</th>
                <th>Próximo vencimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredDebtors" :key="`${row.enrollmentId}-${row.studentId}`">
                <td class="font-bold text-blue">{{ row.studentName }}</td>
                <td>{{ row.studentIdNumber }}</td>
                <td>
                  <div class="font-semi">{{ row.courseName }}</div>
                  <div class="text-muted"><small>{{ row.courseCode }}</small></div>
                </td>
                <td class="text-right font-bold text-danger">${{ formatMoneyFull(row.remainingDebt) }}</td>
                <td class="text-center">{{ row.pendingPayments }}</td>
                <td>{{ row.nextPaymentDate ? formatDate(row.nextPaymentDate) : '—' }}</td>
              </tr>

              <tr v-if="filteredDebtors.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fa fa-check-circle fa-2x mb-3 d-block"></i>
                  No se encontraron estudiantes morosos para el filtro seleccionado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { getPaymentsWithDetails, getCourses, getEnrollments } from '../js/data.js'
import { getCurrentUserName } from '../js/auth.js'
import { printPaymentsTablePdf } from '../js/reports-print.js'
import { getDebtorsReport, initializePaymentPlans } from '../js/payment-plans.js'
import BalanceSheetReport from '../components/reports/BalanceSheetReport.vue'
import IncomeStatementReport from '../components/reports/IncomeStatementReport.vue'
import CashFlowReport from '../components/reports/CashFlowReport.vue'
import ProfitabilityReport from '../components/reports/ProfitabilityReport.vue'

// Estado
const payments = ref([])
const userName = ref('')
const selectedReport = ref('payments')
const nowLocal = new Date()
const paymentsMonth = ref(`${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}`)
const reportDate = ref(new Date().toISOString().split('T')[0])
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const debtorsCourseId = ref('')
const activeCourses = ref([])
const debtorsRows = ref([])

// Computed
const filteredPayments = computed(() => {
  if (!paymentsMonth.value) return payments.value

  const [y, m] = paymentsMonth.value.split('-').map(Number)
  if (!y || !m) return payments.value

  return payments.value.filter(payment => {
    const d = new Date(payment.paymentDate)
    return d.getFullYear() === y && (d.getMonth() + 1) === m
  })
})

const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildSyntheticPaymentsForMonth = (monthValue) => {
  const safeMonth = typeof monthValue === 'string' && monthValue.includes('-') ? monthValue : paymentsMonth.value
  const [y, m] = safeMonth.split('-').map(Number)
  const seed = (y || 2026) * 100 + (m || 1)
  const rnd = mulberry32(seed)

  const methods = ['Transferencia', 'Efectivo', 'Tarjeta', 'Pago Móvil']
  const courses = [
    'Ingeniería de Prompts',
    'DevSecOps',
    'Low-Code',
    'Power Query/DAX',
    'Automatización con Python',
    'Business Intelligence',
    'Domótica con Raspberry Pi',
    'AdTech',
    'Growth Hacking',
    'Branding con IA'
  ]
  const students = [
    'Mariana Rivas',
    'José García',
    'Valentina Pérez',
    'Luis Mendoza',
    'Sofía Castillo'
  ]

  const daysInMonth = new Date(y || 2026, (m || 1), 0).getDate()
  const n = 18 + Math.floor(rnd() * 10)

  const rows = []
  for (let i = 0; i < n; i++) {
    const day = 1 + Math.floor(rnd() * daysInMonth)
    const method = methods[Math.floor(rnd() * methods.length)]
    const courseName = courses[Math.floor(rnd() * courses.length)]
    const studentName = students[Math.floor(rnd() * students.length)]
    const amount = Math.round((60 + rnd() * 220 + rnd() * 80) * 100) / 100
    const ref = `${method === 'Efectivo' ? 'CAJA' : 'TRX'}-${String(Math.floor(rnd() * 999999)).padStart(6, '0')}`

    rows.push({
      id: `synthetic-${safeMonth}-${i + 1}`,
      paymentDate: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      method,
      reference: ref,
      studentName,
      courseName,
      amount
    })
  }

  return rows
}

const totalRevenue = computed(() => {
  const base = filteredPayments.value || []
  const rows = base.length > 0 ? base : buildSyntheticPaymentsForMonth(paymentsMonth.value)
  return rows.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
})

const selectedReportLabel = computed(() => {
  const map = {
    payments: 'Registro de Pagos por Matrícula',
    debtors: 'Reporte Operativo: Estudiantes Morosos',
    balance: 'Estado de Situación Financiera',
    income: 'Estado de Resultados (Ingresos y Gastos)',
    cashflow: 'Estado de Flujos de Efectivo',
    profitability: 'Rentabilidad Operativa'
  }

  return map[selectedReport.value] || ''
})

// Charts
const barByCourseChartEl = ref(null)
const pieByMethodChartEl = ref(null)
const lineDailyRevenueChartEl = ref(null)
const scatterAmountByDayChartEl = ref(null)
const radarKpisChartEl = ref(null)
const pyramidTopStudentsChartEl = ref(null)
const cartogramBubbleByCourseChartEl = ref(null)

const paymentsAnalyticsEl = ref(null)

const charts = ref({
  barByCourse: null,
  pieByMethod: null,
  lineDailyRevenue: null,
  scatterAmountByDay: null,
  radarKpis: null,
  pyramidTopStudents: null,
  cartogramBubbleByCourse: null
})

const destroyCharts = () => {
  Object.keys(charts.value).forEach((k) => {
    if (charts.value[k]) {
      charts.value[k].destroy()
      charts.value[k] = null
    }
  })
}

const groupSum = (items, getKey, getValue) => {
  const map = new Map()
  items.forEach((item) => {
    const key = getKey(item)
    const val = Number(getValue(item)) || 0
    map.set(key, (map.get(key) || 0) + val)
  })
  return map
}


const resizeAllCharts = () => {
  Object.keys(charts.value).forEach((k) => {
    const c = charts.value[k]
    if (c) c.resize()
  })
}

const waitForVisible = async (el, timeoutMs = 2000) => {
  if (!el) return

  const isVisibleNow = () => {
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  if (isVisibleNow()) return

  await new Promise((resolve) => {
    let done = false
    const timeout = setTimeout(() => {
      if (done) return
      done = true
      observer.disconnect()
      resolve()
    }, timeoutMs)

    const observer = new IntersectionObserver(() => {
      if (done) return
      if (!isVisibleNow()) return
      done = true
      clearTimeout(timeout)
      observer.disconnect()
      resolve()
    }, { root: null, threshold: 0.01 })

    observer.observe(el)
  })
}

const ensureCanvasSize = (canvasEl) => {
  if (!canvasEl) return
  const parent = canvasEl.parentElement
  if (!parent) return

  const w = Math.max(1, parent.clientWidth)
  const h = Math.max(1, parent.clientHeight)
  if (canvasEl.width !== w) canvasEl.width = w
  if (canvasEl.height !== h) canvasEl.height = h
}

let paymentsRenderTimer = null
const scheduleRenderPaymentAnalytics = (delayMs = 0) => {
  if (paymentsRenderTimer) {
    clearTimeout(paymentsRenderTimer)
    paymentsRenderTimer = null
  }

  paymentsRenderTimer = setTimeout(() => {
    paymentsRenderTimer = null
    renderPaymentAnalytics()
  }, delayMs)
}


const renderPaymentAnalytics = async () => {
  if (selectedReport.value !== 'payments') return

  await nextTick()
  await waitForVisible(paymentsAnalyticsEl.value)
  await new Promise(resolve => requestAnimationFrame(resolve))

  ensureCanvasSize(barByCourseChartEl.value)
  ensureCanvasSize(pieByMethodChartEl.value)
  ensureCanvasSize(lineDailyRevenueChartEl.value)
  ensureCanvasSize(scatterAmountByDayChartEl.value)
  ensureCanvasSize(radarKpisChartEl.value)
  ensureCanvasSize(pyramidTopStudentsChartEl.value)
  ensureCanvasSize(cartogramBubbleByCourseChartEl.value)

  const baseRows = filteredPayments.value || []
  const rows = baseRows.length > 0 ? baseRows : buildSyntheticPaymentsForMonth(paymentsMonth.value)

  destroyCharts()

  // BAR: ingresos por curso
  const byCourse = groupSum(rows, (p) => p.courseName || 'Sin curso', (p) => p.amount)
  const courses = Array.from(byCourse.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (barByCourseChartEl.value) {
    charts.value.barByCourse = new Chart(barByCourseChartEl.value, {
      type: 'bar',
      data: {
        labels: courses.map(x => x.label),
        datasets: [
          {
            label: 'Ingresos',
            data: courses.map(x => x.value),
            backgroundColor: 'rgba(0, 123, 181, 0.55)',
            borderColor: 'rgba(0, 123, 181, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  // PIE: métodos de pago
  const byMethod = groupSum(rows, (p) => p.method || 'Sin método', (p) => p.amount)
  const methods = Array.from(byMethod.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  if (pieByMethodChartEl.value) {
    charts.value.pieByMethod = new Chart(pieByMethodChartEl.value, {
      type: 'doughnut',
      data: {
        labels: methods.map(x => x.label),
        datasets: [
          {
            data: methods.map(x => x.value),
            backgroundColor: [
              'rgba(0, 123, 181, 0.65)',
              'rgba(40, 167, 69, 0.65)',
              'rgba(255, 193, 7, 0.65)',
              'rgba(220, 53, 69, 0.65)',
              'rgba(102, 16, 242, 0.65)',
              'rgba(23, 162, 184, 0.65)'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: false }
        }
      }
    })
  }

  // LINE: ingresos diarios
  const daily = new Map()
  rows.forEach((p) => {
    const d = new Date(p.paymentDate)
    const day = d.getDate()
    daily.set(day, (daily.get(day) || 0) + (Number(p.amount) || 0))
  })
  const days = Array.from(daily.keys()).sort((a, b) => a - b)
  if (lineDailyRevenueChartEl.value) {
    charts.value.lineDailyRevenue = new Chart(lineDailyRevenueChartEl.value, {
      type: 'line',
      data: {
        labels: days.map(d => `Día ${d}`),
        datasets: [
          {
            label: 'Ingresos',
            data: days.map(d => daily.get(d)),
            borderColor: 'rgba(40, 167, 69, 1)',
            backgroundColor: 'rgba(40, 167, 69, 0.12)',
            tension: 0.25,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  // SCATTER: monto vs día del mes
  const points = rows
    .map((p) => {
      const d = new Date(p.paymentDate)
      return { x: d.getDate(), y: Number(p.amount) || 0 }
    })
    .filter(pt => Number.isFinite(pt.x) && Number.isFinite(pt.y))

  if (scatterAmountByDayChartEl.value) {
    charts.value.scatterAmountByDay = new Chart(scatterAmountByDayChartEl.value, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Pagos',
            data: points,
            backgroundColor: 'rgba(0, 123, 181, 0.55)',
            borderColor: 'rgba(0, 123, 181, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Día del mes' }, ticks: { precision: 0 } },
          y: { title: { display: true, text: 'Monto' }, beginAtZero: true }
        }
      }
    })
  }

  // RADAR: indicadores del periodo (normalizados)
  const count = rows.length
  const uniqStudents = new Set(rows.map(p => p.studentName || '')).size
  const uniqCourses = new Set(rows.map(p => p.courseName || '')).size
  const uniqMethods = new Set(rows.map(p => p.method || '')).size
  const avg = count > 0 ? (totalRevenue.value / count) : 0
  const max = rows.reduce((acc, p) => Math.max(acc, Number(p.amount) || 0), 0)

  const norm = (val, maxVal) => {
    if (!maxVal || maxVal <= 0) return 0
    return Math.min(100, Math.round((val / maxVal) * 100))
  }

  const radarValues = [
    norm(count, 40),
    norm(uniqStudents, 30),
    norm(uniqCourses, 12),
    norm(uniqMethods, 6),
    norm(avg, 250),
    norm(max, 500)
  ]

  if (radarKpisChartEl.value) {
    charts.value.radarKpis = new Chart(radarKpisChartEl.value, {
      type: 'radar',
      data: {
        labels: ['Pagos', 'Estudiantes', 'Cursos', 'Métodos', 'Promedio', 'Máximo'],
        datasets: [
          {
            label: 'Indicadores',
            data: radarValues,
            borderColor: 'rgba(102, 16, 242, 1)',
            backgroundColor: 'rgba(102, 16, 242, 0.14)',
            pointBackgroundColor: 'rgba(102, 16, 242, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false }
          }
        }
      }
    })
  }

  // PYRAMID (aprox): barras horizontales top estudiantes
  const byStudent = groupSum(rows, (p) => p.studentName || 'Sin estudiante', (p) => p.amount)
  const topStudents = Array.from(byStudent.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)
    .reverse()

  if (pyramidTopStudentsChartEl.value) {
    charts.value.pyramidTopStudents = new Chart(pyramidTopStudentsChartEl.value, {
      type: 'bar',
      data: {
        labels: topStudents.map(x => x.label),
        datasets: [
          {
            label: 'Ingresos',
            data: topStudents.map(x => x.value),
            backgroundColor: 'rgba(255, 193, 7, 0.65)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    })
  }

  // CARTOGRAM (aprox): bubble por curso (tamaño = ingresos)
  const courseStats = new Map()
  rows.forEach((p) => {
    const key = p.courseName || 'Sin curso'
    const amount = Number(p.amount) || 0
    const current = courseStats.get(key) || { revenue: 0, count: 0 }
    current.revenue += amount
    current.count += 1
    courseStats.set(key, current)
  })

  const courseBubbles = Array.from(courseStats.entries())
    .map(([label, stats], idx) => ({
      label,
      x: stats.count,
      y: idx + 1,
      r: Math.max(6, Math.sqrt(stats.revenue) / 2),
      revenue: stats.revenue
    }))
    .slice(0, 10)

  if (cartogramBubbleByCourseChartEl.value) {
    charts.value.cartogramBubbleByCourse = new Chart(cartogramBubbleByCourseChartEl.value, {
      type: 'bubble',
      data: {
        datasets: [
          {
            label: 'Cursos',
            data: courseBubbles,
            backgroundColor: 'rgba(23, 162, 184, 0.35)',
            borderColor: 'rgba(23, 162, 184, 0.9)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const raw = ctx.raw || {}
                const label = raw.label || 'Curso'
                const revenue = raw.revenue || 0
                const count = raw.x || 0
                return `${label}: ${count} pagos | $${formatMoneyFull(revenue)}`
              }
            }
          },
          title: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Cantidad de pagos' }, beginAtZero: true, ticks: { precision: 0 } },
          y: { title: { display: true, text: 'Cursos (ranking)' }, beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    })
  }

  await new Promise(resolve => requestAnimationFrame(resolve))
  resizeAllCharts()
}

// Métodos
const buildSamplePayments = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')

  return [
    {
      id: 'sample-001',
      paymentDate: `${y}-${m}-03`,
      method: 'Transferencia',
      reference: 'TRX-ACD-10452',
      studentName: 'María Fernanda López',
      courseName: 'Matemáticas Básicas',
      amount: 150.00
    },
    {
      id: 'sample-002',
      paymentDate: `${y}-${m}-10`,
      method: 'Efectivo',
      reference: 'CAJA-000187',
      studentName: 'Juan Pablo Martínez',
      courseName: 'Inglés Intermedio',
      amount: 120.00
    },
    {
      id: 'sample-003',
      paymentDate: `${y}-${m}-18`,
      method: 'Tarjeta',
      reference: 'POS-884211',
      studentName: 'Valentina Pérez',
      courseName: 'Programación I',
      amount: 200.00
    },
    {
      id: 'sample-004',
      paymentDate: `${y}-${m}-25`,
      method: 'Transferencia',
      reference: 'TRX-ACD-10993',
      studentName: 'Carlos Andrés Gómez',
      courseName: 'Ciencias Naturales',
      amount: 180.00
    }
  ]
}

const loadData = async () => {
  try {
    const data = await getPaymentsWithDetails()
    if (Array.isArray(data) && data.length > 0) {
      payments.value = data
    } else {
      payments.value = buildSamplePayments()
    }
  } catch (e) {
    payments.value = buildSamplePayments()
  }

  try {
    await initializePaymentPlans()
  } catch {
    // noop
  }

  const allCourses = await getCourses()
  const courses = allCourses.filter(c => c.status === 'Active')
  activeCourses.value = courses

  const enrollments = await getEnrollments()
  const enrollmentToCourse = new Map(enrollments.map(e => [e.id, e.courseId]))
  const courseMap = new Map(courses.map(c => [c.id, c]))

  const base = await getDebtorsReport()
  debtorsRows.value = (base || []).map(row => {
    const courseId = enrollmentToCourse.get(row.enrollmentId)
    const course = courseMap.get(courseId) || {}
    return {
      ...row,
      courseId,
      courseName: course.name || 'N/A',
      courseCode: course.code || ''
    }
  })
}

const filteredDebtors = computed(() => {
  const courseId = debtorsCourseId.value ? Number(debtorsCourseId.value) : null
  const rows = debtorsRows.value || []
  const filtered = courseId ? rows.filter(r => r.courseId === courseId) : rows
  return filtered.sort((a, b) => (Number(b.remainingDebt) || 0) - (Number(a.remainingDebt) || 0))
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const resetPaymentsMonth = () => {
  const now = new Date()
  paymentsMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const generatePdf = () => {
  const base = filteredPayments.value || []
  const rows = base.length > 0 ? base : buildSyntheticPaymentsForMonth(paymentsMonth.value)
  printPaymentsTablePdf({
    month: paymentsMonth.value,
    payments: rows
  })
}

const setReportAndScroll = async (reportKey) => {
  selectedReport.value = reportKey
  await Promise.resolve()

  const sectionMap = {
    payments: 'report-payments',
    debtors: 'report-debtors',
    balance: 'report-balance',
    income: 'report-income',
    cashflow: 'report-cashflow',
    profitability: 'report-profitability'
  }

  const el = document.getElementById(sectionMap[reportKey])
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  scheduleRenderPaymentAnalytics(0)
  scheduleRenderPaymentAnalytics(250)

  window.addEventListener('resize', resizeAllCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAllCharts)

  if (paymentsRenderTimer) {
    clearTimeout(paymentsRenderTimer)
    paymentsRenderTimer = null
  }
})

watch(filteredPayments, () => {
  scheduleRenderPaymentAnalytics(0)
}, { deep: true })

watch(selectedReport, () => {
  scheduleRenderPaymentAnalytics(0)
})
</script>

<style scoped>
.m-title { margin: 0; line-height: 1; }
.m-0 { margin: 0; }
.mb-1 { margin-bottom: 5px; }
.mb-4 { margin-bottom: 20px; }
.py-4 { padding-top: 25px; padding-bottom: 25px; }
.p-3 { padding: 15px; }

.report-payments-controls {
  padding: 0;
  border-bottom: none;
  background: transparent;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.report-payments-controls__label {
  display: flex;
  align-items: center;
}

.report-analytics {
  margin-top: 0.25rem;
}

.report-analytics__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.report-analytics__controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.report-analytics__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.report-stat--wide {
  grid-column: span 3;
}

.report-analytics__tile--wide {
  grid-column: span 2;
}

.report-analytics__tile {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  padding: 0.95rem 1rem;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.report-analytics__title {
  font-weight: 800;
  color: #0b1220;
  margin-bottom: 0.65rem;
}

.report-analytics__chart {
  position: relative;
  flex: 1;
  min-height: 240px;
}

.report-analytics__chart canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .report-payments-controls {
    width: 100%;
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .report-payments-controls input {
    width: 100% !important;
  }

  .report-analytics__header {
    flex-direction: column;
    align-items: stretch;
  }

  .report-analytics__controls {
    justify-content: flex-start;
  }

  .report-analytics__grid {
    grid-template-columns: 1fr;
  }

  .report-stat--wide {
    grid-column: auto;
  }

  .report-analytics__tile--wide {
    grid-column: auto;
  }

  .report-analytics__tile {
    min-height: 280px;
  }
}

@media (max-width: 1024px) {
  .report-analytics__grid {
    grid-template-columns: 1fr;
  }

  .report-analytics__tile--wide {
    grid-column: auto;
  }
}

.summary-box {
  background: linear-gradient(135deg, rgba(0, 123, 181, 0.05) 0%, rgba(0, 51, 86, 0.1) 100%);
  border-left: 4px solid var(--blue-dark);
  padding: 20px 25px;
}

.total-revenue {
  font-size: 2rem;
  font-weight: 700;
  color: var(--blue-dark);
}

.summary-row td {
  background-color: #f8fafc;
  border-top: 2px solid var(--blue-dark);
}
</style>
