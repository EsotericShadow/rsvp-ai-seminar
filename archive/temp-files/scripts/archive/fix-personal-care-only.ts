import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPersonalCareOnly() {
  console.log('💅 STEP 8: Fixing ONLY the Personal Care & Beauty category...')
  
  try {
    // Find the personal care group
    const personalCareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Personal Care & Beauty' },
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
    
    if (!personalCareGroup) {
      console.log('❌ Personal Care & Beauty group not found!')
      return
    }
    
    console.log(`\n📊 Current Personal Care & Beauty group has ${personalCareGroup.members.length} members`)
    
    // Get all businesses from other groups to find actual personal care businesses
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
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL personal care & beauty businesses...`)
    
    // Find businesses that are ACTUALLY personal care & beauty
    const realPersonalCareBusinesses = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Personal care & beauty keywords
      const personalCareKeywords = [
        'salon', 'hair salon', 'beauty salon', 'nail salon', 'nail bar',
        'spa', 'day spa', 'massage', 'massage therapy', 'therapeutic massage',
        'barber', 'barbershop', 'haircut', 'stylist', 'hairstylist',
        'beauty', 'aesthetics', 'esthetician', 'cosmetics', 'makeup',
        'skin care', 'skincare', 'facial', 'facialist',
        'manicure', 'pedicure', 'nail art', 'nail technician',
        'wellness', 'wellness center', 'wellness centre',
        'therapy', 'physical therapy', 'physiotherapy', 'rehabilitation',
        'chiropractic', 'chiropractor', 'acupuncture', 'acupuncturist',
        'reflexology', 'aromatherapy', 'aromatherapist',
        'tanning', 'tanning salon', 'tanning bed',
        'laser', 'laser hair removal', 'laser treatment',
        'tattoo', 'tattoo shop', 'tattoo parlor', 'tattoo studio',
        'piercing', 'body piercing', 'ear piercing',
        'barber shop', 'hair studio', 'beauty studio', 'beauty bar'
      ]
      
      // Check if name contains personal care keywords
      const hasPersonalCareKeyword = personalCareKeywords.some(keyword => name.includes(keyword))
      
      // Also check for personal care suffixes
      const hasPersonalCareSuffix = name.includes('salon ltd') || 
                                   name.includes('salon inc') ||
                                   name.includes('spa ltd') ||
                                   name.includes('spa inc') ||
                                   name.includes('barbershop ltd') ||
                                   name.includes('barbershop inc')
      
      return hasPersonalCareKeyword || hasPersonalCareSuffix
    })
    
    console.log(`\n🎯 Found ${realPersonalCareBusinesses.length} businesses that are ACTUALLY personal care & beauty:`)
    realPersonalCareBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Personal Care & Beauty'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed personal care businesses to the correct group
    const incorrectlyPlaced = realPersonalCareBusinesses.filter(member => member.group.name !== 'Personal Care & Beauty')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual personal care businesses to Personal Care & Beauty...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: personalCareGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Personal Care & Beauty`)
      }
    } else {
      console.log(`\n✅ All actual personal care businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: personalCareGroup.id }
    })
    
    console.log(`\n📊 Final Personal Care & Beauty count: ${finalCount} ACTUAL personal care & beauty businesses`)
    
    // Show what's now in personal care
    const personalCareMembers = await prisma.audienceMember.findMany({
      where: { groupId: personalCareGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual personal care & beauty businesses in Personal Care & Beauty:`)
    personalCareMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 8 COMPLETE: Personal Care & Beauty now contains ONLY actual personal care & beauty businesses!`)
    
  } catch (error) {
    console.error('❌ Failed to fix personal care:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixPersonalCareOnly()
  .then(() => {
    console.log('\n✅ Personal care fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
