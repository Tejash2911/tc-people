import express from 'express'
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  togglePunch,
  deleteAttendance
} from '../controllers/attendance.controller.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'

const router = express.Router()

router.use(authenticateUser)

router.post('/punch', togglePunch)
router.get('/', getAttendance)
router.get('/:id', getAttendanceById)
router.post('/', validate(schemas.createAttendance), createAttendance)
router.put('/:id', validate(schemas.updateAttendance), updateAttendance)
router.delete('/:id', authorizeRoles('HR Manager', 'HR Payroll Manager', 'Admin'), deleteAttendance)

export default router
