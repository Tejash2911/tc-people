import express from 'express'
import cors from 'cors'
import { errorHandler, AppError } from './middleware/errorMiddleware.js'

// Route imports
import authRoutes from './routes/authRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import contractRoutes from './routes/contractRoutes.js'
import scheduleRoutes from './routes/scheduleRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import timeOffRoutes from './routes/timeOffRoutes.js'
import salaryStructureRoutes from './routes/salaryStructureRoutes.js'
import salaryRuleRoutes from './routes/salaryRuleRoutes.js'
import payrunRoutes from './routes/payrunRoutes.js'
import payslipRoutes from './routes/payslipRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'TC People – HR & Payroll API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      employees: '/api/employees',
      contracts: '/api/contracts',
      schedules: '/api/schedules',
      attendance: '/api/attendance',
      timeOff: '/api/time-off',
      salaryStructures: '/api/salary-structures',
      salaryRules: '/api/salary-rules',
      payruns: '/api/payruns',
      payslips: '/api/payslips',
      dashboard: '/api/dashboard'
    }
  })
})

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TC People - HR & Payroll REST API',
    status: 'online'
  })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'TC People – HR & Payroll API',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/time-off', timeOffRoutes)
app.use('/api/salary-structures', salaryStructureRoutes)
app.use('/api/salary-rules', salaryRuleRoutes)
app.use('/api/payruns', payrunRoutes)
app.use('/api/payslips', payslipRoutes)
app.use('/api/dashboard', dashboardRoutes)

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404))
})

// Centralized Global Error Handler
app.use(errorHandler)

export default app
