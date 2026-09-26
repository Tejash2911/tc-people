import express from 'express'
import {
  getContracts,
  getContractById,
  getApplicableContractForPeriod,
  createContract,
  updateContract,
  deleteContract
} from '../controllers/contractController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get(
  '/applicable',
  authorizeRoles('Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getApplicableContractForPeriod
)

router.get(
  '/',
  authorizeRoles('Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getContracts
)

router.get(
  '/:id',
  authorizeRoles('Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  getContractById
)

router.post(
  '/',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createContract),
  createContract
)

router.put(
  '/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updateContract),
  updateContract
)

router.delete('/:id', authorizeRoles('HR Manager', 'HR Payroll Manager', 'Admin'), deleteContract)

export default router
