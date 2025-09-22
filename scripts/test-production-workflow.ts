import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProductionWorkflow() {
  try {
    console.log('Testing workflow creation in production...')
    
    // Try to create a simple workflow
    const workflow = await prisma.workflowRule.create({
      data: {
        name: 'Test Production Workflow',
        description: 'Test workflow for production debugging',
        triggerType: 'manual',
        triggerConfig: {},
        conditions: [],
        actions: [],
        isEnabled: false,
        runCount: 0
      }
    })
    
    console.log('✅ Production workflow created successfully:', workflow)
    
    // Clean up
    await prisma.workflowRule.delete({
      where: { id: workflow.id }
    })
    
    console.log('✅ Test workflow deleted')
    
  } catch (error) {
    console.error('❌ Error creating production workflow:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductionWorkflow()
