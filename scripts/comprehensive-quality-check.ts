import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function comprehensiveQualityCheck() {
  console.log('🔍 COMPREHENSIVE QUALITY CHECK')
  console.log('==============================')
  
  try {
    // Get all members with their groups
    const allMembers = await prisma.audienceMember.findMany({
      include: {
        group: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        businessName: 'asc'
      }
    })
    
    console.log(`\n📊 Total businesses to check: ${allMembers.length}`)
    
    // Check for specific miscategorization patterns
    const issues = []
    
    allMembers.forEach(member => {
      const name = (member.businessName || '').toLowerCase()
      const groupName = member.group.name.toLowerCase()
      
      // 1. Healthcare businesses in wrong groups
      if (name.includes('dr.') && !groupName.includes('healthcare') && !groupName.includes('professional')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Doctor/medical business in non-healthcare group',
          suggestedGroup: 'Healthcare & Wellness or Professional Services'
        })
      }
      
      // 2. Construction businesses in wrong groups
      if ((name.includes('construction') || name.includes('contracting') || name.includes('plumbing') || name.includes('electrician') || name.includes('roofing') || name.includes('welding')) && !groupName.includes('construction') && !groupName.includes('home')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Construction/home service in wrong group',
          suggestedGroup: 'Home & Construction Services'
        })
      }
      
      // 3. Restaurant businesses in wrong groups
      if ((name.includes('restaurant') || name.includes('cafe') || name.includes('pizza') || name.includes('burger') || name.includes('catering') || name.includes('bar') || name.includes('pub')) && !groupName.includes('restaurant') && !groupName.includes('food')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Food service business in wrong group',
          suggestedGroup: 'Restaurants & Food Service'
        })
      }
      
      // 4. Retail businesses in wrong groups
      if ((name.includes('store') || name.includes('shop') || name.includes('retail') || name.includes('boutique') || name.includes('mart') || name.includes('pharmacy')) && !groupName.includes('retail') && !groupName.includes('personal care') && !groupName.includes('healthcare')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Retail business in wrong group',
          suggestedGroup: 'Retail & E-commerce or appropriate category'
        })
      }
      
      // 5. Professional services in wrong groups
      if ((name.includes('law') || name.includes('legal') || name.includes('accounting') || name.includes('consulting') || name.includes('engineering') || name.includes('surveying')) && !groupName.includes('professional') && !groupName.includes('construction')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Professional service in wrong group',
          suggestedGroup: 'Professional Services'
        })
      }
      
      // 6. Personal care in wrong groups
      if ((name.includes('salon') || name.includes('spa') || name.includes('barber') || name.includes('beauty') || name.includes('nail') || name.includes('massage')) && !groupName.includes('personal care') && !groupName.includes('beauty')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Personal care/beauty business in wrong group',
          suggestedGroup: 'Personal Care & Beauty'
        })
      }
      
      // 7. Chains/franchises in wrong groups
      if ((name.includes('mcdonald') || name.includes('starbucks') || name.includes('subway') || name.includes('walmart') || name.includes('tim hortons') || name.includes('pizza hut') || name.includes('a&w')) && !groupName.includes('chains') && !groupName.includes('franchises')) {
        issues.push({
          business: member.businessName,
          currentGroup: member.group.name,
          issue: 'Chain/franchise in wrong group',
          suggestedGroup: 'Chains & Franchises'
        })
      }
    })
    
    console.log(`\n🎯 QUALITY CHECK RESULTS:`)
    console.log(`=========================`)
    
    if (issues.length === 0) {
      console.log(`✅ PERFECT! No miscategorizations found.`)
      console.log(`All ${allMembers.length} businesses are correctly categorized.`)
    } else {
      console.log(`⚠️  Found ${issues.length} potential miscategorizations:`)
      console.log(`\n`)
      
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.business}`)
        console.log(`   Current: ${issue.currentGroup}`)
        console.log(`   Issue: ${issue.issue}`)
        console.log(`   Suggested: ${issue.suggestedGroup}`)
        console.log(`\n`)
      })
    }
    
    // Additional checks
    console.log(`\n📊 ADDITIONAL CHECKS:`)
    console.log(`=====================`)
    
    // Check for empty groups
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    const emptyGroups = groups.filter(g => g._count.members === 0)
    if (emptyGroups.length > 0) {
      console.log(`⚠️  Empty groups: ${emptyGroups.map(g => g.name).join(', ')}`)
    } else {
      console.log(`✅ No empty groups`)
    }
    
    // Check for groups with too many members (potential dumps)
    const largeGroups = groups.filter(g => g._count.members > 100)
    if (largeGroups.length > 0) {
      console.log(`⚠️  Large groups (>100 members): ${largeGroups.map(g => `${g.name} (${g._count.members})`).join(', ')}`)
    } else {
      console.log(`✅ No suspiciously large groups`)
    }
    
    // Check for groups with too few members (might be too specific)
    const smallGroups = groups.filter(g => g._count.members < 5 && g.name !== 'Numbered Businesses')
    if (smallGroups.length > 0) {
      console.log(`⚠️  Small groups (<5 members): ${smallGroups.map(g => `${g.name} (${g._count.members})`).join(', ')}`)
    } else {
      console.log(`✅ All groups have reasonable sizes`)
    }
    
    console.log(`\n🎯 FINAL VERDICT:`)
    console.log(`=================`)
    
    if (issues.length === 0 && emptyGroups.length === 0 && largeGroups.length === 0) {
      console.log(`✅ EXCELLENT! All businesses are correctly categorized.`)
      console.log(`✅ No empty groups.`)
      console.log(`✅ No suspiciously large groups.`)
      console.log(`✅ Ready for production use.`)
    } else {
      console.log(`⚠️  Some issues found that should be addressed.`)
    }
    
  } catch (error) {
    console.error('❌ Failed to run quality check:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

comprehensiveQualityCheck()
  .then(() => {
    console.log('\n✅ Quality check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Quality check failed:', error)
    process.exit(1)
  })
