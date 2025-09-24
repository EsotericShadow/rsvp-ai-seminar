import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testEmails = [
  'gabriel.lacroix94@icloud.com',
  'greenalderson@gmail.com', 
  'gabriel@evergreenwebsolutions.ca',
  'Tangible18@outlook.com'
]

const testBusinesses = [
  {
    name: 'TechFlow Solutions',
    industry: 'Technology',
    website: 'https://techflow-solutions.com',
    contactPerson: 'Gabriel Lacroix',
    phone: '+1-555-0123',
    email: 'gabriel.lacroix94@icloud.com',
    address: '123 Innovation Drive, San Francisco, CA 94105',
    description: 'Leading provider of cloud-based software solutions for enterprise clients.'
  },
  {
    name: 'Greenfield Marketing Agency',
    industry: 'Marketing',
    website: 'https://greenfield-marketing.com',
    contactPerson: 'Alex Green',
    phone: '+1-555-0456',
    email: 'greenalderson@gmail.com',
    address: '456 Marketing Blvd, New York, NY 10001',
    description: 'Full-service digital marketing agency specializing in growth strategies.'
  },
  {
    name: 'Evergreen Web Solutions',
    industry: 'Web Development',
    website: 'https://evergreenwebsolutions.ca',
    contactPerson: 'Gabriel Evergreen',
    phone: '+1-555-0789',
    email: 'gabriel@evergreenwebsolutions.ca',
    address: '789 Web Street, Toronto, ON M5V 3A8',
    description: 'Custom web development and digital transformation services.'
  },
  {
    name: 'Tangible Design Studio',
    industry: 'Design',
    website: 'https://tangibledesign.com',
    contactPerson: 'Sarah Tangible',
    phone: '+1-555-0321',
    email: 'Tangible18@outlook.com',
    address: '321 Creative Lane, Los Angeles, CA 90210',
    description: 'Award-winning design studio specializing in brand identity and user experience.'
  }
]

const testTemplates = [
  {
    name: 'Welcome Series - Tech Industry',
    subject: 'Welcome to Our Tech Community!',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Tech Community</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Tech Community!</h1>
    <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">We're excited to have you join us</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>Thank you for joining our community of innovative technology professionals. We're thrilled to have <strong>{{businessName}}</strong> as part of our network.</p>
    
    <p>As a member, you'll get access to:</p>
    <ul style="color: #555;">
      <li>Exclusive industry insights and trends</li>
      <li>Networking opportunities with like-minded professionals</li>
      <li>Early access to our latest products and services</li>
      <li>Priority support and consultation</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{trackingLink}}" style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Get Started Now</a>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>The TechFlow Team</p>
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
    textContent: `Welcome to Our Tech Community!

Hello {{contactPerson}}!

Thank you for joining our community of innovative technology professionals. We're thrilled to have {{businessName}} as part of our network.

As a member, you'll get access to:
- Exclusive industry insights and trends
- Networking opportunities with like-minded professionals  
- Early access to our latest products and services
- Priority support and consultation

Get Started: {{trackingLink}}

Best regards,
The TechFlow Team

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    industry: 'Technology'
  },
  {
    name: 'Welcome Series - Marketing Industry',
    subject: 'Welcome to Our Marketing Community!',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Marketing Community</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Marketing Community!</h1>
    <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Let's grow together</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hello {{contactPerson}}!</h2>
    <p>Welcome to our community of marketing professionals! We're excited to have <strong>{{businessName}}</strong> join our network of growth-focused agencies.</p>
    
    <p>As a member, you'll get access to:</p>
    <ul style="color: #555;">
      <li>Latest marketing trends and strategies</li>
      <li>Case studies from successful campaigns</li>
      <li>Tools and resources for better ROI</li>
      <li>Exclusive networking events</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{trackingLink}}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Explore Resources</a>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
    <p>Best regards,<br>The Marketing Team</p>
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
    textContent: `Welcome to Our Marketing Community!

Hello {{contactPerson}}!

Welcome to our community of marketing professionals! We're excited to have {{businessName}} join our network of growth-focused agencies.

As a member, you'll get access to:
- Latest marketing trends and strategies
- Case studies from successful campaigns
- Tools and resources for better ROI
- Exclusive networking events

Explore Resources: {{trackingLink}}

Best regards,
The Marketing Team

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    industry: 'Marketing'
  },
  {
    name: 'Follow-up Series - A/B Test Variant A',
    subject: 'Don\'t Miss Out - Exclusive Offer Inside!',
    htmlContent: `
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
    <p>Best regards,<br>The Team</p>
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
    textContent: `🎉 Exclusive Offer Inside!

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
The Team

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    industry: 'General'
  },
  {
    name: 'Follow-up Series - A/B Test Variant B',
    subject: 'Special Invitation for {{businessName}}',
    htmlContent: `
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
    <p>Best regards,<br>The Team</p>
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
    textContent: `You're Invited!

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
The Team

This email was sent to {{email}} because you joined our community.
Unsubscribe: {{unsubscribeLink}} | Update Preferences: {{preferencesLink}}`,
    industry: 'General'
  }
]

async function setupTestEnvironment() {
  console.log('🚀 Setting up test environment...')

  try {
    // 1. Create test audience groups
    console.log('📧 Creating test audience groups...')
    const techGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Tech Industry Test Group',
        description: 'Test audience group for technology companies',
        criteria: {
          industry: 'Technology',
          testGroup: true
        },
        meta: {
          testGroup: true,
          industry: 'Technology',
          createdBy: 'test-setup'
        }
      }
    })

    const marketingGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Marketing Industry Test Group', 
        description: 'Test audience group for marketing agencies',
        criteria: {
          industry: 'Marketing',
          testGroup: true
        },
        meta: {
          testGroup: true,
          industry: 'Marketing',
          createdBy: 'test-setup'
        }
      }
    })

    const generalGroup = await prisma.audienceGroup.create({
      data: {
        name: 'General Test Group',
        description: 'General test audience group for A/B testing',
        criteria: {
          testGroup: true
        },
        meta: {
          testGroup: true,
          industry: 'General',
          createdBy: 'test-setup'
        }
      }
    })

    // 2. Create test businesses and add to audience groups
    console.log('🏢 Creating test businesses...')
    for (let i = 0; i < testBusinesses.length; i++) {
      const business = testBusinesses[i]
      
      // Determine group based on industry
      let groupId = generalGroup.id
      if (business.industry === 'Technology') {
        groupId = techGroup.id
      } else if (business.industry === 'Marketing') {
        groupId = marketingGroup.id
      }

      // Create the business with groupId
      const createdBusiness = await prisma.audienceMember.create({
        data: {
          businessId: `test-business-${i + 1}`,
          businessName: business.name,
          primaryEmail: business.email,
          groupId: groupId,
          meta: {
            manual: true,
            testData: true,
            source: 'test-setup',
            industry: business.industry,
            website: business.website,
            contactPerson: business.contactPerson,
            phone: business.phone,
            address: business.address,
            description: business.description
          }
        }
      })
    }

    // 3. Create test email templates
    console.log('📝 Creating test email templates...')
    const templates = []
    for (const template of testTemplates) {
      const createdTemplate = await prisma.campaignTemplate.create({
        data: {
          name: template.name,
          subject: template.subject,
          htmlBody: template.htmlContent,
          textBody: template.textContent,
          meta: {
            testTemplate: true,
            industry: template.industry,
            abTestVariant: template.name.includes('Variant A') ? 'A' : 
                          template.name.includes('Variant B') ? 'B' : null,
            createdBy: 'test-setup',
            templateType: 'welcome-series'
          },
          greeting_title: `Welcome to Our ${template.industry || 'Community'}!`,
          greeting_message: `Hello {{contactPerson}}! We're excited to have {{businessName}} join our community.`,
          signature_name: 'The Team',
          signature_title: 'Community Manager',
          signature_company: 'Test Company',
          main_content_title: 'What You\'ll Get Access To',
          main_content_body: 'Exclusive insights, networking opportunities, and priority support.',
          button_text: 'Get Started',
          closing_title: 'Best regards',
          closing_message: 'We look forward to working with you!'
        }
      })
      templates.push(createdTemplate)
    }

    // 4. Create test campaigns
    console.log('📊 Creating test campaigns...')
    
    // Welcome Series Campaign
    const welcomeCampaign = await prisma.campaign.create({
      data: {
        name: 'Test Welcome Series Campaign',
        description: 'Test campaign for welcome email series',
        status: 'SCHEDULED',
        meta: {
          testCampaign: true,
          campaignType: 'welcome-series',
          createdBy: 'test-setup',
          industry: 'mixed'
        }
      }
    })

    // A/B Test Campaign
    const abTestCampaign = await prisma.campaign.create({
      data: {
        name: 'Test A/B Testing Campaign',
        description: 'Test campaign for A/B testing functionality',
        status: 'SCHEDULED',
        meta: {
          testCampaign: true,
          campaignType: 'ab-test',
          abTestEnabled: true,
          createdBy: 'test-setup',
          industry: 'general'
        }
      }
    })

    // 5. Create campaign schedules
    console.log('⏰ Creating campaign schedules...')
    
    // Welcome series schedules
    const welcomeTemplate = templates.find(t => t.name.includes('Welcome Series - Tech Industry'))
    const marketingTemplate = templates.find(t => t.name.includes('Welcome Series - Marketing Industry'))
    
    if (welcomeTemplate) {
      await prisma.campaignSchedule.create({
        data: {
          name: 'Tech Welcome Email',
          campaignId: welcomeCampaign.id,
          templateId: welcomeTemplate.id,
          groupId: techGroup.id,
          sendAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          timeZone: 'America/New_York',
          status: 'SCHEDULED',
          stepOrder: 1,
          meta: {
            testSchedule: true,
            sequence: 1
          }
        }
      })
    }

    if (marketingTemplate) {
      await prisma.campaignSchedule.create({
        data: {
          name: 'Marketing Welcome Email',
          campaignId: welcomeCampaign.id,
          templateId: marketingTemplate.id,
          groupId: marketingGroup.id,
          sendAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
          timeZone: 'America/New_York',
          status: 'SCHEDULED',
          stepOrder: 1,
          meta: {
            testSchedule: true,
            sequence: 1
          }
        }
      })
    }

    // A/B test schedules
    const variantA = templates.find(t => t.name.includes('Variant A'))
    const variantB = templates.find(t => t.name.includes('Variant B'))
    
    if (variantA && variantB) {
      // 50/50 split for A/B testing
      await prisma.campaignSchedule.create({
        data: {
          name: 'A/B Test Variant A',
          campaignId: abTestCampaign.id,
          templateId: variantA.id,
          groupId: generalGroup.id,
          sendAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          timeZone: 'America/New_York',
          status: 'SCHEDULED',
          stepOrder: 1,
          meta: {
            testSchedule: true,
            abTestVariant: 'A',
            abTestSplit: 50
          }
        }
      })

      await prisma.campaignSchedule.create({
        data: {
          name: 'A/B Test Variant B',
          campaignId: abTestCampaign.id,
          templateId: variantB.id,
          groupId: generalGroup.id,
          sendAt: new Date(Date.now() + 15 * 60 * 1000), // Same time for A/B test
          timeZone: 'America/New_York',
          status: 'SCHEDULED',
          stepOrder: 1,
          meta: {
            testSchedule: true,
            abTestVariant: 'B',
            abTestSplit: 50
          }
        }
      })
    }

    // 6. Note: Automation workflows will be created through the UI
    console.log('🤖 Automation workflows will be created through the UI...')

    console.log('✅ Test environment setup complete!')
    console.log('\n📊 Summary:')
    console.log(`- Created 3 audience groups with ${testBusinesses.length} test businesses`)
    console.log(`- Created ${templates.length} email templates`)
    console.log(`- Created 2 test campaigns`)
    console.log(`- Created 4 campaign schedules`)
    console.log('\n🎯 Test emails will be sent to:')
    testEmails.forEach(email => console.log(`  - ${email}`))
    console.log('\n⏰ Schedules:')
    console.log('  - Tech welcome emails: 5 minutes from now')
    console.log('  - Marketing welcome emails: 10 minutes from now')
    console.log('  - A/B test emails: 15 minutes from now')
    console.log('\n🤖 Automation workflows can be created through the UI')

  } catch (error) {
    console.error('❌ Error setting up test environment:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupTestEnvironment()
  .then(() => {
    console.log('\n🚀 Test environment is ready!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
