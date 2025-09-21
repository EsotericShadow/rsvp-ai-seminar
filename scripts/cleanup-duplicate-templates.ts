import 'dotenv/config'
import prisma from '@/lib/prisma'

async function cleanupDuplicateTemplates() {
  console.log('Cleaning up duplicate templates without variants...')
  
  // Get all templates that don't have "Variant" in their name
  const templatesWithoutVariants = await prisma.campaignTemplate.findMany({
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
    }
  })
  
  console.log(`Found ${templatesWithoutVariants.length} templates without variants`)
  
  // Group templates by their base name (without variant info)
  const templateGroups = new Map<string, any[]>()
  
  for (const template of templatesWithoutVariants) {
    // Extract the base name by removing any variant info
    const baseName = template.name
      .replace(/ - Variant [ABC]$/, '')
      .replace(/ - Variant [ABC] - .*$/, '')
    
    if (!templateGroups.has(baseName)) {
      templateGroups.set(baseName, [])
    }
    templateGroups.get(baseName)!.push(template)
  }
  
  let deleted = 0
  
  // Check each group and delete non-variant templates if variants exist
  for (const [baseName, templates] of templateGroups) {
    // Check if variants exist for this base template
    const variantTemplates = await prisma.campaignTemplate.findMany({
      where: {
        name: {
          startsWith: baseName,
          contains: 'Variant'
        }
      }
    })
    
    if (variantTemplates.length > 0) {
      console.log(`\nBase template: ${baseName}`)
      console.log(`  Found ${variantTemplates.length} variants, deleting ${templates.length} non-variant templates`)
      
      // Delete the non-variant templates
      for (const template of templates) {
        await prisma.campaignTemplate.delete({
          where: { id: template.id }
        })
        console.log(`  Deleted: ${template.name}`)
        deleted++
      }
    } else {
      console.log(`\nBase template: ${baseName} - No variants found, keeping non-variant template`)
    }
  }
  
  console.log(`\n✅ Cleanup complete!`)
  console.log(`Deleted ${deleted} duplicate templates without variants`)
  console.log(`Kept templates that don't have variants yet`)
  
  // Show remaining template count by industry
  const remainingTemplates = await prisma.campaignTemplate.findMany({
    where: {
      name: {
        contains: 'Email'
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\nRemaining templates: ${remainingTemplates.length}`)
  
  // Group by industry
  const industryCounts = new Map<string, number>()
  for (const template of remainingTemplates) {
    const industry = template.name.split(' - ')[0]
    industryCounts.set(industry, (industryCounts.get(industry) || 0) + 1)
  }
  
  console.log('\nTemplates per industry:')
  for (const [industry, count] of industryCounts) {
    console.log(`  ${industry}: ${count} templates`)
  }
}

cleanupDuplicateTemplates().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
