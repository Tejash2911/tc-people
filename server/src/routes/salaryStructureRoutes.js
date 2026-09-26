import express from 'express'
import {
  getSalaryStructures,
  getSalaryStructureById,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure
} from '../controllers/salaryStructureController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), getSalaryStructures)

router.get(
  '/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getSalaryStructureById
)

router.post(
  '/',
  authorizeRoles('HR Payroll Manager', 'Admin'),
  validate(schemas.createSalaryStructure),
  createSalaryStructure
)

router.put(
  '/:id',
  authorizeRoles('HR Payroll Manager', 'Admin'),
  validate(schemas.updateSalaryStructure),
  updateSalaryStructure
)

router.delete('/:id', authorizeRoles('HR Payroll Manager', 'Admin'), deleteSalaryStructure)

export default router
