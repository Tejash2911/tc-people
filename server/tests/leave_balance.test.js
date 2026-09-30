import './setup.js'
import Employee from '../src/models/employee.model.js'
import TimeOffType from '../src/models/time-off-type.model.js'
import LeaveAllocation from '../src/models/leave-allocation.model.js'
import TimeOffRequest from '../src/models/time-off-request.model.js'
import User from '../src/models/user.model.js'
import { approveLeaveRequest, getLeaveBalance } from '../src/services/leave.service.js'

describe('3. Time Off, Leave Allocation & Auto Balance Deduction Tests', () => {
  it('should approve leave request and automatically consume leave allocation balance', async () => {
    // 1. Setup Employee & Manager User
    const employee = await Employee.create({
      employeeId: 'EMP-201',
      firstName: 'Robert',
      lastName: 'Paul',
      email: 'robert@tcpeople.com',
      department: 'Operations',
      jobPosition: 'Coordinator',
      joiningDate: new Date('2024-01-01')
    })

    const hash = await User.hashPassword('Password@123')
    const managerUser = await User.create({
      name: 'HR Approver',
      email: 'approver@tcpeople.com',
      passwordHash: hash,
      role: 'HR Manager'
    })

    // 2. Setup Time Off Type requiring allocation
    const paidLeaveType = await TimeOffType.create({
      name: 'Annual Vacation',
      code: 'ANNUAL_VACATION',
      unit: 'days',
      allocationRequired: true,
      approvalRequired: true,
      isPaid: true
    })

    // 3. Grant 15 days Leave Allocation
    const allocation = await LeaveAllocation.create({
      employee: employee._id,
      timeOffType: paidLeaveType._id,
      allocatedAmount: 15,
      takenAmount: 0,
      remainingAmount: 15,
      validityStart: new Date('2026-01-01'),
      validityEnd: new Date('2026-12-31'),
      status: 'Approved'
    })

    // Initial balance check
    let balance = await getLeaveBalance(employee._id, paidLeaveType._id, new Date('2026-06-01'))
    expect(balance.allocated).toBe(15)
    expect(balance.taken).toBe(0)
    expect(balance.remaining).toBe(15)

    // 4. Create Time Off Request for 3 days
    const leaveRequest = await TimeOffRequest.create({
      employee: employee._id,
      timeOffType: paidLeaveType._id,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
      duration: 3,
      status: 'Pending',
      reason: 'Short family trip'
    })

    // 5. Manager Approves Request
    const approvedRequest = await approveLeaveRequest(leaveRequest._id, managerUser._id)
    expect(approvedRequest.status).toBe('Approved')
    expect(approvedRequest.approvedBy.toString()).toBe(managerUser._id.toString())

    // 6. Verify allocation was automatically consumed in backend
    const updatedAllocation = await LeaveAllocation.findById(allocation._id)
    expect(updatedAllocation.takenAmount).toBe(3)
    expect(updatedAllocation.remainingAmount).toBe(12)

    // Verify service balance reflects the reduction
    balance = await getLeaveBalance(employee._id, paidLeaveType._id, new Date('2026-06-01'))
    expect(balance.taken).toBe(3)
    expect(balance.remaining).toBe(12)
  })

  it('should prevent approval if requested duration exceeds remaining balance', async () => {
    const employee = await Employee.create({
      employeeId: 'EMP-202',
      firstName: 'Clara',
      lastName: 'Oswald',
      email: 'clara@tcpeople.com',
      department: 'Support',
      jobPosition: 'Specialist',
      joiningDate: new Date('2024-01-01')
    })

    const hash = await User.hashPassword('Password@123')
    const managerUser = await User.create({
      name: 'HR Manager 2',
      email: 'hrmgr2@tcpeople.com',
      passwordHash: hash,
      role: 'HR Manager'
    })

    const sickLeaveType = await TimeOffType.create({
      name: 'Sick Leave Policy',
      code: 'SICK_POL',
      unit: 'days',
      allocationRequired: true,
      approvalRequired: true,
      isPaid: true
    })

    // Grant 2 days only
    await LeaveAllocation.create({
      employee: employee._id,
      timeOffType: sickLeaveType._id,
      allocatedAmount: 2,
      takenAmount: 0,
      remainingAmount: 2,
      validityStart: new Date('2026-01-01'),
      validityEnd: new Date('2026-12-31'),
      status: 'Approved'
    })

    // Request 5 days (exceeds 2 days available)
    const leaveRequest = await TimeOffRequest.create({
      employee: employee._id,
      timeOffType: sickLeaveType._id,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-05'),
      duration: 5,
      status: 'Pending',
      reason: 'Medical recovery'
    })

    // Approval should throw insufficient balance error
    await expect(approveLeaveRequest(leaveRequest._id, managerUser._id)).rejects.toThrow('Insufficient leave balance')
  })
})
