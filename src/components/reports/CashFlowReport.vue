<template>
  <div>
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="card-title">Estado de Flujos de Efectivo</h4>
        <div class="card-tools">
          <input type="month" v-model="reportMonth" class="form-control" @change="updateReport">
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-6">
            <h5 class="text-success">ENTRADAS DE EFECTIVO</h5>
            <table class="table table-sm">
              <tbody>
                <tr v-for="(amount, method) in cashFlow.cashIn.byMethod" :key="method">
                  <td>{{ getPaymentMethodLabel(method) }}</td>
                  <td class="text-right">${{ formatMoney(amount) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total Entradas</td>
                  <td class="text-right">${{ formatMoney(cashFlow.cashIn.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="col-6">
            <h5 class="text-danger">SALIDAS DE EFECTIVO</h5>
            <table class="table table-sm">
              <tbody>
                <tr v-for="(amount, method) in cashFlow.cashOut.byMethod" :key="method">
                  <td>{{ getPaymentMethodLabel(method) }}</td>
                  <td class="text-right">${{ formatMoney(amount) }}</td>
                </tr>
                <tr class="border-top font-bold">
                  <td>Total Salidas</td>
                  <td class="text-right">${{ formatMoney(cashFlow.cashOut.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <div class="card" :class="cashFlow.netCashFlow >= 0 ? 'bg-success-light' : 'bg-danger-light'">
              <div class="card-body text-center">
                <h4>Flujo Neto de Efectivo</h4>
                <h2 :class="cashFlow.netCashFlow >= 0 ? 'text-success' : 'text-danger'">
                  ${{ formatMoney(cashFlow.netCashFlow) }}
                </h2>
                <span class="badge" :class="cashFlow.netCashFlow >= 0 ? 'badge-success' : 'badge-danger'">
                  {{ cashFlow.netCashFlow >= 0 ? 'POSITIVO' : 'NEGATIVO' }}
                </span>
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
import { generateCashFlowStatement } from '../../js/financial-reports.js'

const props = defineProps({
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
})

const cashFlow = ref({
  period: '',
  cashIn: { total: 0, byMethod: {} },
  cashOut: { total: 0, byMethod: {} },
  netCashFlow: 0
})

const reportMonth = ref(props.date.substring(0, 7))

const updateReport = () => {
  const date = new Date(reportMonth.value + '-01')
  cashFlow.value = generateCashFlowStatement(date)
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    mobile: 'Pago Móvil',
    card: 'Tarjeta de Crédito'
  }
  return labels[method] || method
}

const formatMoney = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

watch(() => props.date, (newDate) => {
  reportMonth.value = newDate.substring(0, 7)
  updateReport()
})

onMounted(() => {
  updateReport()
})
</script>
