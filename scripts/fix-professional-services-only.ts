import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProfessionalServicesOnly() {
  console.log('⚖️ STEP 5: Fixing ONLY the Professional Services category...')
  
  try {
    // Find the professional services group
    const profGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Professional Services' },
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
    
    if (!profGroup) {
      console.log('❌ Professional Services group not found!')
      return
    }
    
    console.log(`\n📊 Current Professional Services group has ${profGroup.members.length} members`)
    
    // Get all businesses from other groups to find actual professional services
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
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL professional services...`)
    
    // Find businesses that are ACTUALLY professional services
    const realProfessionalServices = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Professional services keywords
      const professionalKeywords = [
        'law firm', 'attorney', 'legal', 'lawyer', 'barrister', 'solicitor',
        'accounting', 'accountant', 'cpa', 'bookkeeping', 'tax services',
        'consulting', 'consultant', 'advisory', 'advisors', 'consultancy',
        'marketing agency', 'advertising agency', 'public relations', 'pr agency',
        'real estate', 'realtor', 'realty', 'property management',
        'insurance agency', 'insurance broker', 'financial advisor', 'financial planner',
        'engineering', 'architect', 'surveying', 'land surveyor',
        'notary public', 'notary', 'paralegal', 'legal services',
        'business consulting', 'management consulting', 'hr consulting',
        'it consulting', 'technology consulting', 'web design', 'graphic design',
        'interior design', 'landscape design', 'architectural services'
      ]
      
      // Check if name contains professional services keywords
      const hasProfessionalKeyword = professionalKeywords.some(keyword => name.includes(keyword))
      
      // Also check for professional suffixes
      const hasProfessionalSuffix = name.includes('law corporation') || 
                                   name.includes('law corp') ||
                                   name.includes('accounting firm') ||
                                   name.includes('consulting firm') ||
                                   name.includes('agency') ||
                                   name.includes('advisors') ||
                                   name.includes('consultants')
      
      return hasProfessionalKeyword || hasProfessionalSuffix
    })
    
    console.log(`\n🎯 Found ${realProfessionalServices.length} businesses that are ACTUALLY professional services:`)
    realProfessionalServices.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Professional Services'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed professional services to the correct group
    const incorrectlyPlaced = realProfessionalServices.filter(member => member.group.name !== 'Professional Services')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual professional services to Professional Services...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: profGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Professional Services`)
      }
    } else {
      console.log(`\n✅ All actual professional services are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: profGroup.id }
    })
    
    console.log(`\n📊 Final Professional Services count: ${finalCount} ACTUAL professional services`)
    
    // Show what's now in professional services
    const profMembers = await prisma.audienceMember.findMany({
      where: { groupId: profGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual professional services in Professional Services:`)
    profMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 5 COMPLETE: Professional Services now contains ONLY actual professional services!`)
    
  } catch (error) {
    console.error('❌ Failed to fix professional services:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixProfessionalServicesOnly()
  .then(() => {
    console.log('\n✅ Professional services fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
