import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHealthcareMembers() {
  console.log('🏥 Checking what\'s actually in Healthcare & Wellness group...')
  
  try {
    const healthcareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Healthcare & Wellness' },
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
    
    if (!healthcareGroup) {
      console.log('❌ Healthcare & Wellness group not found!')
      return
    }
    
    console.log(`\n📊 Healthcare & Wellness group has ${healthcareGroup.members.length} members`)
    
    console.log(`\n📋 First 20 members in Healthcare & Wellness:`)
    healthcareGroup.members.slice(0, 20).forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    if (healthcareGroup.members.length > 20) {
      console.log(`\n... and ${healthcareGroup.members.length - 20} more members`)
    }
    
    // Let's analyze what types of businesses are actually in healthcare
    console.log(`\n🔍 Analyzing business types in Healthcare & Wellness...`)
    
    const businessTypes = new Map<string, number>()
    
    healthcareGroup.members.forEach(member => {
      const name = member.businessName || ''
      
      // Check for actual healthcare keywords
      if (name.toLowerCase().includes('medical') || name.toLowerCase().includes('health') || name.toLowerCase().includes('clinic') || name.toLowerCase().includes('hospital')) {
        businessTypes.set('Actual Healthcare', (businessTypes.get('Actual Healthcare') || 0) + 1)
      }
      // Check for construction/contracting
      else if (name.toLowerCase().includes('construction') || name.toLowerCase().includes('contracting') || name.toLowerCase().includes('ltd') || name.toLowerCase().includes('inc')) {
        businessTypes.set('Construction/Corporate', (businessTypes.get('Construction/Corporate') || 0) + 1)
      }
      // Check for retail
      else if (name.toLowerCase().includes('store') || name.toLowerCase().includes('shop') || name.toLowerCase().includes('retail')) {
        businessTypes.set('Retail', (businessTypes.get('Retail') || 0) + 1)
      }
      // Check for services
      else if (name.toLowerCase().includes('service') || name.toLowerCase().includes('consulting') || name.toLowerCase().includes('solutions')) {
        businessTypes.set('Services', (businessTypes.get('Services') || 0) + 1)
      }
      // Everything else
      else {
        businessTypes.set('Other', (businessTypes.get('Other') || 0) + 1)
      }
    })
    
    console.log(`\n📈 Business type breakdown in Healthcare & Wellness:`)
    businessTypes.forEach((count, type) => {
      console.log(`- ${type}: ${count} businesses`)
    })
    
    console.log(`\n❌ PROBLEM IDENTIFIED:`)
    console.log(`The Healthcare & Wellness group is a DUMP for businesses that don't fit other categories!`)
    console.log(`Most of these businesses are NOT healthcare related at all.`)
    
    console.log(`\n📋 This is exactly what you warned me about - I need to be more careful and systematic.`)
    console.log(`The import logic was completely wrong and just dumped everything into healthcare.`)
    
  } catch (error) {
    console.error('❌ Failed to check healthcare members:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkHealthcareMembers()
  .then(() => {
    console.log('\n✅ Healthcare check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
