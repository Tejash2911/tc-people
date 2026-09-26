import express from 'express'
import { getPayslips, getPayslipById, getPayslipPDF, sendEmail } from '../controllers/payslipController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getPayslips)
router.get('/:id', getPayslipById)
router.get('/:id/pdf', getPayslipPDF)

router.post('/:id/send-email', authorizeRoles('HR Payroll Manager', 'Admin'), sendEmail)

export default router
