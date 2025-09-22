import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Official email template using your exact HTML
const OFFICIAL_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>TEST: Modified Template - {{subject}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        /* Reset & base */
        html,body{margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
        body{background:#f0fdf4;font-family:'Inter',system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#222;}
        img{display:block;border:0;outline:none;text-decoration:none;}
        a{color:#10b981;text-decoration:none;}
        
        /* Wrapper */
        .evergreen-wrapper{width:100%;max-width:640px;margin:40px auto;box-sizing:border-box;padding:0;}
        .evergreen-table{width:100%;border-collapse:collapse;box-shadow:0 20px 48px rgba(16,185,129,0.15);border-radius:12px;overflow:hidden;background:#fff;}
        
        /* Typography */
        h1,h2,h3,h4,p{margin:0 0 12px 0;padding:0;line-height:1.3;}
        h1{font-size:28px;color:#10b981;font-weight:700;}
        h2{font-size:20px;color:#047857;font-weight:600;}
        h3{font-size:18px;color:#047857;font-weight:600;}
        p{font-size:16px;color:#374151;margin-bottom:12px;}
        
        /* Header / logo */
        .evergreen-header{padding:24px;text-align:center;}
        .evergreen-logo{width:72px;height:72px;margin:8px auto;border-radius:50%;background:linear-gradient(135deg,#10b981 0%,#059669 100%);position:relative;display:inline-block;}
        .evergreen-logo::before{content:"🌲";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:34px;}
        
        /* HERO nested table */
        .hero-inner{width:100%;border-radius:8px;overflow:hidden;}
        .hero-left{width:8px;background:#10b981;vertical-align:top;}
        .hero-right{vertical-align:middle;padding:18px 16px;background-color:#e6f9ef; /* fallback */ background-color:rgba(16,185,129,0.06); border-radius:0 8px 8px 0;}
        .hero-title{font-size:20px;color:#065f46;font-weight:700;margin-bottom:6px;}
        .hero-sub{font-size:14px;color:#065f46;margin:0;}
        
        /* Content blocks */
        .content-cell{padding:18px 24px;}
        .evergreen-signature{background:#f0fdf4;padding:14px;border-radius:8px;border-left:4px solid #10b981;margin:14px 0;}
        .btn{display:inline-block;padding:12px 28px;border-radius:10px;font-weight:700;color:#fff !important;background:linear-gradient(135deg,#10b981 0%,#059669 100%);text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.3);}
        
        /* Event details section */
        .event-details{background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;}
        .event-details h3{color:#1e293b;margin-bottom:8px;}
        .event-details p{margin-bottom:4px;color:#475569;}
        
        /* Divider & footer */
        .divider{border-top:1px solid #f0fdf4;margin:16px 0;}
        .footer{padding:12px 24px 28px 24px;text-align:center;color:#6b7280;font-size:13px;}
        .social-link{display:inline-flex;align-items:center;gap:8px;margin:6px 10px;text-decoration:none;color:#065f46;font-weight:600;}
        .social-icon-bg{display:inline-block;width:36px;height:36px;border-radius:8px;vertical-align:middle;flex:0 0 36px;display:inline-flex;align-items:center;justify-content:center;}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        
        @media (max-width:480px){
            h1{font-size:22px;}
            .hero-title{font-size:18px;}
            .content-cell{padding:12px 16px;}
            .evergreen-wrapper{margin:16px auto;}
            .social-link{display:block;padding:8px 0;}
        }
    </style>
</head>
<body>
    <div class="evergreen-wrapper">
        <table class="evergreen-table" role="presentation" cellpadding="0" cellspacing="0" aria-hidden="false">
            <tbody>
                <!-- Header -->
                <tr>
                    <td class="evergreen-header" style="padding-top:22px;padding-bottom:8px;">
                        <h1 style="margin-bottom:6px;">{{subject}}</h1>
                        <div class="evergreen-logo" aria-hidden="true"></div>
                    </td>
                </tr>
                
                <!-- HERO (vertical bar + translucent fill) -->
                <tr>
                    <td style="padding:0 24px 0 24px;">
                        <table class="hero-inner" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                            <tr>
                                <td class="hero-left" width="8" style="background:#10b981;"></td>
                                <td class="hero-right" style="background-color:#e6f9ef; background-color:rgba(16,185,129,0.06);">
                                    <div>
                                        <div class="hero-title">{{global_hero_title}}</div>
                                        <p class="hero-sub">{{global_hero_message}}</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Greeting Title -->
                <tr>
                    <td class="content-cell" style="padding-top:16px;">
                        <h2>{{greeting_title}}</h2>
                    </td>
                </tr>
                
                <!-- Main content title + body -->
                <tr>
                    <td class="content-cell">
                        <h2 style="margin-top:0;">{{main_content_title}}</h2>
                        <p style="margin-top:6px;margin-bottom:12px;">{{main_content_body}}</p>
                    </td>
                </tr>
                
                <!-- Button -->
                <tr>
                    <td class="content-cell" style="text-align:center;padding-bottom:12px;">
                        <a href="{{button_link}}" target="_blank" class="btn" style="display:inline-block;">{{button_text}}</a>
                    </td>
                </tr>
                
                <!-- Event Details -->
                <tr>
                    <td class="content-cell">
                        <div class="event-details">
                            <h3>{{global_event_title}}</h3>
                            <p><strong>Date:</strong> {{global_event_date}}</p>
                            <p><strong>Time:</strong> {{global_event_time}}</p>
                            <p><strong>Location:</strong> {{global_event_location}}</p>
                            <p><strong>Cost:</strong> {{global_event_cost}}</p>
                            <p><strong>Includes:</strong> {{global_event_includes}}</p>
                        </div>
                    </td>
                </tr>
                
                <!-- Additional info -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">{{additional_info_title}}</h3>
                        <p>{{additional_info_body}}</p>
                    </td>
                </tr>
                
                <!-- Signature block (uses global signature variables) -->
                <tr>
                    <td class="content-cell">
                        <div class="evergreen-signature">
                            <p style="margin:0;"><strong>{{global_signature_name}}</strong><br>
                            {{global_signature_title}}<br>
                            {{global_signature_company}}<br>
                            {{global_signature_location}}</p>
                        </div>
                    </td>
                </tr>
                
                <!-- Closing -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">{{closing_title}}</h3>
                        <p style="margin-bottom:6px;">{{closing_message}}</p>
                    </td>
                </tr>
                
                <!-- Divider and footer with unsubscribe (VISIBLE) -->
                <tr>
                    <td style="padding:12px 24px 18px 24px;">
                        <div class="divider"></div>
                        <div class="footer" role="contentinfo" aria-label="Footer">
                            <div style="margin-bottom:8px;">© 2025 Gabriel Lacroix - Evergreen Web Solutions, Terrace BC</div>
                            
                            <!-- Social links: LinkedIn / Facebook / X (label + icon) -->
                            <div style="margin-bottom:12px; text-align:center;">
                                <!-- LinkedIn -->
                                <a href="https://www.linkedin.com/in/gabriel-marko-6b7aaa357/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn – opens in a new tab">
                                    <span class="social-icon-bg" style="background:#0A66C2;">
                                        <!-- LinkedIn SVG -->
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                                            <path fill="#ffffff" d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6 1.11 6 .01 4.88.01 3.5S1.11 1 2.49 1C3.87 1 4.98 2.12 4.98 3.5zM.22 8.5h4.54v13H.22v-13zM8.5 8.5h4.36v1.77h.06c.61-1.16 2.1-2.38 4.32-2.38 4.63 0 5.48 3.05 5.48 7.01v8.6h-4.54v-7.61c0-1.82-.03-4.17-2.54-4.17-2.54 0-2.93 1.98-2.93 4.03v7.75H8.5v-13z"/>
                                        </svg>
                                    </span>
                                    <span>LinkedIn</span>
                                </a>
                                
                                <!-- Facebook -->
                                <a href="https://www.facebook.com/share/14Exmoytvrs/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook – opens in a new tab">
                                    <span class="social-icon-bg" style="background:#1877F2;">
                                        <!-- Facebook SVG -->
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                                            <path fill="#ffffff" d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2V12h2.2V9.7c0-2.2 1.3-3.4 3.2-3.4.9 0 1.8.16 1.8.16v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.37 2.9h-1.93v7A10 10 0 0 0 22 12z"/>
                                        </svg>
                                    </span>
                                    <span>Facebook</span>
                                </a>
                                
                                <!-- X -->
                                <a href="https://x.com/Evergreenweb3D" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X (Twitter) – opens in a new tab">
                                    <span class="social-icon-bg" style="background:#000000;">
                                        <!-- X SVG -->
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                                            <path fill="#ffffff" d="M22 5.92c-.64.28-1.33.47-2.05.55a3.6 3.6 0 0 0-6.14 2.6v.5A10.2 10.2 0 0 1 3.16 5.15a3.6 3.6 0 0 0 1.12 4.8c-.52 0-1.01-.16-1.44-.4v.04c0 1.57 1.12 2.88 2.6 3.18a3.6 3.6 0 0 1-1.44.05c.41 1.27 1.6 2.2 3.02 2.22A7.22 7.22 0 0 1 2 19.54 10.2 10.2 0 0 0 7.78 21c6.26 0 9.69-5.18 9.69-9.67v-.44c.66-.48 1.23-1.1 1.7-1.8-.6.28-1.25.48-1.93.58z"/>
                                        </svg>
                                    </span>
                                    <span>X</span>
                                </a>
                            </div>
                            
                            <!-- Visible unsubscribe text (required & obvious) -->
                            <div style="font-size:13px;color:#6b7280;">
                                If you no longer wish to receive these emails, <a href="{{unsubscribe_link}}" style="color:#065f46;font-weight:600;" target="_blank" rel="noopener noreferrer">unsubscribe here</a>.
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`

// Text version of the email
const OFFICIAL_TEXT_TEMPLATE = `{{subject}}

{{global_hero_title}}
{{global_hero_message}}

{{greeting_title}}

{{main_content_title}}
{{main_content_body}}

{{button_text}}: {{button_link}}

{{global_event_title}}
Date: {{global_event_date}}
Time: {{global_event_time}}
Location: {{global_event_location}}
Cost: {{global_event_cost}}
Includes: {{global_event_includes}}

{{additional_info_title}}
{{additional_info_body}}

{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}
{{global_signature_location}}

{{closing_title}}
{{closing_message}}

© 2025 Gabriel Lacroix - Evergreen Web Solutions, Terrace BC

LinkedIn: https://www.linkedin.com/in/gabriel-marko-6b7aaa357/
Facebook: https://www.facebook.com/share/14Exmoytvrs/?mibextid=wwXIfr
X: https://x.com/Evergreenweb3D

If you no longer wish to receive these emails, unsubscribe here: {{unsubscribe_link}}`

async function sendOfficialTestEmail() {
  console.log('📤 Sending properly processed official test email...')

  try {
    // Get the test member
    const testMember = await prisma.audienceMember.findFirst({
      where: { primaryEmail: 'gabriel.lacroix94@icloud.com' }
    })

    if (!testMember) {
      throw new Error('Test member not found')
    }

    // Get the campaign and schedule
    const campaign = await prisma.campaign.findFirst({
      where: { meta: { path: ['official'], equals: true } }
    })

    if (!campaign) {
      throw new Error('Official campaign not found')
    }

    const schedule = await prisma.campaignSchedule.findFirst({
      where: { campaignId: campaign.id }
    })

    if (!schedule) {
      throw new Error('Campaign schedule not found')
    }

    // Generate proper tracking links
    const baseUrl = process.env.CAMPAIGN_LINK_BASE || 'https://rsvp.evergreenwebsolutions.ca'
    const rsvpLink = `${baseUrl}/rsvp?eid=biz_${testMember.businessId}&campaign=${campaign.id}&schedule=${schedule.id}`
    const unsubscribeLink = `${baseUrl}/unsubscribe?email=${testMember.primaryEmail}&business=${testMember.businessId}&campaign=${campaign.id}`
    const trackingPixel = `${baseUrl}/api/__pixel?token=${testMember.businessId}&eid=biz_${testMember.businessId}`

    // Prepare ALL template variables
    const variables = {
      // Basic variables
      subject: 'Free AI Tools Session - October 23rd',
      contactPerson: testMember.meta?.contactPerson || 'Valued Customer',
      businessName: testMember.businessName || 'Your Business',
      business_id: testMember.businessId,
      invite_link: rsvpLink,
      button_link: rsvpLink,
      unsubscribe_link: unsubscribeLink,
      tracking_pixel: trackingPixel,
      
        // Template content variables (no event details - handled by global template)
        greeting_title: 'Hello!',
        main_content_title: 'What You\'ll Learn',
        main_content_body: 'We\'ll cover practical AI tools that can help streamline your business operations, including spreadsheet automation, data analysis, and process optimization. All tools discussed are immediately actionable and cost-effective.',
        additional_info_title: 'Why This Matters',
        additional_info_body: 'These AI tools can save your business hours of manual work each week, giving you more time to focus on growing your business and serving your customers better.',
        closing_title: 'Looking Forward',
        closing_message: 'We\'re excited to share these practical AI solutions with you and help your business grow.',
        button_text: 'RSVP for Free Session',
      
      // Global template variables
      global_hero_title: 'Evergreen Web Solutions - Informational Event Invitation',
      global_hero_message: 'Please RSVP at your earliest convenience!',
      global_signature_name: 'Gabriel Lacroix',
      global_signature_title: 'AI Solutions Expert',
      global_signature_company: 'Evergreen Web Solutions',
      global_signature_location: 'Terrace, BC',
      global_event_title: 'Event Details',
      global_event_date: 'October 23rd 2025',
      global_event_time: '5:00 PM - 7:00 PM',
      global_event_location: 'Sunshine Inn - Terrace, BC',
      global_event_cost: 'Free',
      global_event_includes: 'Coffee, refreshments, networking, and actionable AI insights'
    }

    // Process template with ALL variables
    let processedHtml = OFFICIAL_EMAIL_TEMPLATE
    let processedText = OFFICIAL_TEXT_TEMPLATE
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processedHtml = processedHtml.replace(regex, String(value))
      processedText = processedText.replace(regex, String(value))
    })

    // Send test email
    const result = await resend.emails.send({
      from: process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <gabriel.lacroix94@icloud.com>',
      to: [testMember.primaryEmail],
      subject: variables.subject,
      html: processedHtml,
      text: processedText,
      headers: {
        'X-Campaign-ID': campaign.id,
        'X-Schedule-ID': schedule.id,
        'X-Business-ID': testMember.businessId,
        'X-Official-Test': 'true'
      }
    })

    console.log(`✅ Properly processed test email sent to ${testMember.primaryEmail}`)
    console.log(`🔗 RSVP Link: ${rsvpLink}`)
    console.log(`📧 Message ID: ${result.data?.id}`)
    
    console.log('\n📋 Email should now show:')
    console.log('- Proper greeting: "Hello Sarah!"')
    console.log('- Proper content: "What You\'ll Learn"')
    console.log('- Proper body text about AI tools')
    console.log('- Proper button: "RSVP for Free Session"')
    console.log('- Proper event details with all info')
    console.log('- Proper signature: "Gabriel Lacroix"')
    console.log('- Proper closing: "Looking Forward"')

  } catch (error) {
    console.error('❌ Failed to send properly processed email:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
sendOfficialTestEmail()
  .then(() => {
    console.log('\n✅ Properly processed test email sent successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
