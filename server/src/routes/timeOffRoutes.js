import express from 'express'
import {
  getTimeOffTypes,
  createTimeOffType,
  updateTimeOffType,
  deleteTimeOffType,
  getLeaveAllocations,
  createLeaveAllocation,
  updateLeaveAllocation,
  approveLeaveAllocation,
  getTimeOffRequests,
  getTimeOffRequestById,
  createTimeOffRequest,
  updateTimeOffRequest,
  approveRequest,
  refuseRequest,
  getEmployeeLeaveBalance
} from '../controllers/timeOffController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

// Balance lookup
router.get('/balance', getEmployeeLeaveBalance)

// Time Off Types
router.get('/types', getTimeOffTypes)
router.post(
  '/types',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createTimeOffType),
  createTimeOffType
)
router.put(
  '/types/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updateTimeOffType),
  updateTimeOffType
)
router.delete('/types/:id', authorizeRoles('HR Manager', 'HR Payroll Manager', 'Admin'), deleteTimeOffType)

// Leave Allocations
router.get('/allocations', getLeaveAllocations)
router.post(
  '/allocations',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createLeaveAllocation),
  createLeaveAllocation
)
router.put(
  '/allocations/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updateLeaveAllocation),
  updateLeaveAllocation
)
router.post(
  '/allocations/:id/approve',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  approveLeaveAllocation
)

// Time Off Requests
router.get('/requests', getTimeOffRequests)
router.get('/requests/:id', getTimeOffRequestById)
router.post('/requests', validate(schemas.createTimeOffRequest), createTimeOffRequest)
router.put('/requests/:id', validate(schemas.createTimeOffRequest), updateTimeOffRequest)
router.post(
  '/requests/:id/approve',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  approveRequest
)
router.post(
  '/requests/:id/refuse',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.refuseTimeOffRequest),
  refuseRequest
)

export default router
