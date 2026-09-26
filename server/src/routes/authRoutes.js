import express from 'express'
import { register, login, getMe, getUsers, updateUserRole } from '../controllers/authController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { schemas } from '../validators/schemas.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/register', validate(schemas.register), register)
router.post('/login', validate(schemas.login), login)
router.get('/me', authenticateUser, getMe)
router.get('/users', authenticateUser, authorizeRoles('Admin'), getUsers)
router.patch('/users/:id/role', authenticateUser, authorizeRoles('Admin'), updateUserRole)

export default router
