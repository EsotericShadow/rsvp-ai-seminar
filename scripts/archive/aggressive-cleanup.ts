import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function aggressiveCleanup() {
  console.log('🧹 Starting aggressive cleanup of ALL test data...')

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
    
    console.log('✅ All data cleaned up successfully!')
    
    // Now create fresh official data
    console.log('🚀 Creating fresh official data...')
    
    // Create official audience groups
    const techGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Technology Companies',
        description: 'Tech companies in Northern BC',
        criteria: { industry: 'Technology' },
        meta: { official: true, createdBy: 'fresh-setup' }
      }
    })

    const marketingGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Marketing Agencies',
        description: 'Marketing and advertising agencies',
        criteria: { industry: 'Marketing' },
        meta: { official: true, createdBy: 'fresh-setup' }
      }
    })

    const consultingGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Business Consultants',
        description: 'Business consulting and advisory services',
        criteria: { industry: 'Consulting' },
        meta: { official: true, createdBy: 'fresh-setup' }
      }
    })

    const webDevGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Web Development',
        description: 'Web development and digital services',
        criteria: { industry: 'Web Development' },
        meta: { official: true, createdBy: 'fresh-setup' }
      }
    })

    // Create official audience members (only 4 to respect 100 email limit)
    const officialBusinesses = [
      {
        id: 'official-business-1',
        name: 'Terrace Tech Solutions',
        industry: 'Technology',
        contactPerson: 'Sarah Johnson',
        email: 'gabriel.lacroix94@icloud.com',
        website: 'https://terracetech.ca',
        phone: '(250) 555-0101',
        location: 'Terrace, BC',
        groupId: techGroup.id
      },
      {
        id: 'official-business-2', 
        name: 'Northern Marketing Co',
        industry: 'Marketing',
        contactPerson: 'Mike Chen',
        email: 'greenalderson@gmail.com',
        website: 'https://northernmarketing.bc.ca',
        phone: '(250) 555-0102',
        location: 'Prince Rupert, BC',
        groupId: marketingGroup.id
      },
      {
        id: 'official-business-3',
        name: 'Evergreen Web Solutions',
        industry: 'Web Development',
        contactPerson: 'Gabriel Lacroix',
        email: 'gabriel@evergreenwebsolutions.ca',
        website: 'https://evergreenwebsolutions.ca',
        phone: '(250) 555-0103',
        location: 'Terrace, BC',
        groupId: webDevGroup.id
      },
      {
        id: 'official-business-4',
        name: 'BC Business Consulting',
        industry: 'Consulting',
        contactPerson: 'Lisa Thompson',
        email: 'Tangible18@outlook.com',
        website: 'https://bcbusinessconsulting.com',
        phone: '(250) 555-0104',
        location: 'Smithers, BC',
        groupId: consultingGroup.id
      }
    ]

    for (const business of officialBusinesses) {
      await prisma.audienceMember.create({
        data: {
          businessId: business.id,
          groupId: business.groupId,
          businessName: business.name,
          primaryEmail: business.email,
          secondaryEmail: null,
          inviteToken: `biz_${business.id}`,
          tagsSnapshot: [business.industry, business.location],
          unsubscribed: false,
          meta: {
            official: true,
            contactPerson: business.contactPerson,
            website: business.website,
            phone: business.phone,
            location: business.location,
            industry: business.industry,
            createdBy: 'fresh-setup'
          }
        }
      })
    }

    console.log('✅ Fresh official data created!')
    console.log(`📊 Summary:`)
    console.log(`- 4 audience groups created`)
    console.log(`- 4 audience members created`)
    console.log(`- All test data removed`)
    console.log(`- Ready for real email testing (100 email limit respected)`)

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
aggressiveCleanup()
  .then(() => {
    console.log('\n✅ Aggressive cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })

