import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixChainsFranchisesOnly() {
  console.log('🏢 STEP 3: Fixing ONLY the chains & franchises category...')
  
  try {
    // First, let's see what we have in the chains & franchises group
    const chainsGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Chains & Franchises' },
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
    
    if (!chainsGroup) {
      console.log('❌ Chains & Franchises group not found!')
      return
    }
    
    console.log(`\n📊 Current Chains & Franchises group:`)
    console.log(`- Group ID: ${chainsGroup.id}`)
    console.log(`- Current members: ${chainsGroup.members.length}`)
    
    console.log(`\n📋 Current members in Chains & Franchises:`)
    chainsGroup.members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    // Now let's find ALL businesses that should actually be in the chains & franchises category
    console.log(`\n🔍 Searching for ALL businesses that should be in Chains & Franchises...`)
    
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
    
    console.log(`📊 Total businesses in database: ${allMembers.length}`)
    
    // Find businesses that match chain/franchise patterns
    const chainKeywords = [
      'mcdonald', 'starbucks', 'subway', 'pizza hut', 'dominos', 'kfc', 'burger king', 'wendys', 
      'tim hortons', 'dunkin', 'walgreens', 'cvs', 'walmart', 'target', 'home depot', 'lowes',
      'dollarama', 'mobil', 'esso', 'shell', 'chevron', 'petro', 'canadian tire', 'costco',
      'save-on-foods', 'superstore', 'safeway', 'sobeys', 'rexall', 'shoppers drug mart',
      'hudson bay', 'sears', 'best buy', 'future shop', 'staples', 'office depot',
      '7-eleven', 'circle k', 'macs', 'petro-canada', 'esso', 'irving', 'pioneer'
    ]
    
    const franchiseKeywords = [
      'franchise', 'franchising', 'corporate', 'headquarters', 'national', 'chain',
      'ltd.', 'inc.', 'corporation', 'enterprise', 'international'
    ]
    
    const chainBusinesses = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Check for known chain keywords
      const hasChainKeyword = chainKeywords.some(keyword => name.includes(keyword))
      
      // Check for franchise keywords
      const hasFranchiseKeyword = franchiseKeywords.some(keyword => name.includes(keyword))
      
      // Check for specific patterns that indicate chains
      const hasChainPattern = name.includes('#') || // Like "MOBIL #2928"
                             name.includes('store #') ||
                             name.includes('location #') ||
                             name.includes('branch #')
      
      return hasChainKeyword || hasFranchiseKeyword || hasChainPattern
    })
    
    console.log(`\n🎯 Found ${chainBusinesses.length} businesses that should be in Chains & Franchises:`)
    chainBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Chains & Franchises'
      const status = isInCorrectGroup ? '✅ CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed chain businesses to the correct group
    const incorrectlyPlaced = chainBusinesses.filter(member => member.group.name !== 'Chains & Franchises')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} incorrectly placed chain businesses...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { 
            groupId: chainsGroup.id,
            unsubscribed: true // Mark chains as unsubscribed to avoid targeting them
          }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Chains & Franchises`)
      }
    } else {
      console.log(`\n✅ All chain businesses are already in the correct group!`)
    }
    
    // Also make sure all chain businesses are marked as unsubscribed
    await prisma.audienceMember.updateMany({
      where: { 
        groupId: chainsGroup.id,
        unsubscribed: false
      },
      data: { 
        unsubscribed: true 
      }
    })
    
    console.log(`\n✅ Marked all chain businesses as unsubscribed to avoid targeting them`)
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: chainsGroup.id }
    })
    
    const activeCount = await prisma.audienceMember.count({
      where: { 
        groupId: chainsGroup.id,
        unsubscribed: false
      }
    })
    
    console.log(`\n📊 Final Chains & Franchises count: ${finalCount} total, ${activeCount} active`)
    
    console.log(`\n✅ STEP 3 COMPLETE: Chains & Franchises category is now correct!`)
    console.log(`\n📋 Next step: Fix Healthcare & Wellness category`)
    console.log(`   Run: npx tsx scripts/fix-healthcare-wellness-only.ts`)
    
  } catch (error) {
    console.error('❌ Failed to fix chains & franchises:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixChainsFranchisesOnly()
  .then(() => {
    console.log('\n✅ Chains & franchises fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
