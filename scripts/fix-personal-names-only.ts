import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPersonalNamesOnly() {
  console.log('👤 STEP 2: Fixing ONLY the personal names category...')
  
  try {
    // First, let's see what we have in the personal names group
    const personalGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Personal Names' },
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
    
    if (!personalGroup) {
      console.log('❌ Personal Names group not found!')
      return
    }
    
    console.log(`\n📊 Current Personal Names group:`)
    console.log(`- Group ID: ${personalGroup.id}`)
    console.log(`- Current members: ${personalGroup.members.length}`)
    
    console.log(`\n📋 Current members in Personal Names:`)
    personalGroup.members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    // Now let's find ALL businesses that should actually be in the personal names category
    console.log(`\n🔍 Searching for ALL businesses that should be in Personal Names...`)
    
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
    
    // Find businesses that match personal name patterns
    const personalNameBusinesses = allMembers.filter(member => {
      const name = member.businessName || ''
      
      // Pattern 1: First Last format (like "John Smith", "Sarah Johnson")
      if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim())) {
        // But exclude if it has business identifiers
        if (name.toLowerCase().includes('inc') || 
            name.toLowerCase().includes('llc') || 
            name.toLowerCase().includes('corp') ||
            name.toLowerCase().includes('ltd') ||
            name.toLowerCase().includes('group') ||
            name.toLowerCase().includes('company') ||
            name.toLowerCase().includes('associates') ||
            name.toLowerCase().includes('partners') ||
            name.toLowerCase().includes('services') ||
            name.toLowerCase().includes('consulting')) {
          return false
        }
        return true
      }
      
      // Pattern 2: Dr. First Last format (like "Dr. Sarah Johnson")
      if (/^Dr\. [A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim())) {
        return true
      }
      
      // Pattern 3: Mr./Ms./Mrs. First Last format
      if (/^(Mr|Ms|Mrs)\. [A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim())) {
        return true
      }
      
      return false
    })
    
    console.log(`\n🎯 Found ${personalNameBusinesses.length} businesses that should be in Personal Names:`)
    personalNameBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Personal Names'
      const status = isInCorrectGroup ? '✅ CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed personal name businesses to the correct group
    const incorrectlyPlaced = personalNameBusinesses.filter(member => member.group.name !== 'Personal Names')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} incorrectly placed personal name businesses...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: personalGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Personal Names`)
      }
    } else {
      console.log(`\n✅ All personal name businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: personalGroup.id }
    })
    
    console.log(`\n📊 Final Personal Names count: ${finalCount}`)
    
    console.log(`\n✅ STEP 2 COMPLETE: Personal Names category is now correct!`)
    console.log(`\n📋 Next step: Fix Chains & Franchises category`)
    console.log(`   Run: npx tsx scripts/fix-chains-franchises-only.ts`)
    
  } catch (error) {
    console.error('❌ Failed to fix personal names:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixPersonalNamesOnly()
  .then(() => {
    console.log('\n✅ Personal names fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
