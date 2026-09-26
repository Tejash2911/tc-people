import express from 'express'
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getEmployees)
router.get('/:id', getEmployeeById)

router.post(
  '/',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createEmployee),
  createEmployee
)

router.put(
  '/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updateEmployee),
  updateEmployee
)

router.delete('/:id', authorizeRoles('HR Manager', 'HR Payroll Manager', 'Admin'), deleteEmployee)

export default router
