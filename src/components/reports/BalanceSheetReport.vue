<template>
  <div>
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="card-title">Balance General</h4>
        <div class="card-tools">
          <input type="date" v-model="reportDate" class="form-control" @change="updateReport">
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-4">
            <h5 class="text-success">ACTIVOS</h5>
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Caja y Banco</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.assets.cash) }}</td>
                </tr>
                <tr>
                  <td>Cuentas por Cobrar</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.assets.accountsReceivable) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total Activos</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.assets.totalAssets) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="col-4">
            <h5 class="text-danger">PASIVOS</h5>
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Sueldos por Pagar</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.liabilities.payableCommissions) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total Pasivos</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.liabilities.totalLiabilities) }}</td>
                </tr>
              </tbody>
            </table>
            
            <h5 class="text-primary mt-4">PATRIMONIO</h5>
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Capital Inicial</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.equity.capital) }}</td>
                </tr>
                <tr>
                  <td>Resultados del Periodo</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.equity.currentEarnings) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total Patrimonio</td>
                  <td class="text-right">${{ formatMoney(balanceSheet.equity.totalEquity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="col-4">
            <h5 class="text-info">RESUMEN</h5>
            <div class="card bg-light">
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <strong>Total Activos:</strong><br>
                    <span class="text-success">${{ formatMoney(balanceSheet.summary.totalAssets) }}</span>
                  </div>
                  <div class="col-6">
                    <strong>Total Pasivos + Patrimonio:</strong><br>
                    <span class="text-primary">${{ formatMoney(balanceSheet.summary.totalLiabilitiesPlusEquity) }}</span>
                  </div>
                </div>
                <hr>
                <div class="text-center">
                  <span class="badge" :class="balanceClass">
                    {{ balanceStatus }}
                  </span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { generateBalanceSheet } from '../../js/financial-reports.js'

const props = defineProps({
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
})

const balanceSheet = ref({
  assets: { cash: 0, accountsReceivable: 0, totalAssets: 0 },
  liabilities: { payableCommissions: 0, totalLiabilities: 0 },
  equity: { capital: 0, currentEarnings: 0, totalEquity: 0 },
  summary: { totalAssets: 0, totalLiabilitiesPlusEquity: 0 }
})

const reportDate = ref(props.date)

const balanceClass = computed(() => {
  const diff = balanceSheet.value.summary.totalAssets - balanceSheet.value.summary.totalLiabilitiesPlusEquity
  if (Math.abs(diff) < 0.01) return 'badge-success'
  return 'badge-warning'
})

const balanceStatus = computed(() => {
  const diff = balanceSheet.value.summary.totalAssets - balanceSheet.value.summary.totalLiabilitiesPlusEquity
  if (Math.abs(diff) < 0.01) return 'CUADRADO'
  return 'DESCUADRADO'
})

const updateReport = async () => {
  balanceSheet.value = await generateBalanceSheet(new Date(reportDate.value))
}

const formatMoney = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

watch(() => props.date, (newDate) => {
  reportDate.value = newDate
  updateReport()
})

onMounted(async () => {
  await updateReport()
})
</script>
