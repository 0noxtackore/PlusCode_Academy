export function printPaymentsTablePdf({ month, payments, logoUrl = '/assets/uploads/pluscodeprint.png' }) {
  const safePayments = Array.isArray(payments) ? payments : []

  const rows = safePayments.map((p, idx) => {
    const digits = String(p.reference || '').replace(/\D/g, '')
    const receiptSuffix = digits.slice(-6) || String(idx + 1).padStart(6, '0')

    return {
      paymentDate: p.paymentDate,
      receiptNumber: receiptSuffix,
      studentId: digits.slice(0, 8) || '30067873',
      studentName: p.studentName || '',
      courseName: p.courseName || '',
      amount: Number(p.amount) || 0,
      observations: `Pago ${p.method || ''}`.trim()
    }
  })

  const formatDate = (dateString) => {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-ES')
  }

  const formatMoney = (val) => {
    return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const escapeHtml = (v) => {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const formatMonthYear = (monthString) => {
    if (!monthString || typeof monthString !== 'string' || !monthString.includes('-')) return ''
    const [y, m] = monthString.split('-').map(Number)
    if (!y || !m) return ''
    const d = new Date(y, m - 1, 1)
    const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const now = new Date()

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte de Ingresos</title>
  <style>
    @page { size: auto; margin: 3mm; }
    body {
      margin: 0;
      padding: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      background: #fff;
      color: #111;
    }

    .receipt {
      max-width: 420px;
      margin: 0 auto;
    }

    .center { text-align: center; }
    .muted { color: #444; }
    .line { border-top: 1px dashed #111; margin: 8px 0; }
    .small { font-size: 11px; }
    .xs { font-size: 10px; }
    .bold { font-weight: 800; }

    .logo {
      width: 124px;
      height: auto;
      margin: 0 0 8px;
      display: block;
    }

    .header-cell {
      padding-left: 7mm;
      padding-right: 3mm;
    }

    .table-wrap {
      padding-left: 5mm;
      padding-right: 5mm;
      box-sizing: border-box;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th, td {
      padding: 6px 4px;
      vertical-align: top;
    }

    th {
      text-align: left;
      border-bottom: 1px solid #111;
      padding-bottom: 5px;
    }

    tbody tr td {
      border-bottom: 1px dotted rgba(0, 0, 0, 0.35);
    }

    .text-right { text-align: right; }

    .totals {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      font-weight: 800;
    }

    @media print {
      body { margin: 0; }

      .receipt {
        max-width: none;
        margin: 0;
      }

      .header-cell {
        padding-left: 6mm;
        padding-right: 2mm;
      }

      .table-wrap {
        padding-left: 4mm;
        padding-right: 4mm;
      }

      thead {
        display: table-header-group;
      }

      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th colspan="6" class="header-cell">
              <img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />
              <div class="center bold small">+code</div>
              <div class="center xs muted">REPORTE DE INGRESOS</div>
              <div class="center xs muted">Correspondiente a: ${escapeHtml(formatMonthYear(month))}</div>
              <div class="line"></div>
              <div class="xs muted">Fecha/Hora: ${escapeHtml(now.toLocaleString('es-ES'))}</div>
              <div class="line"></div>
            </th>
          </tr>
          <tr>
            <th style="width: 68px;">Fecha</th>
            <th style="width: 60px;">Recibo</th>
            <th style="width: 86px;">Cédula</th>
            <th>Estudiante</th>
            <th style="width: 64px;">Curso</th>
            <th style="width: 72px;" class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${escapeHtml(formatDate(r.paymentDate))}</td>
              <td>${escapeHtml(r.receiptNumber)}</td>
              <td>${escapeHtml(r.studentId)}</td>
              <td>${escapeHtml(r.studentName)}</td>
              <td>${escapeHtml(r.courseName)}</td>
              <td class="text-right">$${escapeHtml(formatMoney(r.amount))}</td>
            </tr>
            <tr>
              <td colspan="6" class="xs muted">${escapeHtml(r.observations)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="line"></div>
      <div class="totals">
        <div>TOTAL:</div>
        <div>$${escapeHtml(formatMoney(total))}</div>
      </div>
      <div class="line"></div>
    </div>
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
        window.close();
      }, 250);
    };
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return

  win.document.open()
  win.document.write(html)
  win.document.close()
}
