/**
 * pdf-generator.js — Módulo de generación de recibos PDF
 * Usa la API nativa de impresión del navegador para generar recibos
 */

import { getPayments, getEnrollments, getStudents, getCourses } from './data.js'
import { getTeachers, getTeacherPaymentHistory } from './teachers.js'

export async function generatePaymentReceipt(paymentId) {
    // Obtener datos del pago
    const payments = await getPayments()
    const enrollments = await getEnrollments()
    const students = await getStudents()
    const courses = await getCourses()
    
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) {
        alert('Pago no encontrado')
        return
    }

    const enrollment = enrollments.find(e => e.id === payment.enrollmentId)
    const student = students.find(s => s.id === enrollment?.studentId)
    const course = courses.find(c => c.id === enrollment?.courseId)

    const escapeHtml = (v) => {
        return String(v ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const formatDate = (dateString) => {
        const d = new Date(dateString)
        if (Number.isNaN(d.getTime())) return ''
        return d.toLocaleDateString('es-ES')
    }

    const getMethodLabel = (method) => {
        const labels = {
            Cash: 'Efectivo',
            Card: 'Tarjeta',
            Transfer: 'Transferencia',
            Check: 'Cheque'
        }
        return labels[method] || method || ''
    }

    const ymd = String(payment.paymentDate || '').slice(0, 10).replaceAll('-', '')
    const controlNumber = `CTRL-${ymd || '00000000'}-${String(payment.id).padStart(6, '0')}`
    
    // Crear contenido HTML para el recibo
    const receiptContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Recibo de Pago ${controlNumber}</title>
            <style>
              @page { size: auto; margin: 3mm; }
              body {
                margin: 0;
                padding: 0;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 13px;
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
              .small { font-size: 12px; }
              .xs { font-size: 11px; }
              .bold { font-weight: 800; }
              .text-right { text-align: right; }

              .title { font-size: 16px; letter-spacing: 0.2px; }

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

              .totals {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 10px;
              }

              .stamp {
                margin-top: 6px;
                display: inline-block;
                border: 1px dashed rgba(0,0,0,0.55);
                padding: 6px 10px;
                border-radius: 6px;
              }
            </style>
        </head>
        <body>
            <div class="receipt">
              <div class="header-cell">
                <div class="center">
                  <img class="logo" src="/assets/uploads/pluscodeprint.png" alt="Logo" onerror="this.style.display='none'" />
                  <div class="bold title">RECIBO DE PAGO</div>
                  <div class="muted small">Academia +code</div>
                  <div class="stamp xs bold">${escapeHtml(controlNumber)}</div>
                </div>

                <div class="line"></div>

                <div class="small">
                  <div><span class="bold">Fecha:</span> ${escapeHtml(formatDate(payment.paymentDate))}</div>
                  <div><span class="bold">Referencia:</span> ${escapeHtml(payment.reference || 'N/A')}</div>
                  <div><span class="bold">Método:</span> ${escapeHtml(getMethodLabel(payment.method))}</div>
                  <div><span class="bold">Estado:</span> ${escapeHtml(payment.status === 'Paid' ? 'Pagado' : payment.status || '')}</div>
                </div>

                <div class="line"></div>

                <div class="small">
                  <div class="bold">Datos del Estudiante</div>
                  <div>${escapeHtml(`${student?.name || ''} ${student?.lastName || ''}`.trim() || 'N/A')}</div>
                  <div class="muted">C.I: ${escapeHtml(student?.idNumber || 'N/A')}</div>
                </div>

                <div class="line"></div>
              </div>

              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th class="text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${escapeHtml(`Pago de matrícula/curso: ${course?.name || 'N/A'} ${course?.code ? `(${course.code})` : ''}`.trim())}</td>
                      <td class="text-right">$${escapeHtml(formatMoney(payment.amount))}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="line"></div>

                <div class="totals small">
                  <div class="bold">TOTAL PAGADO</div>
                  <div class="bold">$${escapeHtml(formatMoney(payment.amount))}</div>
                </div>

                <div class="line"></div>

                <div class="center xs muted">
                  Documento generado automáticamente. Conserva este recibo.
                </div>
              </div>
            </div>
        </body>
        </html>
    `
    
    // Abrir nueva ventana para imprimir
    const printWindow = window.open('', '_blank')
    printWindow.document.write(receiptContent)
    printWindow.document.close()
    
    // Esperar a que cargue y mostrar diálogo de impresión
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }
}

export async function generateTeacherPaymentReceipt(teacherPaymentId) {
    const teachers = await getTeachers()
    // Obtenemos todos los pagos de docentes, pero como la API suele filtrar, busquemos directamente o listemos
    // Simulamos un fetch completo aquí para mantener la lógica igual
    const teacherPayments = (await Promise.all(teachers.map(t => getTeacherPaymentHistory(t.id)))).flat()

    const payment = teacherPayments.find(p => p.id === teacherPaymentId)
    if (!payment) {
        alert('Pago de nómina no encontrado')
        return
    }

    const teacher = teachers.find(t => t.id === payment.teacherId) || {}

    const escapeHtml = (v) => {
        return String(v ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const formatDate = (d) => {
        const x = new Date(d)
        if (Number.isNaN(x.getTime())) return ''
        return x.toLocaleDateString('es-ES')
    }

    const ymd = String(payment.paymentDate || '').slice(0, 10).replaceAll('-', '')
    const controlNumber = `NOM-${ymd || '00000000'}-${String(payment.id).padStart(6, '0')}`

    const receiptContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Comprobante de Nómina ${controlNumber}</title>
          <style>
            @page { size: auto; margin: 3mm; }
            body {
              margin: 0;
              padding: 0;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 13px;
              background: #fff;
              color: #111;
            }

            .receipt { max-width: 420px; margin: 0 auto; }
            .center { text-align: center; }
            .muted { color: #444; }
            .line { border-top: 1px dashed #111; margin: 8px 0; }
            .small { font-size: 12px; }
            .xs { font-size: 11px; }
            .bold { font-weight: 800; }
            .text-right { text-align: right; }

            .logo {
              width: 124px;
              height: auto;
              margin: 0 0 8px;
              display: block;
            }

            .header-cell { padding-left: 7mm; padding-right: 3mm; }
            .table-wrap { padding-left: 5mm; padding-right: 5mm; box-sizing: border-box; }
            .title { font-size: 16px; letter-spacing: 0.2px; }

            .stamp {
              margin-top: 6px;
              display: inline-block;
              border: 1px dashed rgba(0,0,0,0.55);
              padding: 6px 10px;
              border-radius: 6px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th, td { padding: 6px 4px; vertical-align: top; }
            th { text-align: left; border-bottom: 1px solid #111; padding-bottom: 5px; }
            tbody tr td { border-bottom: 1px dotted rgba(0, 0, 0, 0.35); }

            .totals {
              display: flex;
              align-items: baseline;
              justify-content: space-between;
              gap: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header-cell">
              <div class="center">
                <img class="logo" src="/assets/uploads/pluscode-logo.png" alt="Logo" onerror="this.style.display='none'" />
                <div class="bold title">COMPROBANTE DE NÓMINA</div>
                <div class="muted small">Academia +code</div>
                <div class="stamp xs bold">${escapeHtml(controlNumber)}</div>
              </div>

              <div class="line"></div>

              <div class="small">
                <div><span class="bold">Período:</span> ${escapeHtml(payment.period || '')}</div>
                <div><span class="bold">Fecha de pago:</span> ${escapeHtml(formatDate(payment.paymentDate))}</div>
                <div><span class="bold">Referencia:</span> ${escapeHtml(payment.reference || 'N/A')}</div>
              </div>

              <div class="line"></div>

              <div class="small">
                <div class="bold">Datos del Docente</div>
                <div>${escapeHtml(`${teacher?.name || ''} ${teacher?.lastName || ''}`.trim() || 'N/A')}</div>
                <div class="muted">C.I: ${escapeHtml(teacher?.idNumber || 'N/A')}</div>
                <div class="muted">Especialidad: ${escapeHtml(teacher?.specialty || 'N/A')}</div>
              </div>

              <div class="line"></div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th class="text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Horas trabajadas (${escapeHtml(payment.hoursWorked)}) x $${escapeHtml(formatMoney(payment.hourlyRate))}</td>
                    <td class="text-right">$${escapeHtml(formatMoney(payment.baseSalary))}</td>
                  </tr>
                  <tr>
                    <td>Bonos</td>
                    <td class="text-right">$${escapeHtml(formatMoney(payment.bonuses))}</td>
                  </tr>
                  <tr>
                    <td>Deducciones</td>
                    <td class="text-right">-$${escapeHtml(formatMoney(payment.deductions))}</td>
                  </tr>
                </tbody>
              </table>

              <div class="line"></div>

              <div class="totals small">
                <div class="bold">TOTAL PAGADO</div>
                <div class="bold">$${escapeHtml(formatMoney(payment.totalSalary))}</div>
              </div>

              <div class="line"></div>

              <div class="center xs muted">
                Documento generado automáticamente. Conserva este comprobante.
              </div>
            </div>
          </div>
        </body>
        </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(receiptContent)
    printWindow.document.close()

    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }
}

export async function generateEnrollmentStatement(studentId) {
    // Obtener datos del estudiante
    const students = await getStudents()
    const enrollments = await getEnrollments()
    const courses = await getCourses()
    const payments = await getPayments()
    
    const student = students.find(s => s.id === studentId)
    if (!student) {
        alert('Estudiante no encontrado')
        return
    }

    const escapeHtml = (v) => {
        return String(v ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const today = new Date()
    const formatDate = (d) => {
        const x = new Date(d)
        if (Number.isNaN(x.getTime())) return ''
        return x.toLocaleDateString('es-ES')
    }

    const ymd = today.toISOString().slice(0, 10).replaceAll('-', '')
    const controlNumber = `EC-${ymd}-${String(studentId).padStart(6, '0')}`
    
    // Obtener matrículas y pagos del estudiante
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId)
    const studentPaymentIds = studentEnrollments.map(e => e.id)
    const studentPayments = payments.filter(p => studentPaymentIds.includes(p.enrollmentId))
    
    // Calcular balances
    const courseBalances = studentEnrollments.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId) || {}
        const enrollmentPayments = studentPayments.filter(p => p.enrollmentId === enrollment.id)
        const paidAmount = enrollmentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        const fee = Number(course.fee) || 0
        const balance = fee - paidAmount
        
        return {
            course: course,
            enrollment: enrollment,
            paid: paidAmount,
            balance: balance,
            status: balance <= 0 ? 'Solvente' : 'Pendiente',
            fee
        }
    })
    
    const totalOwed = courseBalances.reduce((sum, cb) => sum + Math.max(0, Number(cb.balance) || 0), 0)
    const totalPaid = courseBalances.reduce((sum, cb) => sum + cb.paid, 0)
    
    // Crear contenido HTML para el estado de cuenta
    const statementContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Estado de Cuenta ${controlNumber}</title>
            <style>
              @page { size: auto; margin: 3mm; }
              body {
                margin: 0;
                padding: 0;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 13px;
                background: #fff;
                color: #111;
              }

              .statement { max-width: 420px; margin: 0 auto; }
              .center { text-align: center; }
              .muted { color: #444; }
              .line { border-top: 1px dashed #111; margin: 8px 0; }
              .small { font-size: 12px; }
              .xs { font-size: 11px; }
              .bold { font-weight: 800; }
              .text-right { text-align: right; }

              .logo {
                width: 124px;
                height: auto;
                margin: 0 0 8px;
                display: block;
              }

              .header-cell { padding-left: 7mm; padding-right: 3mm; }
              .table-wrap { padding-left: 5mm; padding-right: 5mm; box-sizing: border-box; }

              .title { font-size: 16px; letter-spacing: 0.2px; }

              .stamp {
                margin-top: 6px;
                display: inline-block;
                border: 1px dashed rgba(0,0,0,0.55);
                padding: 6px 10px;
                border-radius: 6px;
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

              .totals {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 10px;
              }
            </style>
        </head>
        <body>
          <div class="statement">
            <div class="header-cell">
              <div class="center">
                <img class="logo" src="/assets/uploads/pluscode-logo.png" alt="Logo" onerror="this.style.display='none'" />
                <div class="bold title">ESTADO DE CUENTA</div>
                <div class="muted small">Academia +code</div>
                <div class="stamp xs bold">${escapeHtml(controlNumber)}</div>
              </div>

              <div class="line"></div>

              <div class="small">
                <div><span class="bold">Fecha:</span> ${escapeHtml(formatDate(today))}</div>
              </div>

              <div class="line"></div>

              <div class="small">
                <div class="bold">Datos del Estudiante</div>
                <div>${escapeHtml(`${student?.name || ''} ${student?.lastName || ''}`.trim() || 'N/A')}</div>
                <div class="muted">C.I: ${escapeHtml(student?.idNumber || 'N/A')}</div>
                <div class="muted">Correo: ${escapeHtml(student?.email || 'N/A')}</div>
                <div class="muted">Teléfono: ${escapeHtml(student?.phone || 'N/A')}</div>
              </div>

              <div class="line"></div>

              <div class="totals small">
                <div>Pagado:</div>
                <div class="bold">$${escapeHtml(formatMoney(totalPaid))}</div>
              </div>
              <div class="totals small">
                <div>Debe:</div>
                <div class="bold">$${escapeHtml(formatMoney(totalOwed))}</div>
              </div>

              <div class="line"></div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th class="text-right">Cuota</th>
                    <th class="text-right">Pagado</th>
                    <th class="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  ${courseBalances.map(cb => {
                    const saldo = Math.max(0, Number(cb.balance) || 0)
                    return `
                      <tr>
                        <td>${escapeHtml(`${cb.course?.name || 'N/A'} ${cb.course?.code ? `(${cb.course.code})` : ''}`.trim())}</td>
                        <td class="text-right">$${escapeHtml(formatMoney(cb.fee))}</td>
                        <td class="text-right">$${escapeHtml(formatMoney(cb.paid))}</td>
                        <td class="text-right">$${escapeHtml(formatMoney(saldo))}</td>
                      </tr>
                    `
                  }).join('')}
                </tbody>
              </table>

              <div class="line"></div>

              <div class="center xs muted">
                Documento generado automáticamente. Para dudas, contacte administración.
              </div>
            </div>
          </div>
        </body>
        </html>
    `
    
    // Abrir nueva ventana para imprimir
    const printWindow = window.open('', '_blank')
    printWindow.document.write(statementContent)
    printWindow.document.close()
    
    // Esperar a que cargue y mostrar diálogo de impresión
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }
}
