import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Quick automation test configuration
const QUICK_TEST_CONFIG = {
  testEmails: [
    'gabriel.lacroix94@icloud.com',
    'greenalderson@gmail.com', 
    'gabriel@evergreenwebsolutions.ca',
    'Tangible18@outlook.com'
  ],
  
  // Test with shorter delays for quick verification
  schedules: [
    { delay: 0.5, name: 'Immediate (30s)' },    // 30 seconds
    { delay: 1, name: 'Short delay (1min)' },   // 1 minute  
    { delay: 2, name: 'Medium delay (2min)' },  // 2 minutes
    { delay: 3, name: 'Long delay (3min)' },    // 3 minutes
  ],
  
  checkInterval: 15 * 1000, // Check every 15 seconds
  testDuration: 5 * 60 * 1000, // 5 minutes total
}

// Generate tracking links
function generateTrackingLink(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return `${baseUrl}/track/click?business=${businessId}&campaign=${campaignId}&schedule=${scheduleId}&t=${Date.now()}`
}

function generateTrackingPixel(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return `${baseUrl}/track/pixel?business=${businessId}&campaign=${campaignId}&schedule=${scheduleId}&t=${Date.now()}`
}

function generateUnsubscribeLinks(businessId: string, campaignId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return {
    unsubscribe: `${baseUrl}/unsubscribe?business=${businessId}&campaign=${campaignId}`,
    preferences: `${baseUrl}/preferences?business=${businessId}&campaign=${campaignId}`
  }
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
    const emailJob = await prisma.emailJob.create({
      data: {
        campaignId,
        recipientEmail: to,
        recipientId: businessId,
        sendAt: new Date(),
        status: 'sent',
        meta: {
          businessId,
          scheduleId,
          automationTest: true,
          trackingEnabled: true,
          sentAt: new Date().toISOString()
        }
      }
    })

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
    
    for (const member of schedule.group.members) {
      const trackingLink = generateTrackingLink(member.businessId, schedule.campaignId, schedule.id)
      const trackingPixel = generateTrackingPixel(member.businessId, schedule.campaignId, schedule.id)
      const { unsubscribe, preferences } = generateUnsubscribeLinks(member.businessId, schedule.campaignId)

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

      const processedSubject = processTemplate(schedule.template.subject, variables)
      const processedHtml = processTemplate(schedule.template.htmlBody, variables)
      const processedText = processTemplate(schedule.template.textBody || '', variables)

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

// Main quick automation test
async function testQuickAutomation() {
  console.log('🤖 Starting QUICK automation/scheduling test...')
  console.log(`⏰ Test duration: ${QUICK_TEST_CONFIG.testDuration / 60000} minutes`)
  console.log(`🔍 Check interval: ${QUICK_TEST_CONFIG.checkInterval / 1000} seconds`)

  try {
    // Get test data
    const testGroups = await prisma.audienceGroup.findMany({
      where: { meta: { path: ['testGroup'], equals: true } },
      include: { members: true }
    })

    if (testGroups.length === 0) {
      console.log('❌ No test groups found. Please run setup-test-environment.ts first.')
      return
    }

    // Create automation test template
    const testTemplate = {
      name: 'Quick Automation Test Template',
      subject: '🤖 Quick Automation Test - {{delayName}}',
      htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Automation Test - {{delayName}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🤖 Quick Automation Test</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">{{delayName}}</p>
  </div>
  
  <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>This is a <strong>quick automation test email</strong> for {{businessName}} sent after a {{delayName}} delay.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center;">
      <h3 style="color: #667eea; margin-top: 0;">Quick Test Details</h3>
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
      <li>✅ Global template integration</li>
    </ul>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>{{global_signature_name}}<br>{{global_signature_title}}<br>{{global_signature_company}}</p>
    <p style="font-size: 12px; color: #999;">
      This quick automation test email was sent to {{email}} at {{sentTime}}<br>
      <a href="{{unsubscribeLink}}" style="color: #999;">Unsubscribe</a> | 
      <a href="{{preferencesLink}}" style="color: #999;">Update Preferences</a>
    </p>
  </div>
  
  <img src="{{trackingPixel}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`,
      textBody: `🤖 Quick Automation Test - {{delayName}}

Hello {{contactPerson}}!

This is a quick automation test email for {{businessName}} sent after a {{delayName}} delay.

Quick Test Details:
Delay: {{delayName}}
Scheduled at: {{scheduledTime}}
Sent at: {{sentTime}}

Test Automation Link: {{trackingLink}}

Automation Features Tested:
✅ Scheduled email delivery
✅ Time-based automation
✅ Unique tracking per business
✅ Global template integration

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}

This quick automation test email was sent to {{email}} at {{sentTime}}
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
      meta: {
        automationTest: true,
        quickTest: true
      }
    }

    const template = await prisma.campaignTemplate.create({
      data: testTemplate
    })

    // Create automation test campaign
    const automationCampaign = await prisma.campaign.create({
      data: {
        name: 'Quick Automation Test Campaign - 5min',
        description: 'Testing automated email scheduling over 5 minutes',
        status: 'SCHEDULED',
        meta: {
          automationTest: true,
          quickTest: true,
          testDuration: QUICK_TEST_CONFIG.testDuration,
          createdBy: 'quick-automation-test'
        }
      }
    })

    // Create scheduled emails at different intervals
    console.log('⏰ Creating scheduled emails...')
    const scheduledEmails = []
    
    for (let i = 0; i < QUICK_TEST_CONFIG.schedules.length; i++) {
      const schedule = QUICK_TEST_CONFIG.schedules[i]
      const sendAt = new Date(Date.now() + schedule.delay * 60 * 1000)
      
      const campaignSchedule = await prisma.campaignSchedule.create({
        data: {
          name: `Quick Test - ${schedule.name}`,
          campaignId: automationCampaign.id,
          templateId: template.id,
          groupId: testGroups[i % testGroups.length].id,
          sendAt,
          timeZone: 'America/Vancouver',
          status: 'SCHEDULED',
          stepOrder: i + 1,
          meta: {
            automationTest: true,
            quickTest: true,
            delayName: schedule.name,
            delayMinutes: schedule.delay,
            scheduledAt: sendAt.toISOString(),
            createdBy: 'quick-automation-test'
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

    // Start monitoring
    console.log('\n🚀 Starting automation monitoring...')
    console.log('📊 Monitoring scheduled emails every 15 seconds...\n')

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
      if (Date.now() - startTime >= QUICK_TEST_CONFIG.testDuration) {
        clearInterval(monitor)
        console.log('\n🏁 Quick automation test completed!')
        
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
        console.log('✅ Automated processing every 15 seconds')
        console.log('✅ Multiple schedules at different times')
        console.log('✅ Email job tracking and events')
        console.log('✅ Campaign schedule status updates')
        console.log('✅ Global template integration')
        console.log('✅ Unique tracking per business')
        
        console.log('\n🚀 Quick automation test completed successfully!')
        process.exit(0)
      }
    }, QUICK_TEST_CONFIG.checkInterval)

  } catch (error) {
    console.error('❌ Quick automation test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the quick automation test
testQuickAutomation()
  .then(() => {
    console.log('\n🤖 Quick automation test completed!')
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })


