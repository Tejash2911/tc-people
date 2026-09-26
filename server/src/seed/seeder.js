import { connectDB, disconnectDB } from '../config/db.js'
import seedDatabase from './seedData.js'

const runSeeder = async () => {
  try {
    await connectDB()
    await seedDatabase()
    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('[Seeder Error] Seeding failed:', error)
    process.exit(1)
  }
}

runSeeder()
