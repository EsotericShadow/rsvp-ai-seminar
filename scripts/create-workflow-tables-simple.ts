import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createWorkflowTables() {
  try {
    console.log('Creating WorkflowRule table...')
    
    // Create WorkflowRule table
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "WorkflowRule" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "triggerType" TEXT NOT NULL, "triggerConfig" JSONB NOT NULL, "conditions" JSONB NOT NULL, "actions" JSONB NOT NULL, "isEnabled" BOOLEAN NOT NULL DEFAULT false, "runCount" INTEGER NOT NULL DEFAULT 0, "lastRun" TIMESTAMP(3), "nextRun" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "campaignId" TEXT)`
    
    console.log('Creating WorkflowExecution table...')
    
    // Create WorkflowExecution table
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "WorkflowExecution" ("id" TEXT PRIMARY KEY, "workflowId" TEXT NOT NULL, "status" TEXT NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3), "error" TEXT, "meta" JSONB)`
    
    console.log('Creating indexes...')
    
    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "WorkflowExecution_workflowId_idx" ON "WorkflowExecution"("workflowId")`
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "WorkflowExecution_startedAt_idx" ON "WorkflowExecution"("startedAt")`
    
    console.log('Adding foreign key constraint...')
    
    // Add foreign key constraint
    await prisma.$executeRaw`ALTER TABLE "WorkflowExecution" ADD CONSTRAINT IF NOT EXISTS "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowRule"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    
    console.log('✅ Workflow tables created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating workflow tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createWorkflowTables()

