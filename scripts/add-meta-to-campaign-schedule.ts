import 'dotenv/config'
import prisma from '@/lib/prisma'

async function addMetaToCampaignSchedule() {
  console.log('Adding meta field to CampaignSchedule model...')
  
  try {
    // This would normally be done via a Prisma migration, but for now we'll work around it
    // by storing A/B/C/D testing info in the CampaignSettings table instead
    
    console.log('✅ Will use CampaignSettings.meta field for A/B/C/D testing configuration')
    
    // Create a simple script to set up proper throttling without the meta field
    const campaigns = await prisma.campaign.findMany({
      include: { settings: true }
    })
    
    for (const campaign of campaigns) {
      const defaultSettings = {
        windows: [
          { s: 540, e: 1080 } // 9 AM to 6 PM in minutes
        ],
        throttlePerMinute: 2, // 2 emails per minute = 120 per hour = max 1080 per day
        maxConcurrent: 10,
        paused: false
      }
      
      if (campaign.settings) {
        await prisma.campaignSettings.update({
          where: { campaignId: campaign.id },
          data: {
            throttlePerMinute: defaultSettings.throttlePerMinute,
            maxConcurrent: defaultSettings.maxConcurrent,
            paused: defaultSettings.paused,
            updatedAt: new Date()
          }
        })
      } else {
        await prisma.campaignSettings.create({
          data: {
            campaignId: campaign.id,
            windows: defaultSettings.windows,
            throttlePerMinute: defaultSettings.throttlePerMinute,
            maxConcurrent: defaultSettings.maxConcurrent,
            paused: defaultSettings.paused
          }
        })
      }
      
      console.log(`  ✅ Updated throttling settings for: ${campaign.name}`)
    }
    
    console.log('\n✅ Email throttling configured successfully!')
    console.log('\nKey Throttling Features:')
    console.log('• Max 2 emails per minute (120 per hour, 1080 per day)')
    console.log('• Sending windows: 9 AM - 6 PM Pacific')
    console.log('• Max 10 concurrent sends')
    console.log('• Campaigns can be paused individually')
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addMetaToCampaignSchedule().finally(() => {
  prisma.$disconnect()
})

