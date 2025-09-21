import 'dotenv/config'
import prisma from '@/lib/prisma'

async function migrateToVariantTemplates() {
  console.log('Migrating campaign schedules from non-variant to variant templates...')
  
  // Get all campaign schedules that use non-variant email templates
  const allSchedules = await prisma.campaignSchedule.findMany({
    include: {
      template: true
    }
  })
  
  // Filter for schedules using non-variant email templates
  const schedulesWithNonVariants = allSchedules.filter(schedule => 
    schedule.template.name.includes('Email') && 
    !schedule.template.name.includes('Variant')
  )
  
  console.log(`Found ${schedulesWithNonVariants.length} campaign schedules using non-variant templates`)
  
  let migrated = 0
  let skipped = 0
  
  for (const schedule of schedulesWithNonVariants) {
    const templateName = schedule.template.name
    console.log(`\nProcessing: ${templateName}`)
    
    // Find the corresponding Variant A template
    const baseName = templateName.replace(/ - Email \d+ - .*$/, '')
    const emailMatch = templateName.match(/Email (\d+)/)
    const emailNumber = emailMatch ? emailMatch[1] : null
    
    if (!emailNumber) {
      console.log(`  Skipped: Could not extract email number`)
      skipped++
      continue
    }
    
    // Look for Variant A template
    const variantATemplate = await prisma.campaignTemplate.findFirst({
      where: {
        name: {
          startsWith: `${baseName} - Email ${emailNumber}`,
          contains: 'Variant A'
        }
      }
    })
    
    if (variantATemplate) {
      // Update the campaign schedule to use Variant A
      await prisma.campaignSchedule.update({
        where: { id: schedule.id },
        data: {
          templateId: variantATemplate.id
        }
      })
      
      console.log(`  Migrated to: ${variantATemplate.name}`)
      migrated++
    } else {
      console.log(`  Skipped: No Variant A found for ${baseName} - Email ${emailNumber}`)
      skipped++
    }
  }
  
  console.log(`\n✅ Migration complete!`)
  console.log(`Migrated ${migrated} campaign schedules to Variant A templates`)
  console.log(`Skipped ${skipped} schedules (no variants found)`)
  
  // Now check if we can safely delete the non-variant templates
  const remainingNonVariantTemplates = await prisma.campaignTemplate.findMany({
    where: {
      AND: [
        {
          name: {
            not: {
              contains: 'Variant'
            }
          }
        },
        {
          name: {
            contains: 'Email'
          }
        }
      ]
    },
    include: {
      _count: {
        select: {
          schedules: true
        }
      }
    }
  })
  
  console.log(`\nRemaining non-variant templates: ${remainingNonVariantTemplates.length}`)
  
  let canDelete = 0
  let stillInUse = 0
  
  for (const template of remainingNonVariantTemplates) {
    if (template._count.schedules === 0) {
      canDelete++
      console.log(`  Can delete: ${template.name} (not in use)`)
    } else {
      stillInUse++
      console.log(`  Still in use: ${template.name} (${template._count.schedules} schedules)`)
    }
  }
  
  if (canDelete > 0) {
    console.log(`\nDeleting ${canDelete} unused non-variant templates...`)
    
    for (const template of remainingNonVariantTemplates) {
      if (template._count.schedules === 0) {
        await prisma.campaignTemplate.delete({
          where: { id: template.id }
        })
        console.log(`  Deleted: ${template.name}`)
      }
    }
  }
  
  console.log(`\nFinal result:`)
  console.log(`- Migrated ${migrated} schedules to variants`)
  console.log(`- Deleted ${canDelete} unused non-variant templates`)
  console.log(`- ${stillInUse} non-variant templates still in use`)
}

migrateToVariantTemplates().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
