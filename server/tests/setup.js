import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// Import all models to ensure they're registered with Mongoose
import User from '../src/models/user.model.js'
import Employee from '../src/models/employee.model.js'
import WorkingSchedule from '../src/models/working-schedule.model.js'
import Contract from '../src/models/contract.model.js'
import Attendance from '../src/models/attendance.model.js'
import TimeOffType from '../src/models/time-off-type.model.js'
import LeaveAllocation from '../src/models/leave-allocation.model.js'
import TimeOffRequest from '../src/models/time-off-request.model.js'
import SalaryRule from '../src/models/salary-rule.model.js'
import SalaryStructure from '../src/models/salary-structure.model.js'
import Payrun from '../src/models/payrun.model.js'
import Payslip from '../src/models/payslip.model.js'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { autoIndex: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
