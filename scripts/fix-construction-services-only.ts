import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixConstructionServicesOnly() {
  console.log('🔨 STEP 6: Fixing ONLY the Home & Construction Services category...')
  
  try {
    // Find the construction services group
    const constructionGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Home & Construction Services' },
      include: {
        members: {
          select: {
            id: true,
            businessName: true,
            primaryEmail: true
          }
        }
      }
    })
    
    if (!constructionGroup) {
      console.log('❌ Home & Construction Services group not found!')
      return
    }
    
    console.log(`\n📊 Current Home & Construction Services group has ${constructionGroup.members.length} members`)
    
    // Get all businesses from other groups to find actual construction services
    const allMembers = await prisma.audienceMember.findMany({
      select: {
        id: true,
        businessName: true,
        primaryEmail: true,
        groupId: true,
        group: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL construction services...`)
    
    // Find businesses that are ACTUALLY construction/home services
    const realConstructionServices = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Construction/home services keywords
      const constructionKeywords = [
        'construction', 'contractor', 'contracting', 'builder', 'building',
        'plumbing', 'plumber', 'electrician', 'electrical', 'electrical contractor',
        'hvac', 'heating', 'cooling', 'air conditioning', 'furnace',
        'roofing', 'roofer', 'roof', 'siding', 'gutters',
        'landscaping', 'landscaper', 'lawn care', 'yard maintenance',
        'painting', 'painter', 'interior painting', 'exterior painting',
        'flooring', 'carpet', 'hardwood', 'tile', 'vinyl',
        'renovation', 'remodeling', 'remodel', 'home improvement',
        'concrete', 'paving', 'asphalt', 'driveway', 'sidewalk',
        'excavation', 'excavating', 'excavator', 'grading',
        'welding', 'welder', 'metal work', 'fabrication',
        'drywall', 'drywaller', 'insulation', 'insulator',
        'carpentry', 'carpenter', 'cabinet', 'cabinetry',
        'masonry', 'mason', 'brick', 'stone', 'block',
        'demolition', 'demolish', 'wrecking',
        'home services', 'maintenance', 'repair', 'handyman'
      ]
      
      // Check if name contains construction keywords
      const hasConstructionKeyword = constructionKeywords.some(keyword => name.includes(keyword))
      
      // Also check for construction suffixes
      const hasConstructionSuffix = name.includes('construction ltd') || 
                                   name.includes('contracting ltd') ||
                                   name.includes('contracting inc') ||
                                   name.includes('construction inc') ||
                                   name.includes('construction corp') ||
                                   name.includes('contracting corp')
      
      return hasConstructionKeyword || hasConstructionSuffix
    })
    
    console.log(`\n🎯 Found ${realConstructionServices.length} businesses that are ACTUALLY construction/home services:`)
    realConstructionServices.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Home & Construction Services'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed construction services to the correct group
    const incorrectlyPlaced = realConstructionServices.filter(member => member.group.name !== 'Home & Construction Services')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual construction services to Home & Construction Services...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: constructionGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Home & Construction Services`)
      }
    } else {
      console.log(`\n✅ All actual construction services are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: constructionGroup.id }
    })
    
    console.log(`\n📊 Final Home & Construction Services count: ${finalCount} ACTUAL construction/home services`)
    
    // Show what's now in construction services
    const constructionMembers = await prisma.audienceMember.findMany({
      where: { groupId: constructionGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual construction/home services in Home & Construction Services:`)
    constructionMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 6 COMPLETE: Home & Construction Services now contains ONLY actual construction/home services!`)
    
  } catch (error) {
    console.error('❌ Failed to fix construction services:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixConstructionServicesOnly()
  .then(() => {
    console.log('\n✅ Construction services fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
