import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExistingData() {
  console.log('🔍 Checking what data exists in the database...')
  
  try {
    // Check what data we have
    const counts = await Promise.all([
      prisma.campaign.count(),
      prisma.campaignTemplate.count(),
      prisma.audienceGroup.count(),
      prisma.audienceMember.count(),
      prisma.rSVP.count(),
      prisma.visit.count(),
    ])

    console.log('\n📊 Current database state:')
    console.log(`- Campaigns: ${counts[0]}`)
    console.log(`- Templates: ${counts[1]}`)
    console.log(`- Audience Groups: ${counts[2]}`)
    console.log(`- Audience Members: ${counts[3]}`)
    console.log(`- RSVPs: ${counts[4]}`)
    console.log(`- Visits: ${counts[5]}`)
    
    // Check if we have any global template settings
    const globalSettings = await prisma.globalTemplateSettings.findFirst()
    console.log(`- Global Template Settings: ${globalSettings ? 'Yes' : 'No'}`)
    
    if (globalSettings) {
      console.log('\n📧 Global Template Settings:')
      console.log(`- Event Name: ${globalSettings.eventName}`)
      console.log(`- Event Date: ${globalSettings.eventDate}`)
      console.log(`- Event Time: ${globalSettings.eventTime}`)
      console.log(`- Event Location: ${globalSettings.eventLocation}`)
      console.log(`- Event Description: ${globalSettings.eventDescription}`)
    }
    
    // Check if we have any global HTML template
    const globalHTML = await prisma.globalHTMLTemplate.findFirst()
    console.log(`- Global HTML Template: ${globalHTML ? 'Yes' : 'No'}`)
    
    console.log('\n📋 Next Steps:')
    if (counts[2] === 0) {
      console.log('1. Need to create audience groups')
      console.log('2. Need to import businesses from LeadMine or create manually')
      console.log('3. Need to create campaign templates')
      console.log('4. Need to set up campaigns')
    } else {
      console.log('1. Review existing audience groups')
      console.log('2. Add more businesses to groups')
      console.log('3. Create new campaigns')
    }
    
    console.log('\n🔧 LeadMine Configuration:')
    console.log('LeadMine API appears to not be configured.')
    console.log('To import businesses, we need:')
    console.log('- LEADMINE_API_BASE environment variable')
    console.log('- LEADMINE_API_KEY environment variable')
    console.log('Or we can create businesses manually through the UI.')
    
  } catch (error) {
    console.error('❌ Failed to check existing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingData()
  .then(() => {
    console.log('\n✅ Data check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Data check failed:', error)
    process.exit(1)
  })
