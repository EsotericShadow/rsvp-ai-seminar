import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixNumberedBusinessesOnly() {
  console.log('🔢 STEP 1: Fixing ONLY the numbered businesses category...')
  
  try {
    // First, let's see what we have in the numbered businesses group
    const numberedGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Numbered Businesses' },
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
    
    if (!numberedGroup) {
      console.log('❌ Numbered Businesses group not found!')
      return
    }
    
    console.log(`\n📊 Current Numbered Businesses group:`)
    console.log(`- Group ID: ${numberedGroup.id}`)
    console.log(`- Current members: ${numberedGroup.members.length}`)
    
    console.log(`\n📋 Current members in Numbered Businesses:`)
    numberedGroup.members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    // Now let's find ALL businesses that should actually be in the numbered businesses category
    console.log(`\n🔍 Searching for ALL businesses that should be in Numbered Businesses...`)
    
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
    
    // Find businesses that match numbered business patterns
    const numberedBusinesses = allMembers.filter(member => {
      const name = member.businessName || ''
      
      // Pattern 1: Just numbers (like "123", "456")
      if (/^\d+$/.test(name.trim())) {
        return true
      }
      
      // Pattern 2: Word followed by numbers (like "Business 123", "Company 456")
      if (/^\w+\s+\d+\s*$/.test(name.trim())) {
        return true
      }
      
      // Pattern 3: Word followed by # and numbers (like "Business #123", "Company #456")
      if (/^\w+\s*#\s*\d+\s*$/.test(name.trim())) {
        return true
      }
      
      // Pattern 4: Numbers followed by word (like "123 Business", "456 Company")
      if (/^\d+\s+\w+\s*$/.test(name.trim())) {
        return true
      }
      
      return false
    })
    
    console.log(`\n🎯 Found ${numberedBusinesses.length} businesses that should be in Numbered Businesses:`)
    numberedBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Numbered Businesses'
      const status = isInCorrectGroup ? '✅ CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed numbered businesses to the correct group
    const incorrectlyPlaced = numberedBusinesses.filter(member => member.group.name !== 'Numbered Businesses')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} incorrectly placed numbered businesses...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: numberedGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Numbered Businesses`)
      }
    } else {
      console.log(`\n✅ All numbered businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: numberedGroup.id }
    })
    
    console.log(`\n📊 Final Numbered Businesses count: ${finalCount}`)
    
    console.log(`\n✅ STEP 1 COMPLETE: Numbered Businesses category is now correct!`)
    console.log(`\n📋 Next step: Fix Personal Names category`)
    console.log(`   Run: npx tsx scripts/fix-personal-names-only.ts`)
    
  } catch (error) {
    console.error('❌ Failed to fix numbered businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixNumberedBusinessesOnly()
  .then(() => {
    console.log('\n✅ Numbered businesses fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
