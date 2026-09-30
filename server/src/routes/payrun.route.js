import express from 'express'
import {
  getPayruns,
  getPayrunById,
  getPayrunEligibleEmployees,
  createPayrun,
  updatePayrun,
  compute,
  validate as payrunValidate,
  markPaid,
  sendPayslips
} from '../controllers/payrun.controller.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get(
  '/eligible-employees',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getPayrunEligibleEmployees
)

router.get('/', authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), getPayruns)

router.get('/:id', authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), getPayrunById)

router.post(
  '/',
  authorizeRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createPayrun),
  createPayrun
)

router.put(
  '/:id',
  authorizeRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updatePayrun),
  updatePayrun
)

// Payrun Processing Actions
router.post('/:id/compute', authorizeRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'), compute)

router.post('/:id/validate', authorizeRoles('HR Payroll Manager', 'Admin'), payrunValidate)

router.post('/:id/mark-paid', authorizeRoles('HR Payroll Manager', 'Admin'), markPaid)

router.post('/:id/send-payslips', authorizeRoles('HR Payroll Manager', 'Admin'), sendPayslips)

export default router
