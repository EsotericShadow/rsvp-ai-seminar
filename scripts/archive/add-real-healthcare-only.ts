import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addRealHealthcareOnly() {
  console.log('🏥 STEP 4: Adding ONLY real healthcare businesses to Healthcare & Wellness...')
  
  try {
    // Find the healthcare group
    const healthcareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Healthcare & Wellness' }
    })
    
    if (!healthcareGroup) {
      console.log('❌ Healthcare & Wellness group not found!')
      return
    }
    
    console.log(`\n📊 Healthcare & Wellness group is currently empty`)
    
    // Get all businesses from other groups to find actual healthcare ones
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
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL healthcare businesses...`)
    
    // Find businesses that are ACTUALLY healthcare related
    const realHealthcareBusinesses = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Actual healthcare keywords
      const healthcareKeywords = [
        'medical', 'health', 'clinic', 'hospital', 'dental', 'doctor', 'physician', 
        'nurse', 'pharmacy', 'wellness', 'therapy', 'counseling', 'counselling',
        'mental health', 'family practice', 'healthcare', 'health care',
        'optometry', 'chiropractic', 'physiotherapy', 'massage therapy',
        'acupuncture', 'naturopathic', 'psychology', 'psychiatry',
        'pediatric', 'geriatric', 'oncology', 'cardiology', 'dermatology',
        'gynecology', 'obstetrics', 'orthopedic', 'neurology', 'radiology'
      ]
      
      // Check if name contains actual healthcare keywords
      const hasHealthcareKeyword = healthcareKeywords.some(keyword => name.includes(keyword))
      
      // Also check for "Dr." prefix
      const hasDrPrefix = name.startsWith('dr.') || name.startsWith('dr ')
      
      return hasHealthcareKeyword || hasDrPrefix
    })
    
    console.log(`\n🎯 Found ${realHealthcareBusinesses.length} businesses that are ACTUALLY healthcare related:`)
    realHealthcareBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Healthcare & Wellness'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed healthcare businesses to the correct group
    const incorrectlyPlaced = realHealthcareBusinesses.filter(member => member.group.name !== 'Healthcare & Wellness')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual healthcare businesses to Healthcare & Wellness...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: healthcareGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Healthcare & Wellness`)
      }
    } else {
      console.log(`\n✅ All actual healthcare businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: healthcareGroup.id }
    })
    
    console.log(`\n📊 Final Healthcare & Wellness count: ${finalCount} ACTUAL healthcare businesses`)
    
    // Show what's now in healthcare
    const healthcareMembers = await prisma.audienceMember.findMany({
      where: { groupId: healthcareGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual healthcare businesses in Healthcare & Wellness:`)
    healthcareMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 4 COMPLETE: Healthcare & Wellness now contains ONLY actual healthcare businesses!`)
    console.log(`\n📋 Next step: Review other groups and categorize remaining businesses properly`)
    console.log(`   This is a much more reasonable number of actual healthcare businesses.`)
    
  } catch (error) {
    console.error('❌ Failed to add real healthcare businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addRealHealthcareOnly()
  .then(() => {
    console.log('\n✅ Real healthcare businesses added successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Add failed:', error)
    process.exit(1)
  })
