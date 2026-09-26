import express from 'express'
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getSchedules)
router.get('/:id', getScheduleById)

router.post(
  '/',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.createSchedule),
  createSchedule
)

router.put(
  '/:id',
  authorizeRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'),
  validate(schemas.updateSchedule),
  updateSchedule
)

router.delete('/:id', authorizeRoles('HR Manager', 'HR Payroll Manager', 'Admin'), deleteSchedule)

export default router
