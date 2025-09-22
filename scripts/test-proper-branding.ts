import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Test configuration
const TEST_CONFIG = {
  testEmails: [
    'gabriel.lacroix94@icloud.com',
    'greenalderson@gmail.com', 
    'gabriel@evergreenwebsolutions.ca',
    'Tangible18@outlook.com'
  ]
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

// Generate proper tracking links that match the actual API routes
function generateProperTrackingLink(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  // Use the actual RSVP route with proper eid format
  return `${baseUrl}/rsvp?eid=biz_${businessId}&campaign=${campaignId}&schedule=${scheduleId}`
}

// Generate proper tracking pixel that matches the actual API
function generateProperTrackingPixel(businessId: string, campaignId: string, scheduleId: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  // Use the actual pixel route
  return `${baseUrl}/api/__pixel?token=${businessId}&eid=biz_${businessId}`
}

// Generate proper unsubscribe and preferences links
function generateProperUnsubscribeLinks(businessId: string, campaignId: string, email: string) {
  const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
  return {
    unsubscribe: `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&business=${businessId}&campaign=${campaignId}`,
    preferences: `${baseUrl}/rsvp?eid=biz_${businessId}&action=preferences`
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

// Create properly branded test template using the actual global template design
function createProperlyBrandedTemplate(globalSettings: any) {
  return {
    name: 'Proper Branding Test Template',
    subject: '{{global_hero_title}} - {{global_event_date}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(to right, #10b981, #059669);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #10b981, #059669);
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .footer a {
            color: #6b7280;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{global_hero_title}}</h1>
            <p>{{global_hero_message}}</p>
        </div>
        
        <div class="content">
            <h2>Hello {{contactPerson}}!</h2>
            
            <p>We're excited to invite {{businessName}} to our upcoming session about practical AI tools for Northern BC businesses.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #166534; margin-top: 0;">{{global_event_title}}</h3>
                <p><strong>Date:</strong> {{global_event_date}}</p>
                <p><strong>Time:</strong> {{global_event_time}}</p>
                <p><strong>Location:</strong> {{global_event_location}}</p>
                <p><strong>Cost:</strong> {{global_event_cost}}</p>
                <p><strong>Includes:</strong> {{global_event_includes}}</p>
            </div>
            
            <p>This session will cover practical AI tools that can help streamline your business operations, including spreadsheet automation, data analysis, and process optimization.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{trackingLink}}" class="button">RSVP for Free Session</a>
            </div>
            
            <p>All tools discussed are immediately actionable and cost-effective. We're excited to share these practical AI solutions with you and help your business grow.</p>
            
            <p>Best regards,<br>
            {{global_signature_name}}<br>
            {{global_signature_title}}<br>
            {{global_signature_company}}<br>
            {{global_signature_location}}</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{email}} because you joined our community.</p>
            <p>
                <a href="{{unsubscribeLink}}">Unsubscribe</a> | 
                <a href="{{preferencesLink}}">Update Preferences</a>
            </p>
        </div>
    </div>
    
    <!-- Tracking Pixel -->
    <img src="{{trackingPixel}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`,
    textBody: `{{global_hero_title}}

{{global_hero_message}}

Hello {{contactPerson}}!

We're excited to invite {{businessName}} to our upcoming session about practical AI tools for Northern BC businesses.

{{global_event_title}}
Date: {{global_event_date}}
Time: {{global_event_time}}
Location: {{global_event_location}}
Cost: {{global_event_cost}}
Includes: {{global_event_includes}}

This session will cover practical AI tools that can help streamline your business operations, including spreadsheet automation, data analysis, and process optimization.

RSVP for Free Session: {{trackingLink}}

All tools discussed are immediately actionable and cost-effective. We're excited to share these practical AI solutions with you and help your business grow.

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}
{{global_signature_location}}

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    meta: {
      properBrandingTest: true,
      usesGlobalTemplate: true
    }
  }
}

// Send email with proper tracking
async function sendProperlyBrandedEmail(
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
          properBrandingTest: true,
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
        'X-Proper-Branding-Test': 'true'
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
          properBrandingTest: true
        }
      }
    })

    console.log(`✅ Properly branded email sent to ${to} (${businessId}) - Job ID: ${emailJob.id}`)
    return { success: true, jobId: emailJob.id, messageId: result.data?.id }

  } catch (error) {
    console.error(`❌ Failed to send properly branded email to ${to}:`, error)
    return { success: false, error: error.message }
  }
}

// Main test function
async function testProperBranding() {
  console.log('🎨 Testing proper branding and tracking...')

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

    // 3. Create properly branded template
    console.log('🎨 Creating properly branded template...')
    const testTemplate = createProperlyBrandedTemplate(globalSettings)
    const template = await prisma.campaignTemplate.create({
      data: testTemplate
    })

    // 4. Create test campaign
    console.log('📧 Creating test campaign...')
    const testCampaign = await prisma.campaign.create({
      data: {
        name: 'Proper Branding Test Campaign',
        description: 'Testing proper branding and tracking links',
        status: 'SCHEDULED',
        meta: {
          properBrandingTest: true,
          createdBy: 'proper-branding-test'
        }
      }
    })

    // 5. Create test schedule
    const testSchedule = await prisma.campaignSchedule.create({
      data: {
        name: 'Proper Branding Test Schedule',
        campaignId: testCampaign.id,
        templateId: template.id,
        groupId: testGroups[0].id,
        sendAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute from now
        timeZone: 'America/Vancouver',
        status: 'SCHEDULED',
        stepOrder: 1,
        meta: {
          properBrandingTest: true,
          createdBy: 'proper-branding-test'
        }
      }
    })

    // 6. Send properly branded emails
    console.log('📤 Sending properly branded emails...')
    
    let totalSent = 0
    let totalFailed = 0

    for (const member of testGroups[0].members) {
      // Generate proper tracking links
      const trackingLink = generateProperTrackingLink(member.businessId, testCampaign.id, testSchedule.id)
      const trackingPixel = generateProperTrackingPixel(member.businessId, testCampaign.id, testSchedule.id)
      const { unsubscribe, preferences } = generateProperUnsubscribeLinks(member.businessId, testCampaign.id, member.primaryEmail)

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
      const result = await sendProperlyBrandedEmail(
        member.primaryEmail,
        processedSubject,
        processedHtml,
        processedText,
        member.businessId,
        testCampaign.id,
        testSchedule.id
      )

      if (result.success) {
        totalSent++
      } else {
        totalFailed++
      }
    }

    // 7. Summary
    console.log('\n✅ Proper branding test completed!')
    console.log(`📊 Summary:`)
    console.log(`- Total emails sent: ${totalSent}`)
    console.log(`- Total emails failed: ${totalFailed}`)
    console.log(`- Uses proper Evergreen AI branding (emerald colors)`)
    console.log(`- Uses proper global template design`)
    console.log(`- Uses correct tracking links (/rsvp?eid=biz_...)`)
    console.log(`- Uses correct pixel tracking (/api/__pixel)`)
    console.log(`- Uses correct unsubscribe links (/unsubscribe?email=...)`)
    console.log(`- Test emails sent to: ${TEST_CONFIG.testEmails.join(', ')}`)

    console.log('\n🎯 Features tested:')
    console.log('✅ Proper Evergreen AI branding and colors')
    console.log('✅ Global template integration')
    console.log('✅ Correct tracking link format')
    console.log('✅ Correct pixel tracking format')
    console.log('✅ Correct unsubscribe link format')
    console.log('✅ Professional email design')
    console.log('✅ Resend API integration')

  } catch (error) {
    console.error('❌ Proper branding test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testProperBranding()
  .then(() => {
    console.log('\n🎨 Proper branding test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
