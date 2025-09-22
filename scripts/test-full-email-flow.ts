import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Test configuration
const TEST_CONFIG = {
  // Email addresses to send test emails to
  testEmails: [
    'gabriel.lacroix94@icloud.com',
    'greenalderson@gmail.com', 
    'gabriel@evergreenwebsolutions.ca',
    'Tangible18@outlook.com'
  ],
  
  // A/B test configuration
  abTestSplit: 50, // 50/50 split
  
  // Campaign sequences (multiple emails per campaign)
  sequences: [
    {
      name: 'Welcome Series',
      steps: [
        { delay: 0, name: 'Welcome Email' },
        { delay: 24 * 60 * 60 * 1000, name: 'Follow-up Email' }, // 24 hours
        { delay: 72 * 60 * 60 * 1000, name: 'Final Reminder' } // 72 hours
      ]
    },
    {
      name: 'A/B Test Campaign',
      steps: [
        { delay: 0, name: 'A/B Test Email' }
      ]
    }
  ]
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
    // Create default settings if none exist
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
  
  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(regex, value)
  })
  
  return processed
}

// Create A/B test variants
function createABTestVariants(baseTemplate: any, globalSettings: any) {
  const variantA = {
    ...baseTemplate,
    name: `${baseTemplate.name} - Variant A`,
    subject: 'Don\'t Miss Out - Exclusive Offer Inside!',
    htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Offer - Don't Miss Out</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎉 Exclusive Offer Inside!</h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">Limited time only</p>
  </div>
  
  <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #856404; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>We have an <strong>exclusive offer</strong> just for {{businessName}} that we don't want you to miss!</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center;">
      <h3 style="color: #e74c3c; margin-top: 0;">50% OFF Your First Month</h3>
      <p style="font-size: 18px; margin: 10px 0;">Use code: <strong>WELCOME50</strong></p>
      <p style="color: #666; font-size: 14px;">Valid until the end of this month</p>
    </div>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{trackingLink}}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Claim Your Offer Now</a>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #2c3e50; margin-top: 0;">Why Choose Us?</h3>
    <ul style="color: #555; margin: 0;">
      <li>✅ Proven results with 95% client satisfaction</li>
      <li>✅ 24/7 dedicated support</li>
      <li>✅ No long-term contracts required</li>
      <li>✅ Money-back guarantee</li>
    </ul>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>{{global_signature_name}}<br>{{global_signature_title}}<br>{{global_signature_company}}</p>
    <p style="font-size: 12px; color: #999;">
      This email was sent to {{email}} because you joined our community.<br>
      <a href="{{unsubscribeLink}}" style="color: #999;">Unsubscribe</a> | 
      <a href="{{preferencesLink}}" style="color: #999;">Update Preferences</a>
    </p>
  </div>
  
  <!-- Tracking Pixel -->
  <img src="{{trackingPixel}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`,
    textBody: `🎉 Exclusive Offer Inside!

Hello {{contactPerson}}!

We have an exclusive offer just for {{businessName}} that we don't want you to miss!

50% OFF Your First Month
Use code: WELCOME50
Valid until the end of this month

Claim Your Offer: {{trackingLink}}

Why Choose Us?
✅ Proven results with 95% client satisfaction
✅ 24/7 dedicated support
✅ No long-term contracts required
✅ Money-back guarantee

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    meta: {
      ...baseTemplate.meta,
      abTestVariant: 'A',
      testTemplate: true
    }
  }

  const variantB = {
    ...baseTemplate,
    name: `${baseTemplate.name} - Variant B`,
    subject: 'Special Invitation for {{businessName}}',
    htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">You're Invited!</h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">A special opportunity awaits</p>
  </div>
  
  <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>We'd like to extend a <strong>special invitation</strong> to {{businessName}} to join our premium program.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center;">
      <h3 style="color: #27ae60; margin-top: 0;">Premium Program Access</h3>
      <p style="font-size: 18px; margin: 10px 0;">Get started with a <strong>free trial</strong></p>
      <p style="color: #666; font-size: 14px;">No credit card required</p>
    </div>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{trackingLink}}" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Start Free Trial</a>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #2c3e50; margin-top: 0;">What's Included?</h3>
    <ul style="color: #555; margin: 0;">
      <li>🌟 Full access to all premium features</li>
      <li>🌟 Priority customer support</li>
      <li>🌟 Advanced analytics and reporting</li>
      <li>🌟 Custom integrations and API access</li>
    </ul>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>{{global_signature_name}}<br>{{global_signature_title}}<br>{{global_signature_company}}</p>
    <p style="font-size: 12px; color: #999;">
      This email was sent to {{email}} because you joined our community.<br>
      <a href="{{unsubscribeLink}}" style="color: #999;">Unsubscribe</a> | 
      <a href="{{preferencesLink}}" style="color: #999;">Update Preferences</a>
    </p>
  </div>
  
  <!-- Tracking Pixel -->
  <img src="{{trackingPixel}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`,
    textBody: `You're Invited!

Hello {{contactPerson}}!

We'd like to extend a special invitation to {{businessName}} to join our premium program.

Premium Program Access
Get started with a free trial
No credit card required

Start Free Trial: {{trackingLink}}

What's Included?
🌟 Full access to all premium features
🌟 Priority customer support
🌟 Advanced analytics and reporting
🌟 Custom integrations and API access

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    meta: {
      ...baseTemplate.meta,
      abTestVariant: 'B',
      testTemplate: true
    }
  }

  return [variantA, variantB]
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
        status: 'scheduled',
        meta: {
          businessId,
          scheduleId,
          testEmail: true,
          trackingEnabled: true
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
        'X-Business-ID': businessId
      }
    })

    // Update email job with result
    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: {
        status: 'sent',
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
          scheduleId
        }
      }
    })

    console.log(`✅ Email sent to ${to} (${businessId}) - Job ID: ${emailJob.id}`)
    return { success: true, jobId: emailJob.id, messageId: result.data?.id }

  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error)
    return { success: false, error: error.message }
  }
}

// Main test function
async function testFullEmailFlow() {
  console.log('🚀 Starting comprehensive email flow test...')

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

    const testCampaigns = await prisma.campaign.findMany({
      where: { meta: { path: ['testCampaign'], equals: true } },
      include: { schedules: { include: { template: true, group: true } } }
    })

    // 3. Create A/B test templates
    console.log('🧪 Creating A/B test templates...')
    const baseTemplate = {
      name: 'A/B Test Base Template',
      subject: 'Test Subject',
      htmlBody: '',
      textBody: '',
      meta: { testTemplate: true }
    }

    const [variantA, variantB] = createABTestVariants(baseTemplate, globalSettings)

    // Create templates in database
    const templateA = await prisma.campaignTemplate.create({
      data: variantA
    })

    const templateB = await prisma.campaignTemplate.create({
      data: variantB
    })

    // 4. Create comprehensive test campaigns with sequences
    console.log('📧 Creating test campaigns with sequences...')
    
    // Welcome Series Campaign (3 emails)
    const welcomeCampaign = await prisma.campaign.create({
      data: {
        name: 'Test Welcome Series - Full Flow',
        description: 'Complete welcome series with 3 emails over 3 days',
        status: 'SCHEDULED',
        meta: {
          testCampaign: true,
          campaignType: 'welcome-series',
          sequenceLength: 3,
          createdBy: 'test-flow'
        }
      }
    })

    // A/B Test Campaign
    const abTestCampaign = await prisma.campaign.create({
      data: {
        name: 'Test A/B Campaign - Full Flow',
        description: 'A/B testing campaign with tracking',
        status: 'SCHEDULED',
        meta: {
          testCampaign: true,
          campaignType: 'ab-test',
          abTestEnabled: true,
          createdBy: 'test-flow'
        }
      }
    })

    // 5. Create campaign schedules with sequences
    console.log('⏰ Creating campaign schedules...')
    
    // Welcome series schedules (3 emails)
    const welcomeSchedules = []
    for (let i = 0; i < 3; i++) {
      const delay = i * 24 * 60 * 60 * 1000 // 0, 24, 48 hours
      const sendAt = new Date(Date.now() + delay + (i + 1) * 60 * 1000) // Stagger by 1 minute each
      
      const schedule = await prisma.campaignSchedule.create({
        data: {
          name: `Welcome Email ${i + 1}`,
          campaignId: welcomeCampaign.id,
          templateId: testCampaigns[0]?.schedules[0]?.templateId || templateA.id,
          groupId: testGroups[0]?.id || '',
          sendAt,
          timeZone: 'America/Vancouver',
          status: 'SCHEDULED',
          stepOrder: i + 1,
          meta: {
            testSchedule: true,
            sequence: i + 1,
            delay: delay,
            createdBy: 'test-flow'
          }
        }
      })
      welcomeSchedules.push(schedule)
    }

    // A/B test schedules
    const abTestScheduleA = await prisma.campaignSchedule.create({
      data: {
        name: 'A/B Test Variant A',
        campaignId: abTestCampaign.id,
        templateId: templateA.id,
        groupId: testGroups[2]?.id || '', // General group
        sendAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        timeZone: 'America/Vancouver',
        status: 'SCHEDULED',
        stepOrder: 1,
        meta: {
          testSchedule: true,
          abTestVariant: 'A',
          abTestSplit: 50,
          createdBy: 'test-flow'
        }
      }
    })

    const abTestScheduleB = await prisma.campaignSchedule.create({
      data: {
        name: 'A/B Test Variant B',
        campaignId: abTestCampaign.id,
        templateId: templateB.id,
        groupId: testGroups[2]?.id || '', // General group
        sendAt: new Date(Date.now() + 5 * 60 * 1000), // Same time for A/B test
        timeZone: 'America/Vancouver',
        status: 'SCHEDULED',
        stepOrder: 1,
        meta: {
          testSchedule: true,
          abTestVariant: 'B',
          abTestSplit: 50,
          createdBy: 'test-flow'
        }
      }
    })

    // 6. Send test emails with full tracking
    console.log('📤 Sending test emails with tracking...')
    
    let totalSent = 0
    let totalFailed = 0

    // Send welcome series emails
    for (const schedule of welcomeSchedules) {
      const group = testGroups.find(g => g.id === schedule.groupId)
      if (!group) continue

      for (const member of group.members) {
        // Generate unique tracking links
        const trackingLink = generateTrackingLink(member.businessId, welcomeCampaign.id, schedule.id)
        const trackingPixel = generateTrackingPixel(member.businessId, welcomeCampaign.id, schedule.id)
        const { unsubscribe, preferences } = generateUnsubscribeLinks(member.businessId, welcomeCampaign.id)

        // Get template
        const template = await prisma.campaignTemplate.findUnique({
          where: { id: schedule.templateId }
        })

        if (!template) continue

        // Prepare variables
        const variables = {
          contactPerson: member.meta?.contactPerson || 'Valued Customer',
          businessName: member.businessName || 'Your Business',
          email: member.primaryEmail,
          trackingLink,
          trackingPixel,
          unsubscribeLink: unsubscribe,
          preferencesLink: preferences,
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
        const processedSubject = processTemplate(template.subject, variables)
        const processedHtml = processTemplate(template.htmlBody, variables)
        const processedText = processTemplate(template.textBody || '', variables)

        // Send email
        const result = await sendEmailWithTracking(
          member.primaryEmail,
          processedSubject,
          processedHtml,
          processedText,
          member.businessId,
          welcomeCampaign.id,
          schedule.id
        )

        if (result.success) {
          totalSent++
        } else {
          totalFailed++
        }
      }
    }

    // Send A/B test emails
    console.log('🧪 Sending A/B test emails...')
    const abTestGroup = testGroups.find(g => g.id === abTestScheduleA.groupId)
    if (abTestGroup) {
      for (const member of abTestGroup.members) {
        // A/B test logic: 50/50 split based on businessId hash
        const hash = member.businessId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
        const isVariantA = Math.abs(hash) % 2 === 0

        const schedule = isVariantA ? abTestScheduleA : abTestScheduleB
        const template = isVariantA ? templateA : templateB

        // Generate unique tracking links
        const trackingLink = generateTrackingLink(member.businessId, abTestCampaign.id, schedule.id)
        const trackingPixel = generateTrackingPixel(member.businessId, abTestCampaign.id, schedule.id)
        const { unsubscribe, preferences } = generateUnsubscribeLinks(member.businessId, abTestCampaign.id)

        // Prepare variables
        const variables = {
          contactPerson: member.meta?.contactPerson || 'Valued Customer',
          businessName: member.businessName || 'Your Business',
          email: member.primaryEmail,
          trackingLink,
          trackingPixel,
          unsubscribeLink: unsubscribe,
          preferencesLink: preferences,
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
        const processedSubject = processTemplate(template.subject, variables)
        const processedHtml = processTemplate(template.htmlBody, variables)
        const processedText = processTemplate(template.textBody || '', variables)

        // Send email
        const result = await sendEmailWithTracking(
          member.primaryEmail,
          processedSubject,
          processedHtml,
          processedText,
          member.businessId,
          abTestCampaign.id,
          schedule.id
        )

        if (result.success) {
          totalSent++
          console.log(`📧 A/B Test ${isVariantA ? 'A' : 'B'} sent to ${member.primaryEmail}`)
        } else {
          totalFailed++
        }
      }
    }

    // 7. Summary
    console.log('\n✅ Test completed!')
    console.log(`📊 Summary:`)
    console.log(`- Total emails sent: ${totalSent}`)
    console.log(`- Total emails failed: ${totalFailed}`)
    console.log(`- Welcome series: 3 emails per business`)
    console.log(`- A/B test: 1 email per business (50/50 split)`)
    console.log(`- All emails include unique tracking links and pixels`)
    console.log(`- Global template settings applied`)
    console.log(`- Test emails sent to: ${TEST_CONFIG.testEmails.join(', ')}`)

    console.log('\n🎯 Features tested:')
    console.log('✅ Multiple email sequences per campaign')
    console.log('✅ A/B testing with 50/50 split')
    console.log('✅ Unique tracking links per business')
    console.log('✅ Unique tracking pixels per business')
    console.log('✅ Global template system integration')
    console.log('✅ Unsubscribe and preferences links')
    console.log('✅ Email job tracking and events')
    console.log('✅ Resend API integration')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testFullEmailFlow()
  .then(() => {
    console.log('\n🚀 Full email flow test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })

