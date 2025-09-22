import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllTestData() {
  console.log('🧹 Clearing ALL test data for production...')

  try {
    // Delete everything in the correct order to avoid foreign key constraints
    
    // 1. Delete all campaign sends
    console.log('🗑️ Deleting campaign sends...')
    await prisma.campaignSend.deleteMany({})
    
    // 2. Delete all email jobs
    console.log('🗑️ Deleting email jobs...')
    await prisma.emailJob.deleteMany({})
    
    // 3. Delete all email events
    console.log('🗑️ Deleting email events...')
    await prisma.emailEvent.deleteMany({})
    
    // 4. Delete all campaign schedules
    console.log('🗑️ Deleting campaign schedules...')
    await prisma.campaignSchedule.deleteMany({})
    
    // 5. Delete all campaigns
    console.log('🗑️ Deleting campaigns...')
    await prisma.campaign.deleteMany({})
    
    // 6. Delete all audience members
    console.log('🗑️ Deleting audience members...')
    await prisma.audienceMember.deleteMany({})
    
    // 7. Delete all audience groups
    console.log('🗑️ Deleting audience groups...')
    await prisma.audienceGroup.deleteMany({})
    
    // 8. Delete all campaign templates
    console.log('🗑️ Deleting campaign templates...')
    await prisma.campaignTemplate.deleteMany({})
    
    // 9. Delete all RSVPs
    console.log('🗑️ Deleting RSVPs...')
    await prisma.rSVP.deleteMany({})
    
    // 10. Delete all visits
    console.log('🗑️ Deleting visits...')
    await prisma.visit.deleteMany({})
    
    console.log('✅ All test data cleared successfully!')
    
    // Show current state
    const counts = await Promise.all([
      prisma.campaign.count(),
      prisma.campaignTemplate.count(),
      prisma.audienceGroup.count(),
      prisma.audienceMember.count(),
      prisma.rSVP.count(),
      prisma.visit.count(),
      prisma.campaignSend.count(),
      prisma.emailJob.count(),
      prisma.emailEvent.count()
    ])

    console.log('\n📊 Current database state:')
    console.log(`- Campaigns: ${counts[0]}`)
    console.log(`- Templates: ${counts[1]}`)
    console.log(`- Audience Groups: ${counts[2]}`)
    console.log(`- Audience Members: ${counts[3]}`)
    console.log(`- RSVPs: ${counts[4]}`)
    console.log(`- Visits: ${counts[5]}`)
    console.log(`- Campaign Sends: ${counts[6]}`)
    console.log(`- Email Jobs: ${counts[7]}`)
    console.log(`- Email Events: ${counts[8]}`)
    
    console.log('\n🎉 Database is now clean and ready for production!')
    console.log('📋 Next steps:')
    console.log('1. Create real audience groups')
    console.log('2. Import real businesses from LeadMine')
    console.log('3. Create production email templates')
    console.log('4. Set up real campaigns')
    console.log('5. Start sending to real audiences')

  } catch (error) {
    console.error('❌ Failed to clear test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearAllTestData()
  .then(() => {
    console.log('\n✅ All test data cleared successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })
