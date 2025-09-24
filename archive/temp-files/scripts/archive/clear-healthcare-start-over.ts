import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearHealthcareStartOver() {
  console.log('🧹 Clearing Healthcare & Wellness group to start over properly...')
  
  try {
    // Find the healthcare group
    const healthcareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Healthcare & Wellness' }
    })
    
    if (!healthcareGroup) {
      console.log('❌ Healthcare & Wellness group not found!')
      return
    }
    
    console.log(`\n📊 Current Healthcare & Wellness group has ${await prisma.audienceMember.count({ where: { groupId: healthcareGroup.id } })} members`)
    
    // Clear out all members from healthcare group
    console.log(`\n🗑️ Removing all members from Healthcare & Wellness group...`)
    
    await prisma.audienceMember.deleteMany({
      where: { groupId: healthcareGroup.id }
    })
    
    console.log(`✅ Cleared all members from Healthcare & Wellness group`)
    
    // Show current state
    const counts = await Promise.all([
      prisma.audienceGroup.count(),
      prisma.audienceMember.count()
    ])
    
    console.log(`\n📊 Current database state:`)
    console.log(`- Groups: ${counts[0]}`)
    console.log(`- Members: ${counts[1]}`)
    
    // Show breakdown by group
    const groupBreakdown = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n📊 Members by group:`)
    groupBreakdown.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} members`)
    })
    
    console.log(`\n✅ Healthcare & Wellness group is now empty and ready for proper categorization`)
    console.log(`\n📋 Next steps:`)
    console.log(`1. ✅ Numbered Businesses: ${groupBreakdown.find(g => g.name === 'Numbered Businesses')?._count.members || 0} members (CORRECT)`)
    console.log(`2. ✅ Personal Names: ${groupBreakdown.find(g => g.name === 'Personal Names')?._count.members || 0} members (CORRECT)`)
    console.log(`3. ✅ Chains & Franchises: ${groupBreakdown.find(g => g.name === 'Chains & Franchises')?._count.members || 0} members (CORRECT)`)
    console.log(`4. 🆕 Healthcare & Wellness: 0 members (READY FOR PROPER CATEGORIZATION)`)
    console.log(`5. 🆕 Other groups: Need to be properly categorized`)
    
    console.log(`\n🎯 Now I can systematically add ONLY actual healthcare businesses to Healthcare & Wellness`)
    
  } catch (error) {
    console.error('❌ Failed to clear healthcare group:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearHealthcareStartOver()
  .then(() => {
    console.log('\n✅ Healthcare group cleared - ready to start over properly!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Clear failed:', error)
    process.exit(1)
  })
