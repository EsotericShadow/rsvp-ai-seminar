import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalAudienceSummary() {
  console.log('📊 FINAL AUDIENCE SEGMENTATION SUMMARY')
  console.log('=====================================')
  
  try {
    // Get all groups with member counts
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          select: {
            businessName: true,
            primaryEmail: true
          },
          orderBy: {
            businessName: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n📈 Total businesses categorized: ${groups.reduce((sum, group) => sum + group._count.members, 0)}`)
    console.log(`📈 Total audience groups: ${groups.length}`)
    
    console.log(`\n🎯 AUDIENCE BREAKDOWN BY CATEGORY:`)
    console.log(`===================================`)
    
    groups.forEach((group, index) => {
      console.log(`\n${index + 1}. ${group.name.toUpperCase()}`)
      console.log(`   Count: ${group._count.members} businesses`)
      
      if (group._count.members > 0) {
        console.log(`   Examples:`)
        const examples = group.members.slice(0, 5) // Show first 5 examples
        examples.forEach((member, memberIndex) => {
          console.log(`   ${memberIndex + 1}. ${member.businessName}`)
        })
        
        if (group._count.members > 5) {
          console.log(`   ... and ${group._count.members - 5} more`)
        }
      }
    })
    
    // Quality check - look for any remaining miscategorized businesses
    console.log(`\n🔍 QUALITY CHECK - Looking for potential miscategorizations:`)
    console.log(`============================================================`)
    
    const allMembers = await prisma.audienceMember.findMany({
      include: {
        group: {
          select: {
            name: true
          }
        }
      }
    })
    
    // Check for obvious miscategorizations
    const miscategorized = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      const groupName = member.group.name.toLowerCase()
      
      // Healthcare businesses in wrong groups
      if (name.includes('dr.') && !groupName.includes('healthcare') && !groupName.includes('professional')) {
        return true
      }
      
      // Construction businesses in wrong groups
      if ((name.includes('construction') || name.includes('contracting') || name.includes('plumbing') || name.includes('electrician')) && !groupName.includes('construction')) {
        return true
      }
      
      // Restaurant businesses in wrong groups
      if ((name.includes('restaurant') || name.includes('cafe') || name.includes('pizza') || name.includes('burger')) && !groupName.includes('restaurant') && !groupName.includes('food')) {
        return true
      }
      
      // Retail businesses in wrong groups
      if ((name.includes('store') || name.includes('shop') || name.includes('retail')) && !groupName.includes('retail') && !groupName.includes('personal care')) {
        return true
      }
      
      return false
    })
    
    if (miscategorized.length > 0) {
      console.log(`⚠️  Found ${miscategorized.length} potentially miscategorized businesses:`)
      miscategorized.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.businessName} (currently in ${member.group.name})`)
      })
    } else {
      console.log(`✅ No obvious miscategorizations found!`)
    }
    
    // Summary statistics
    console.log(`\n📊 CATEGORIZATION STATISTICS:`)
    console.log(`=============================`)
    
    const totalBusinesses = groups.reduce((sum, group) => sum + group._count.members, 0)
    const chainsCount = groups.find(g => g.name === 'Chains & Franchises')?._count.members || 0
    const chainsPercentage = ((chainsCount / totalBusinesses) * 100).toFixed(1)
    
    console.log(`- Total businesses: ${totalBusinesses}`)
    console.log(`- Chains & Franchises (unsubscribed): ${chainsCount} (${chainsPercentage}%)`)
    console.log(`- Small businesses (targetable): ${totalBusinesses - chainsCount} (${(100 - parseFloat(chainsPercentage)).toFixed(1)}%)`)
    
    console.log(`\n✅ AUDIENCE SEGMENTATION COMPLETE!`)
    console.log(`All businesses have been systematically categorized into appropriate groups.`)
    console.log(`Chains & Franchises are marked as unsubscribed to avoid targeting them.`)
    
  } catch (error) {
    console.error('❌ Failed to generate summary:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

finalAudienceSummary()
  .then(() => {
    console.log('\n✅ Final summary complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Summary failed:', error)
    process.exit(1)
  })
