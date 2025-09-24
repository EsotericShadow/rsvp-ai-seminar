import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testWorkflowCreation() {
  try {
    console.log('Testing workflow creation...')
    
    // Try to create a simple workflow
    const workflow = await prisma.workflowRule.create({
      data: {
        name: 'Test Workflow',
        description: 'Test workflow for debugging',
        triggerType: 'manual',
        triggerConfig: {},
        conditions: [],
        actions: [],
        isEnabled: false,
        runCount: 0
      }
    })
    
    console.log('✅ Workflow created successfully:', workflow)
    
    // Clean up
    await prisma.workflowRule.delete({
      where: { id: workflow.id }
    })
    
    console.log('✅ Test workflow deleted')
    
  } catch (error) {
    console.error('❌ Error testing workflow creation:', error)
    
    // Check if tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('WorkflowRule', 'WorkflowExecution')
      `
      console.log('Existing tables:', tables)
    } catch (tableError) {
      console.error('Error checking tables:', tableError)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testWorkflowCreation()



