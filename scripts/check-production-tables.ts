import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductionTables() {
  try {
    console.log('Checking production database tables...')
    
    // Check if WorkflowRule table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%workflow%'
    `
    
    console.log('Tables with "workflow" in name:', tables)
    
    // Check all tables
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    console.log('All tables in database:', allTables)
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionTables()

