/**
 * Email service utilities
 */
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

dotenv.config()

/**
 * Configure Nodemailer transport
 * In order to send emails from a standard Gmail account,
 * you MUST use an "App Password" (16 chars) from your Google Account settings.
 */
const createTransport = () => {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass || user === 'your-email@gmail.com') {
    console.warn('⚠️ [Email] Email credentials NOT configured in .env. Falling back to MOCK mode.')
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  })
}

/**
 * Send a welcome email on user signup
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name
 */
export const sendWelcomeEmail = async (toEmail, userName) => {
  const transporter = createTransport()
  const mailOptions = {
    from: `"Plumb Health AI" <${process.env.EMAIL_USER || 'noreply@plumb-health-ai.com'}>`,
    to: toEmail,
    subject: '👋 Welcome to Plumb Health AI!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h1 style="color: #6366f1; text-align: center;">Welcome to Plumb Health AI!</h1>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Thank you for signing up. You can now upload your health reports and get instant AI-powered analysis and insights.</p>
        <p>We’re excited to help you on your health journey!</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          © 2026 Plumb Health AI. Empowering your health with AI intelligence.
        </p>
      </div>
    `
  }
  if (!transporter) {
    console.log('--------------------------------------------------')
    console.log('📧 [MOCK EMAIL SENT]')
    console.log(`TO: ${toEmail}`)
    console.log(`SUBJECT: ${mailOptions.subject}`)
    console.log('CONTENT: User signup welcome email.')
    console.log('--------------------------------------------------')
    return { success: true, message: 'Mock email logged (Credentials missing)' }
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ [Email] Welcome Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ [Email] Failed to send welcome email:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send an invoice email for PRO membership activation
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name
 * @param {object} invoiceData - Invoice details (id, amount, date)
 */
export const sendInvoiceEmail = async (toEmail, userName, invoiceData) => {
  const transporter = createTransport()
  const { invoiceId, amount, date } = invoiceData

  // Generate PDF invoice using pdfkit
  const doc = new PDFDocument({ margin: 50 })
  const bufs = []
  doc.on('data', d => bufs.push(d))
  doc.fontSize(22).fillColor('#6366f1').text('Invoice for PRO Membership', { align: 'center' })
  doc.moveDown()
  doc.fontSize(14).fillColor('black').text(`Hi ${userName},`)
  doc.moveDown(0.5)
  doc.text('Thank you for upgrading to Plumb Health AI PRO! Here is your invoice:')
  doc.moveDown()
  doc.fontSize(12)
  doc.text(`Invoice ID: ${invoiceId}`)
  doc.text(`Date: ${date}`)
  doc.text(`Amount: ₹${amount}`)
  doc.moveDown()
  doc.text('If you have any questions, reply to this email.')
  doc.moveDown(2)
  doc.fontSize(10).fillColor('#64748b').text('© 2026 Plumb Health AI. Empowering your health with AI intelligence.', { align: 'center' })
  doc.end()
  const pdfBuffer = await new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(bufs)))
    doc.on('error', reject)
  })

  const mailOptions = {
    from: `"Plumb Health AI" <${process.env.EMAIL_USER || 'noreply@plumb-health-ai.com'}>`,
    to: toEmail,
    subject: '🧾 Your PRO Membership Invoice',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Invoice for PRO Membership</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Thank you for upgrading to <strong>Plumb Health AI PRO</strong>! Here is your invoice attached as a PDF.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td><strong>Invoice ID:</strong></td><td>${invoiceId}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${date}</td></tr>
          <tr><td><strong>Amount:</strong></td><td>₹${amount}</td></tr>
        </table>
        <p>If you have any questions, reply to this email.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          © 2026 Plumb Health AI. Empowering your health with AI intelligence.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `Plumb HealthAI_Invoice_${invoiceId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  }
  if (!transporter) {
    console.log('--------------------------------------------------')
    console.log('📧 [MOCK EMAIL SENT]')
    console.log(`TO: ${toEmail}`)
    console.log(`SUBJECT: ${mailOptions.subject}`)
    console.log('CONTENT: Invoice email.')
    console.log('--------------------------------------------------')
    return { success: true, message: 'Mock email logged (Credentials missing)' }
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ [Email] Invoice Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ [Email] Failed to send invoice email:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send a report to the user's email
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name
 * @param {object} reportData - Report details (summary, fileUrl, etc)
 */
export const sendReportEmail = async (toEmail, userName, reportData) => {
  const transporter = createTransport()
  const { summary, fileUrl } = reportData
  const mailOptions = {
    from: `"Plumb Health AI" <${process.env.EMAIL_USER || 'noreply@plumb-health-ai.com'}>`,
    to: toEmail,
    subject: '📄 Your Health Report is Ready',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Your Health Report</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your health report has been analyzed. Here is a summary:</p>
        <pre style="background: #f1f5f9; padding: 12px; border-radius: 6px;">${summary}</pre>
        <p>You can <a href="${fileUrl}">download your report here</a>.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          © 2026 Plumb Health AI. Empowering your health with AI intelligence.
        </p>
      </div>
    `
  }
  if (!transporter) {
    console.log('--------------------------------------------------')
    console.log('📧 [MOCK EMAIL SENT]')
    console.log(`TO: ${toEmail}`)
    console.log(`SUBJECT: ${mailOptions.subject}`)
    console.log('CONTENT: Report email.')
    console.log('--------------------------------------------------')
    return { success: true, message: 'Mock email logged (Credentials missing)' }
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ [Email] Report Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ [Email] Failed to send report email:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send a welcome email for PRO membership upgrades
 * @param {string} toEmail   - The recipient's email address
 * @param {string} userName  - The recipient's name
 */
export const sendProUpgradeEmail = async (toEmail, userName) => {
  const transporter = createTransport()

  const mailOptions = {
    from: `"Plumb Health AI" <${process.env.EMAIL_USER || 'noreply@plumb-health-ai.com'}>`,
    to: toEmail,
    subject: '🌟 Welcome to Plumb Health AI PRO!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h1 style="color: #6366f1; text-align: center;">You're now a PRO member!</h1>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Congratulations! Your upgrade to <strong>Plumb Health AI PRO</strong> is successful. You now have full access to our premium health management features:</p>
        <ul style="line-height: 1.6;">
          <li>✨ <strong>Unlimited AI Deep-Analysis</strong> for all your medical reports.</li>
          <li>🎯 <strong>Historical Health Trends</strong> — track your health over time.</li>
          <li>👨‍⚕️ <strong>1-on-1 Doctor Consultation</strong> — your first expert review is ready!</li>
          <li>📊 <strong>Clinical Summaries</strong> — getting doctor-like narratives for every report.</li>
        </ul>
        <p>We're thrilled to have you as a PRO member. For any questions, just reply to this email.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          © 2026 Plumb Health AI. Empowering your health with AI intelligence.
        </p>
      </div>
    `
  }

  if (!transporter) {
    // Mock Mode Logs
    console.log('--------------------------------------------------')
    console.log('📧 [MOCK EMAIL SENT]')
    console.log(`TO: ${toEmail}`)
    console.log(`SUBJECT: ${mailOptions.subject}`)
    console.log('CONTENT: User upgraded to PRO plan.')
    console.log('--------------------------------------------------')
    return { success: true, message: 'Mock email logged (Credentials missing)' }
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ [Email] PRO Upgrade Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ [Email] Failed to send upgrade email:', error.message)
    return { success: false, error: error.message }
  }
}

