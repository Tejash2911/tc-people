import express from 'express'
import { getDashboardMetrics, getAttendanceOverview } from '../controllers/dashboardController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.get(
  '/payroll',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getDashboardMetrics
)

router.get(
  '/attendance-overview',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getAttendanceOverview
)

export default router
