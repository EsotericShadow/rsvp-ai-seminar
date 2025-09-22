import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeDummyBusinesses() {
  console.log('🧹 Removing ALL dummy/test businesses from the database...')
  
  try {
    // Find and remove dummy businesses by their fake email domains
    const dummyEmailDomains = [
      'business123.com',
      'company456.com', 
      'enterprise789.com',
      'healthcare.com',
      'rodriguezlaw.com',
      'chenaccounting.com',
      'thompsonconsulting.com',
      'martinezrealestate.com',
      'boutiquefashion.com',
      'mamarosas.com',
      'elitehomeimprovements.com',
      'serenityspa.com',
      'wilsonlaw.com',
      'creativemarketing.com',
      'sunrisepractice.com',
      'downtowndental.com'
    ]
    
    console.log('🔍 Finding dummy businesses to remove...')
    
    let totalRemoved = 0
    
    for (const domain of dummyEmailDomains) {
      const dummyMembers = await prisma.audienceMember.findMany({
        where: {
          primaryEmail: {
            endsWith: domain
          }
        }
      })
      
      if (dummyMembers.length > 0) {
        console.log(`\n🗑️ Removing ${dummyMembers.length} dummy businesses with ${domain} emails:`)
        
        for (const member of dummyMembers) {
          console.log(`  - ${member.businessName} (${member.primaryEmail})`)
          
          await prisma.audienceMember.delete({
            where: { id: member.id }
          })
          
          totalRemoved++
        }
      }
    }
    
    // Also remove any businesses with obviously fake names
    const fakeBusinessNames = [
      'Business 123',
      'Company #456', 
      'Enterprise 789',
      'Dr. Sarah Johnson',
      'Michael Rodriguez',
      'Jennifer Chen',
      'Robert Thompson',
      'Lisa Martinez',
      'Boutique Fashion Store',
      'Mama Rosa\'s Italian Restaurant',
      'Elite Home Improvements',
      'Serenity Spa & Wellness',
      'Wilson & Associates Law Firm',
      'Creative Marketing Solutions',
      'Sunrise Family Practice',
      'Downtown Dental Care'
    ]
    
    console.log('\n🔍 Finding businesses with fake names...')
    
    for (const fakeName of fakeBusinessNames) {
      const fakeMembers = await prisma.audienceMember.findMany({
        where: {
          businessName: fakeName
        }
      })
      
      if (fakeMembers.length > 0) {
        console.log(`\n🗑️ Removing ${fakeMembers.length} businesses with fake name "${fakeName}":`)
        
        for (const member of fakeMembers) {
          console.log(`  - ${member.businessName} (${member.primaryEmail})`)
          
          await prisma.audienceMember.delete({
            where: { id: member.id }
          })
          
          totalRemoved++
        }
      }
    }
    
    console.log(`\n✅ Removed ${totalRemoved} dummy businesses total`)
    
    // Show final counts
    const finalCounts = await Promise.all([
      prisma.audienceGroup.count(),
      prisma.audienceMember.count()
    ])
    
    console.log(`\n📊 Final counts after cleanup:`)
    console.log(`- Groups: ${finalCounts[0]}`)
    console.log(`- Members: ${finalCounts[1]}`)
    
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
    
    console.log(`\n📊 Members by group after cleanup:`)
    groupBreakdown.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} members`)
    })
    
    console.log(`\n✅ Database cleaned of all dummy businesses!`)
    console.log(`\n📋 Now ready to properly categorize the REAL businesses one category at a time`)
    
  } catch (error) {
    console.error('❌ Failed to remove dummy businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

removeDummyBusinesses()
  .then(() => {
    console.log('\n✅ Dummy business cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })
