import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateTemplateNoDuplicates() {
  console.log('📧 Updating template to remove duplicate event information...')

  try {
    // Find the official template
    const template = await prisma.campaignTemplate.findFirst({
      where: { meta: { path: ['official'], equals: true } }
    })

    if (!template) {
      throw new Error('Official template not found')
    }

    // Update the template to remove duplicate event information and use generic greeting
    await prisma.campaignTemplate.update({
      where: { id: template.id },
      data: {
        greeting_title: 'Hello!',
        additional_info_title: 'Why This Matters',
        additional_info_body: 'These AI tools can save your business hours of manual work each week, giving you more time to focus on growing your business and serving your customers better.',
        meta: {
          ...template.meta as any,
          updatedBy: 'remove-duplicates',
          noEventDuplicates: true,
          genericGreeting: true
        }
      }
    })

    console.log('✅ Template updated to remove duplicate event information')
    console.log('📋 Template now shows:')
    console.log('- Main content: "What You\'ll Learn" (about AI tools)')
    console.log('- Additional info: "Why This Matters" (benefits)')
    console.log('- Event details handled by global template only')
    console.log('- No more duplicate event information')

  } catch (error) {
    console.error('❌ Failed to update template:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateTemplateNoDuplicates()
  .then(() => {
    console.log('\n✅ Template updated successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Update failed:', error)
    process.exit(1)
  })
