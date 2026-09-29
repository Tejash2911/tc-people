import { getTransporter } from '../config/mailer.js'
import { config } from '../config/env.js'
import Payslip from '../models/Payslip.js'
import Payrun from '../models/Payrun.js'
import { generatePayslipPDF } from './pdfService.js'
import logger from '../utils/logger.js'

/**
 * Sends a single payslip via email with PDF attachment.
 *
 * @param {string} payslipId
 * @returns {Promise<Object>}
 */
const sendSinglePayslipEmail = async payslipId => {
  const payslip = await Payslip.findById(payslipId).populate('employee')
  if (!payslip) {
    throw new Error('Payslip not found')
  }

  const { employee, payrollPeriod } = payslip
  if (!employee || !employee.email) {
    payslip.emailStatus = 'Failed'
    payslip.emailError = 'Employee email address missing'
    await payslip.save()
    return { success: false, error: 'Employee email missing' }
  }

  try {
    const pdfBuffer = await generatePayslipPDF(payslip._id)
    const transporter = await getTransporter()

    const periodStr = `${new Date(payrollPeriod.start).toISOString().split('T')[0]} to ${new Date(payrollPeriod.end).toISOString().split('T')[0]}`

    const mailOptions = {
      from: `TC People HR & Payroll <${config.smtp.from}>`,
      to: employee.email,
      subject: `Payslip for Period ${periodStr} - TC People`,
      text: `Hello ${employee.firstName},\n\nPlease find attached your salary payslip for the period ${periodStr}.\n\nNet Amount Payable: ₹${payslip.net.toFixed(2)}\n\nBest regards,\nTC People HR & Payroll Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0F5C4A;">TC People HR &amp; Payroll</h2>
          <p>Dear <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
          <p>Your payslip for the period <strong>${periodStr}</strong> has been generated and finalized.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #0F5C4A; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Gross Earnings:</strong> ₹${payslip.gross.toFixed(2)}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Total Deductions:</strong> -₹${payslip.deductions.toFixed(2)}</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Net Payable:</strong> ₹${payslip.net.toFixed(2)}</p>
          </div>
          <p>Please find your detailed payslip attached as a PDF file.</p>
          <p>Regards,<br/><strong>TC People HR &amp; Payroll Operations</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${employee.employeeId}_${new Date(payrollPeriod.end).toISOString().slice(0, 7)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    payslip.emailStatus = 'Sent'
    payslip.emailSentAt = new Date()
    payslip.emailError = null
    await payslip.save()

    return { success: true, email: employee.email }
  } catch (error) {
    logger.error(`Error sending email to ${employee.email}:`, error.message)
    payslip.emailStatus = 'Failed'
    payslip.emailError = error.message
    await payslip.save()
    return { success: false, error: error.message }
  }
}

/**
 * Bulk sends all payslips for a given Payrun.
 *
 * @param {string} payrunId
 * @returns {Promise<Object>}
 */
const bulkSendPayrunPayslips = async payrunId => {
  const payrun = await Payrun.findById(payrunId)
  if (!payrun) {
    throw new Error('Payrun not found')
  }

  const payslips = await Payslip.find({ payrun: payrun._id })
  const results = {
    total: payslips.length,
    sent: 0,
    failed: 0,
    details: []
  }

  for (const slip of payslips) {
    const res = await sendSinglePayslipEmail(slip._id)
    if (res.success) {
      results.sent += 1
    } else {
      results.failed += 1
    }
    results.details.push({ payslipId: slip._id, ...res })
  }

  payrun.emailsSentAt = new Date()
  if (payrun.status === 'Paid') {
    payrun.status = 'PayslipsSent'
  }
  await payrun.save()

  return results
}

export { sendSinglePayslipEmail, bulkSendPayrunPayslips }
