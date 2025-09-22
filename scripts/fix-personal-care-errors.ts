import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPersonalCareErrors() {
  console.log('🔧 Fixing personal care categorization errors...')
  
  try {
    // Find the groups
    const personalCareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Personal Care & Beauty' }
    })
    
    const constructionGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Home & Construction Services' }
    })
    
    const professionalGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Professional Services' }
    })
    
    if (!personalCareGroup || !constructionGroup || !professionalGroup) {
      console.log('❌ Required groups not found!')
      return
    }
    
    // Businesses that were incorrectly moved to personal care
    const incorrectMoves = [
      {
        name: 'NINO\'S ARC & SPARK CONTRACTING LTD.',
        correctGroupId: constructionGroup.id,
        correctGroupName: 'Home & Construction Services'
      },
      {
        name: 'Creative Rehabilitation Services ltd. dba Creative Therapy Consultants',
        correctGroupId: professionalGroup.id,
        correctGroupName: 'Professional Services'
      }
    ]
    
    console.log(`\n🔄 Moving ${incorrectMoves.length} incorrectly categorized businesses back to their proper groups...`)
    
    for (const move of incorrectMoves) {
      // Find the business in personal care group
      const member = await prisma.audienceMember.findFirst({
        where: {
          groupId: personalCareGroup.id,
          businessName: move.name
        }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: move.correctGroupId }
        })
        
        console.log(`  ✅ Moved: ${move.name} from Personal Care & Beauty to ${move.correctGroupName}`)
      } else {
        console.log(`  ⚠️  Could not find: ${move.name} in personal care group`)
      }
    }
    
    // Final counts
    const finalCounts = await Promise.all([
      prisma.audienceMember.count({ where: { groupId: personalCareGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: constructionGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: professionalGroup.id } })
    ])
    
    console.log(`\n📊 Final counts after corrections:`)
    console.log(`- Personal Care & Beauty: ${finalCounts[0]} members`)
    console.log(`- Home & Construction Services: ${finalCounts[1]} members`)
    console.log(`- Professional Services: ${finalCounts[2]} members`)
    
    console.log(`\n✅ Personal care categorization errors fixed!`)
    
  } catch (error) {
    console.error('❌ Failed to fix personal care errors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixPersonalCareErrors()
  .then(() => {
    console.log('\n✅ Personal care error fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
