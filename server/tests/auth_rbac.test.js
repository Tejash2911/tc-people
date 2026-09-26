import './setup.js'
import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/User.js'

describe('1. Authentication & RBAC Authorization Tests', () => {
  it('should register a new user successfully and return a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@tcpeople.com',
      password: 'Password@123',
      role: 'Employee'
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('jane@tcpeople.com')
    expect(res.body.data.user.passwordHash).toBeUndefined() // Security check
  })

  it('should login an existing user and return a JWT', async () => {
    const hash = await User.hashPassword('Password@123')
    await User.create({
      name: 'HR Admin',
      email: 'hradmin@tcpeople.com',
      passwordHash: hash,
      role: 'HR Manager'
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'hradmin@tcpeople.com',
      password: 'Password@123'
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.role).toBe('HR Manager')
  })

  it('should enforce RBAC: Employee cannot access restricted HR endpoints', async () => {
    // Create and login as Employee
    const hash = await User.hashPassword('Password@123')
    const empUser = await User.create({
      name: 'Regular Employee',
      email: 'emp@tcpeople.com',
      passwordHash: hash,
      role: 'Employee'
    })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@tcpeople.com', password: 'Password@123' })

    const token = loginRes.body.data.token

    // Try to create a salary structure (requires HR Payroll Manager or Admin)
    const res = await request(app).post('/api/salary-structures').set('Authorization', `Bearer ${token}`).send({
      name: 'Unauthorized Structure',
      code: 'UNAUTH_01',
      rules: []
    })

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toContain('Forbidden')
  })

  it('should enforce RBAC: HR Payroll User has read-only access to salary structures', async () => {
    const hash = await User.hashPassword('Password@123')
    await User.create({
      name: 'Payroll Reader',
      email: 'payrollreader@tcpeople.com',
      passwordHash: hash,
      role: 'HR Payroll User'
    })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'payrollreader@tcpeople.com', password: 'Password@123' })

    const token = loginRes.body.data.token

    // Read salary structures -> should be allowed
    const getRes = await request(app).get('/api/salary-structures').set('Authorization', `Bearer ${token}`)

    expect(getRes.status).toBe(200)

    // Create salary structure -> should be forbidden for HR Payroll User (only Manager/Admin can create)
    const postRes = await request(app).post('/api/salary-structures').set('Authorization', `Bearer ${token}`).send({
      name: 'Payroll Reader Structure',
      code: 'PR_01',
      rules: []
    })

    expect(postRes.status).toBe(403)
  })
})
