import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateMetaFields() {
  console.log('🔄 Migrating meta fields...')

  try {
    // Add meta field to existing AudienceGroups
    console.log('📧 Updating AudienceGroups...')
    const audienceGroups = await prisma.audienceGroup.findMany()
    for (const group of audienceGroups) {
      await prisma.audienceGroup.update({
        where: { id: group.id },
        data: {
          meta: {
            migrated: true,
            originalCriteria: group.criteria,
            migrationDate: new Date().toISOString()
          }
        }
      })
    }

    // Add meta field to existing CampaignTemplates
    console.log('📝 Updating CampaignTemplates...')
    const templates = await prisma.campaignTemplate.findMany()
    for (const template of templates) {
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          meta: {
            migrated: true,
            migrationDate: new Date().toISOString(),
            templateType: 'legacy'
          }
        }
      })
    }

    // Add meta field to existing Campaigns
    console.log('📊 Updating Campaigns...')
    const campaigns = await prisma.campaign.findMany()
    for (const campaign of campaigns) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          meta: {
            migrated: true,
            migrationDate: new Date().toISOString(),
            campaignType: 'legacy'
          }
        }
      })
    }

    // Add meta field to existing CampaignSchedules
    console.log('⏰ Updating CampaignSchedules...')
    const schedules = await prisma.campaignSchedule.findMany()
    for (const schedule of schedules) {
      await prisma.campaignSchedule.update({
        where: { id: schedule.id },
        data: {
          meta: {
            migrated: true,
            migrationDate: new Date().toISOString(),
            scheduleType: 'legacy'
          }
        }
      })
    }

    // Add meta field to existing CampaignSends
    console.log('📤 Updating CampaignSends...')
    const sends = await prisma.campaignSend.findMany()
    for (const send of sends) {
      await prisma.campaignSend.update({
        where: { id: send.id },
        data: {
          meta: {
            migrated: true,
            migrationDate: new Date().toISOString(),
            sendType: 'legacy'
          }
        }
      })
    }

    // Add meta field to existing EmailEvents
    console.log('📧 Updating EmailEvents...')
    const events = await prisma.emailEvent.findMany()
    for (const event of events) {
      await prisma.emailEvent.update({
        where: { id: event.id },
        data: {
          meta: {
            migrated: true,
            migrationDate: new Date().toISOString(),
            eventType: 'legacy'
          }
        }
      })
    }

    console.log('✅ Meta fields migration complete!')
    console.log(`- Updated ${audienceGroups.length} audience groups`)
    console.log(`- Updated ${templates.length} campaign templates`)
    console.log(`- Updated ${campaigns.length} campaigns`)
    console.log(`- Updated ${schedules.length} campaign schedules`)
    console.log(`- Updated ${sends.length} campaign sends`)
    console.log(`- Updated ${events.length} email events`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateMetaFields()
  .then(() => {
    console.log('\n🚀 Meta fields migration is complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
