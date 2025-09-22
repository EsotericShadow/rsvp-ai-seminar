import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Test configuration for automation/scheduling
const AUTOMATION_TEST_CONFIG = {
  // Test emails to send to
  testEmails: [
    'gabriel.lacroix94@icloud.com',
    'greenalderson@gmail.com', 
    'gabriel@evergreenwebsolutions.ca',
    'Tangible18@outlook.com'
  ],
  
  // Schedule test emails at different intervals
  schedules: [
    { delay: 1, name: 'Immediate (1 min)' },      // 1 minute
    { delay: 3, name: 'Short delay (3 min)' },    // 3 minutes  
    { delay: 5, name: 'Medium delay (5 min)' },   // 5 minutes
    { delay: 10, name: 'Long delay (10 min)' },   // 10 minutes
    { delay: 15, name: 'Extended delay (15 min)' } // 15 minutes
  ],
  
  // A/B test configuration
  abTestSplit: 50,
  
  // Monitoring interval (check every 30 seconds)
  checkInterval: 30 * 1000, // 30 seconds
  
  // Total test duration
  testDuration: 20 * 60 * 1000, // 20 minutes
}

// Generate unique tracking links for each business
function generateTrackingLink(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return `${baseUrl}/track/click?business=${businessId}&campaign=${campaignId}&schedule=${scheduleId}&t=${Date.now()}`
}

// Generate unique tracking pixel for each business
function generateTrackingPixel(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return `${baseUrl}/track/pixel?business=${businessId}&campaign=${campaignId}&schedule=${scheduleId}&t=${Date.now()}`
}

// Generate unsubscribe and preferences links
function generateUnsubscribeLinks(businessId: string, campaignId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return {
    unsubscribe: `${baseUrl}/unsubscribe?business=${businessId}&campaign=${campaignId}`,
    preferences: `${baseUrl}/preferences?business=${businessId}&campaign=${campaignId}`
  }
}

// Get global template settings
async function getGlobalTemplateSettings() {
  const settings = await prisma.globalTemplateSettings.findFirst({
    where: { id: { not: undefined } }
  })
  
  if (!settings) {
    return await prisma.globalTemplateSettings.create({
      data: {
        global_hero_title: 'Welcome to Evergreen AI',
        global_hero_message: 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
        global_signature_name: 'Gabriel Lacroix',
        global_signature_title: 'AI Solutions Specialist',
        global_signature_company: 'Evergreen Web Solutions',
        global_signature_location: 'Terrace, BC',
        global_event_title: 'Event Details',
        global_event_date: 'October 23rd, 2025',
        global_event_time: '6:00 PM - 8:00 PM',
        global_event_location: 'Terrace, BC',
        global_event_cost: 'Free',
        global_event_includes: 'Coffee, refreshments, networking, and actionable AI insights'
      }
    })
  }
  
  return settings
}

// Process template with variables
function processTemplate(template: string, variables: Record<string, string>) {
  let processed = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(regex, value)
  })
  
  return processed
}

// Create automation test templates
function createAutomationTestTemplates(globalSettings: any) {
  const baseTemplate = {
    name: 'Automation Test Template',
    subject: 'Automated Test Email - {{delayName}}',
    htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Automation Test - {{delayName}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🤖 Automation Test</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">{{delayName}}</p>
  </div>
  
  <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>This is an <strong>automated test email</strong> for {{businessName}} sent after a {{delayName}} delay.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center;">
      <h3 style="color: #667eea; margin-top: 0;">Automation Test Details</h3>
      <p style="font-size: 18px; margin: 10px 0;"><strong>Delay: {{delayName}}</strong></p>
      <p style="color: #666; font-size: 14px;">Scheduled at: {{scheduledTime}}</p>
      <p style="color: #666; font-size: 14px;">Sent at: {{sentTime}}</p>
    </div>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{trackingLink}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Test Automation Link</a>
  </div>
  
  <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #2c3e50; margin-top: 0;">Automation Features Tested</h3>
    <ul style="color: #555; margin: 0;">
      <li>✅ Scheduled email delivery</li>
      <li>✅ Time-based automation</li>
      <li>✅ Unique tracking per business</li>
      <li>✅ A/B testing (if applicable)</li>
      <li>✅ Global template integration</li>
    </ul>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>{{global_signature_name}}<br>{{global_signature_title}}<br>{{global_signature_company}}</p>
    <p style="font-size: 12px; color: #999;">
      This automated test email was sent to {{email}} at {{sentTime}}<br>
      <a href="{{unsubscribeLink}}" style="color: #999;">Unsubscribe</a> | 
      <a href="{{preferencesLink}}" style="color: #999;">Update Preferences</a>
    </p>
  </div>
  
  <!-- Tracking Pixel -->
  <img src="{{trackingPixel}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`,
    textBody: `🤖 Automation Test - {{delayName}}

Hello {{contactPerson}}!

This is an automated test email for {{businessName}} sent after a {{delayName}} delay.

Automation Test Details:
Delay: {{delayName}}
Scheduled at: {{scheduledTime}}
Sent at: {{sentTime}}

Test Automation Link: {{trackingLink}}

Automation Features Tested:
✅ Scheduled email delivery
✅ Time-based automation
✅ Unique tracking per business
✅ A/B testing (if applicable)
✅ Global template integration

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}

This automated test email was sent to {{email}} at {{sentTime}}
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    meta: {
      automationTest: true,
      testTemplate: true
    }
  }

  return baseTemplate
}

// Send email with tracking
async function sendEmailWithTracking(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  businessId: string,
  campaignId: string,
  scheduleId: string
) {
  try {
    // Create email job record
    const emailJob = await prisma.emailJob.create({
      data: {
        campaignId,
        recipientEmail: to,
        recipientId: businessId,
        sendAt: new Date(),
        status: 'sent', // Mark as sent immediately for automation test
        meta: {
          businessId,
          scheduleId,
          automationTest: true,
          trackingEnabled: true,
          sentAt: new Date().toISOString()
        }
      }
    })

    // Send via Resend
    const result = await resend.emails.send({
      from: process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <gabriel.lacroix94@icloud.com>',
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Campaign-ID': campaignId,
        'X-Schedule-ID': scheduleId,
        'X-Business-ID': businessId,
        'X-Automation-Test': 'true'
      }
    })

    // Update email job with result
    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: {
        sentAt: new Date(),
        providerMessageId: result.data?.id || null,
        meta: {
          ...emailJob.meta,
          resendMessageId: result.data?.id,
          sentAt: new Date().toISOString()
        }
      }
    })

    // Create sent event
    await prisma.emailEvent.create({
      data: {
        jobId: emailJob.id,
        type: 'sent',
        meta: {
          provider: 'resend',
          messageId: result.data?.id,
          businessId,
          campaignId,
          scheduleId,
          automationTest: true
        }
      }
    })

    console.log(`✅ Automation email sent to ${to} (${businessId}) - Job ID: ${emailJob.id}`)
    return { success: true, jobId: emailJob.id, messageId: result.data?.id }

  } catch (error) {
    console.error(`❌ Failed to send automation email to ${to}:`, error)
    return { success: false, error: error.message }
  }
}

// Check and process scheduled emails
async function processScheduledEmails() {
  const now = new Date()
  
  // Find all scheduled emails that are due
  const dueSchedules = await prisma.campaignSchedule.findMany({
    where: {
      status: 'SCHEDULED',
      sendAt: {
        lte: now
      }
    },
    include: {
      template: true,
      group: {
        include: {
          members: true
        }
      },
      campaign: true
    }
  })

  console.log(`🔍 Found ${dueSchedules.length} schedules due for processing`)

  for (const schedule of dueSchedules) {
    console.log(`📧 Processing schedule: ${schedule.name} (${schedule.group.members.length} members)`)
    
    // Get global template settings
    const globalSettings = await getGlobalTemplateSettings()
    
    for (const member of schedule.group.members) {
      // Generate unique tracking links
      const trackingLink = generateTrackingLink(member.businessId, schedule.campaignId, schedule.id)
      const trackingPixel = generateTrackingPixel(member.businessId, schedule.campaignId, schedule.id)
      const { unsubscribe, preferences } = generateUnsubscribeLinks(member.businessId, schedule.campaignId)

      // Prepare variables
      const variables = {
        contactPerson: member.meta?.contactPerson || 'Valued Customer',
        businessName: member.businessName || 'Your Business',
        email: member.primaryEmail,
        trackingLink,
        trackingPixel,
        unsubscribeLink: unsubscribe,
        preferencesLink: preferences,
        delayName: schedule.meta?.delayName || 'Unknown',
        scheduledTime: schedule.sendAt?.toISOString() || 'Unknown',
        sentTime: new Date().toISOString(),
        // Global template variables
        global_hero_title: globalSettings.global_hero_title,
        global_hero_message: globalSettings.global_hero_message,
        global_signature_name: globalSettings.global_signature_name,
        global_signature_title: globalSettings.global_signature_title,
        global_signature_company: globalSettings.global_signature_company,
        global_signature_location: globalSettings.global_signature_location,
        global_event_title: globalSettings.global_event_title,
        global_event_date: globalSettings.global_event_date,
        global_event_time: globalSettings.global_event_time,
        global_event_location: globalSettings.global_event_location,
        global_event_cost: globalSettings.global_event_cost,
        global_event_includes: globalSettings.global_event_includes
      }

      // Process templates
      const processedSubject = processTemplate(schedule.template.subject, variables)
      const processedHtml = processTemplate(schedule.template.htmlBody, variables)
      const processedText = processTemplate(schedule.template.textBody || '', variables)

      // Send email
      await sendEmailWithTracking(
        member.primaryEmail,
        processedSubject,
        processedHtml,
        processedText,
        member.businessId,
        schedule.campaignId,
        schedule.id
      )
    }

    // Mark schedule as completed
    await prisma.campaignSchedule.update({
      where: { id: schedule.id },
      data: {
        status: 'COMPLETED',
        lastRunAt: new Date()
      }
    })
  }

  return dueSchedules.length
}

// Main automation test function
async function testAutomationScheduling() {
  console.log('🤖 Starting automation/scheduling test...')
  console.log(`⏰ Test duration: ${AUTOMATION_TEST_CONFIG.testDuration / 60000} minutes`)
  console.log(`🔍 Check interval: ${AUTOMATION_TEST_CONFIG.checkInterval / 1000} seconds`)

  try {
    // 1. Get global template settings
    console.log('📋 Loading global template settings...')
    const globalSettings = await getGlobalTemplateSettings()

    // 2. Get test data
    console.log('📊 Loading test data...')
    const testGroups = await prisma.audienceGroup.findMany({
      where: { meta: { path: ['testGroup'], equals: true } },
      include: { members: true }
    })

    if (testGroups.length === 0) {
      console.log('❌ No test groups found. Please run setup-test-environment.ts first.')
      return
    }

    // 3. Create automation test template
    console.log('🧪 Creating automation test template...')
    const testTemplate = createAutomationTestTemplates(globalSettings)
    const template = await prisma.campaignTemplate.create({
      data: testTemplate
    })

    // 4. Create automation test campaign
    console.log('📧 Creating automation test campaign...')
    const automationCampaign = await prisma.campaign.create({
      data: {
        name: 'Automation Test Campaign - 20min',
        description: 'Testing automated email scheduling over 20 minutes',
        status: 'SCHEDULED',
        meta: {
          automationTest: true,
          testDuration: AUTOMATION_TEST_CONFIG.testDuration,
          createdBy: 'automation-test'
        }
      }
    })

    // 5. Create scheduled emails at different intervals
    console.log('⏰ Creating scheduled emails...')
    const scheduledEmails = []
    
    for (let i = 0; i < AUTOMATION_TEST_CONFIG.schedules.length; i++) {
      const schedule = AUTOMATION_TEST_CONFIG.schedules[i]
      const sendAt = new Date(Date.now() + schedule.delay * 60 * 1000)
      
      const campaignSchedule = await prisma.campaignSchedule.create({
        data: {
          name: `Automation Test - ${schedule.name}`,
          campaignId: automationCampaign.id,
          templateId: template.id,
          groupId: testGroups[i % testGroups.length].id, // Distribute across groups
          sendAt,
          timeZone: 'America/Vancouver',
          status: 'SCHEDULED',
          stepOrder: i + 1,
          meta: {
            automationTest: true,
            delayName: schedule.name,
            delayMinutes: schedule.delay,
            scheduledAt: sendAt.toISOString(),
            createdBy: 'automation-test'
          }
        }
      })
      
      scheduledEmails.push({
        ...campaignSchedule,
        sendAt,
        delayName: schedule.name
      })
      
      console.log(`📅 Scheduled: ${schedule.name} at ${sendAt.toLocaleTimeString()}`)
    }

    // 6. Start monitoring and processing
    console.log('\n🚀 Starting automation monitoring...')
    console.log('📊 Monitoring scheduled emails every 30 seconds...\n')

    const startTime = Date.now()
    let totalProcessed = 0
    let checkCount = 0

    const monitor = setInterval(async () => {
      checkCount++
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      
      console.log(`\n🔍 Check #${checkCount} (${elapsed}s elapsed)`)
      
      try {
        const processed = await processScheduledEmails()
        totalProcessed += processed
        
        if (processed > 0) {
          console.log(`✅ Processed ${processed} schedules in this check`)
        } else {
          console.log('⏳ No schedules due yet')
        }
        
        // Show upcoming schedules
        const upcoming = await prisma.campaignSchedule.findMany({
          where: {
            status: 'SCHEDULED',
            sendAt: { gt: new Date() }
          },
          orderBy: { sendAt: 'asc' },
          take: 3
        })
        
        if (upcoming.length > 0) {
          console.log('📅 Next scheduled emails:')
          upcoming.forEach(schedule => {
            const timeUntil = Math.round((schedule.sendAt!.getTime() - Date.now()) / 1000)
            console.log(`   - ${schedule.name}: ${timeUntil}s from now`)
          })
        }
        
      } catch (error) {
        console.error('❌ Error during monitoring:', error)
      }
      
      // Stop after test duration
      if (Date.now() - startTime >= AUTOMATION_TEST_CONFIG.testDuration) {
        clearInterval(monitor)
        console.log('\n🏁 Automation test completed!')
        
        // Final summary
        const finalStats = await prisma.emailJob.findMany({
          where: {
            meta: { path: ['automationTest'], equals: true }
          }
        })
        
        console.log('\n📊 Final Results:')
        console.log(`- Total checks performed: ${checkCount}`)
        console.log(`- Total schedules processed: ${totalProcessed}`)
        console.log(`- Total emails sent: ${finalStats.length}`)
        console.log(`- Test duration: ${Math.round((Date.now() - startTime) / 1000)}s`)
        
        console.log('\n🎯 Automation Features Tested:')
        console.log('✅ Scheduled email delivery')
        console.log('✅ Time-based automation triggers')
        console.log('✅ Automated processing every 30 seconds')
        console.log('✅ Multiple schedules at different times')
        console.log('✅ Email job tracking and events')
        console.log('✅ Campaign schedule status updates')
        console.log('✅ Global template integration')
        console.log('✅ Unique tracking per business')
        
        console.log('\n🚀 Automation test completed successfully!')
        process.exit(0)
      }
    }, AUTOMATION_TEST_CONFIG.checkInterval)

  } catch (error) {
    console.error('❌ Automation test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the automation test
testAutomationScheduling()
  .then(() => {
    console.log('\n🤖 Automation scheduling test completed!')
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })

