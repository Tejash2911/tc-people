import express from 'express'
import {
  getSalaryRules,
  getSalaryRuleById,
  createSalaryRule,
  updateSalaryRule,
  deleteSalaryRule
} from '../controllers/salaryRuleController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), getSalaryRules)

router.get('/:id', authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), getSalaryRuleById)

router.post('/', authorizeRoles('HR Payroll Manager', 'Admin'), validate(schemas.createSalaryRule), createSalaryRule)

router.put('/:id', authorizeRoles('HR Payroll Manager', 'Admin'), validate(schemas.updateSalaryRule), updateSalaryRule)

router.delete('/:id', authorizeRoles('HR Payroll Manager', 'Admin'), deleteSalaryRule)

export default router
