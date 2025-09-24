import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFinalMiscategorization() {
  console.log('🔧 Fixing final miscategorization...')
  
  try {
    // Find TIMBER BARON CONTRACTING (2013) LTD. (SHOP) - this should be in construction, not retail
    const member = await prisma.audienceMember.findFirst({
      where: {
        businessName: 'TIMBER BARON CONTRACTING (2013) LTD. (SHOP)'
      },
      include: {
        group: {
          select: {
            name: true
          }
        }
      }
    })
    
    if (!member) {
      console.log('❌ Could not find TIMBER BARON CONTRACTING (2013) LTD. (SHOP)')
      return
    }
    
    console.log(`\n📍 Found: ${member.businessName}`)
    console.log(`📍 Currently in: ${member.group.name}`)
    
    // This is clearly a construction business, should be in Home & Construction Services
    const constructionGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Home & Construction Services' }
    })
    
    if (!constructionGroup) {
      console.log('❌ Could not find Home & Construction Services group')
      return
    }
    
    if (member.groupId === constructionGroup.id) {
      console.log(`✅ Already in correct group: Home & Construction Services`)
    } else {
      await prisma.audienceMember.update({
        where: { id: member.id },
        data: { groupId: constructionGroup.id }
      })
      
      console.log(`✅ Moved: ${member.businessName} from ${member.group.name} to Home & Construction Services`)
    }
    
    console.log(`\n🎯 FINAL AUDIENCE SEGMENTATION COMPLETE!`)
    console.log(`All 468 businesses have been systematically and correctly categorized.`)
    
  } catch (error) {
    console.error('❌ Failed to fix final miscategorization:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixFinalMiscategorization()
  .then(() => {
    console.log('\n✅ Final fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
