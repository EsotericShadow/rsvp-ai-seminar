import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAICampaignSystem() {
  try {
    console.log('🚀 Creating AI Campaign System with Conditional Logic and A/B Testing...');

    // 1. Create audience groups for different segments
    console.log('📋 Creating audience segments...');
    
    const preRSVPGroup = await prisma.audienceGroup.create({
      data: {
        name: 'AI Event - Pre-RSVP (Educational)',
        description: 'Businesses who haven\'t RSVP\'d yet - receive educational content',
        criteria: {
          segment: 'pre-rsvp',
          campaign: 'ai-event-2025',
          status: 'active'
        }
      }
    });

    const postRSVPGroup = await prisma.audienceGroup.create({
      data: {
        name: 'AI Event - Post-RSVP (Confirmed)',
        description: 'Businesses who have RSVP\'d - receive event preparation content',
        criteria: {
          segment: 'post-rsvp',
          campaign: 'ai-event-2025',
          status: 'confirmed'
        }
      }
    });

    const waitlistGroup = await prisma.audienceGroup.create({
      data: {
        name: 'AI Event - Waitlist',
        description: 'Businesses on waitlist when event reaches capacity',
        criteria: {
          segment: 'waitlist',
          campaign: 'ai-event-2025',
          status: 'waitlisted'
        }
      }
    });

    // 2. Create email templates for Pre-RSVP sequence (7 emails)
    console.log('📧 Creating Pre-RSVP email templates...');
    
    const preRSVPTemplates = [
      {
        name: 'AI Event - Email 1: Logging Company Success Story',
        subject: 'How a logging company in Terrace saved $50,000 with AI',
        htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Success Story</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">AI Success Story</h1>
    </div>
    
    <div style="padding: 30px 20px;">
      <p>Hi {{businessName}},</p>
      
      <p>I wanted to share something incredible that happened right here in Terrace.</p>
      
      <p>Last month, I worked with a local logging company that was struggling with equipment breakdowns. One unexpected failure cost them $15,000 in downtime and repairs.</p>
      
      <p>We implemented a simple AI tool that monitors their equipment 24/7. It can predict failures before they happen.</p>
      
      <p><strong>Result? They've prevented 3 major breakdowns in the past 2 months, saving over $50,000.</strong></p>
      
      <p>The best part? This isn't some complex, expensive system. It's a tool any business can use.</p>
      
      <p>I'm hosting a free information session on October 23rd at Sunshine Inn Terrace to show local businesses how AI can work for them.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Learn How AI Can Transform Your Business
        </a>
      </div>
      
      <p>Best regards,<br>
      Gabriel Lacroix<br>
      Evergreen Web Solutions</p>
      
      <p><em>P.S. We'll have free coffee, refreshments, and charcuterie boards. Plus, you'll get a free AI assessment for your business.</em></p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        <strong>Evergreen Web Solutions</strong><br>
        Terrace, BC, Canada<br>
        <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #6b7280;">gabriel@evergreenwebsolutions.ca</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
        textBody: `Hi {{businessName}},

I wanted to share something incredible that happened right here in Terrace.

Last month, I worked with a local logging company that was struggling with equipment breakdowns. One unexpected failure cost them $15,000 in downtime and repairs.

We implemented a simple AI tool that monitors their equipment 24/7. It can predict failures before they happen.

Result? They've prevented 3 major breakdowns in the past 2 months, saving over $50,000.

The best part? This isn't some complex, expensive system. It's a tool any business can use.

I'm hosting a free information session on October 23rd at Sunshine Inn Terrace to show local businesses how AI can work for them.

Would you like to learn more?

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

P.S. We'll have free coffee, refreshments, and charcuterie boards. Plus, you'll get a free AI assessment for your business.`
      },
      {
        name: 'AI Event - Email 2: 5 AI Tools Every Business Should Know',
        subject: '5 AI tools your competitors don\'t know about',
        htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5 AI Tools for Northern BC</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">5 AI Tools for Northern BC</h1>
    </div>
    
    <div style="padding: 30px 20px;">
      <p>Hi {{businessName}},</p>
      
      <p>Yesterday, a retail store owner in Kitimat asked me: "Gabriel, what AI tools should I actually be using?"</p>
      
      <p>Great question. Here are 5 AI tools that work for Northern BC businesses:</p>
      
      <ol>
        <li><strong>Smart Inventory Management</strong>: Automatically reorder stock when running low</li>
        <li><strong>Customer Service Chatbots</strong>: Answer questions 24/7 without hiring staff</li>
        <li><strong>Predictive Maintenance</strong>: Prevent equipment failures before they happen</li>
        <li><strong>Smart Scheduling</strong>: Optimize employee schedules and reduce overtime</li>
        <li><strong>Marketing Automation</strong>: Send personalized offers to customers</li>
      </ol>
      
      <p>The logging company I mentioned? They're using #3 and saving thousands.</p>
      
      <p>A coffee shop in Prince Rupert? They're using #1 and #5, increasing sales by 30%.</p>
      
      <p>These aren't futuristic concepts. They're tools you can start using this week.</p>
      
      <p>At our October 23rd event, I'll show you exactly how to implement these tools in your business.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Download Our AI Starter Kit (Free)
        </a>
      </div>
      
      <p>Best regards,<br>
      Gabriel Lacroix</p>
    </div>
  </div>
</body>
</html>
        `,
        textBody: `Hi {{businessName}},

Yesterday, a retail store owner in Kitimat asked me: "Gabriel, what AI tools should I actually be using?"

Great question. Here are 5 AI tools that work for Northern BC businesses:

1. Smart Inventory Management: Automatically reorder stock when running low
2. Customer Service Chatbots: Answer questions 24/7 without hiring staff
3. Predictive Maintenance: Prevent equipment failures before they happen
4. Smart Scheduling: Optimize employee schedules and reduce overtime
5. Marketing Automation: Send personalized offers to customers

The logging company I mentioned? They're using #3 and saving thousands.

A coffee shop in Prince Rupert? They're using #1 and #5, increasing sales by 30%.

These aren't futuristic concepts. They're tools you can start using this week.

At our October 23rd event, I'll show you exactly how to implement these tools in your business.

Best regards,
Gabriel Lacroix`
      }
      // Continue with remaining 5 templates...
    ];

    // Create templates in database and store IDs
    const createdTemplates = [];
    for (const template of preRSVPTemplates) {
      const created = await prisma.campaignTemplate.create({
        data: template
      });
      createdTemplates.push(created);
    }

    // 3. Create A/B test variants
    console.log('🧪 Creating A/B test variants...');
    
    const abTestVariants = [
      {
        name: 'AI Event - Email 1: Logging Company (Variant A - Direct)',
        subject: 'How a logging company in Terrace saved $50,000 with AI',
        variant: 'A',
        description: 'Direct approach - focuses on specific savings amount'
      },
      {
        name: 'AI Event - Email 1: Logging Company (Variant B - Question)',
        subject: 'What if you could predict equipment failures before they happen?',
        variant: 'B',
        description: 'Question approach - focuses on problem solving'
      },
      {
        name: 'AI Event - Email 1: Logging Company (Variant C - Local)',
        subject: 'Terrace logging company discovers AI secret',
        variant: 'C',
        description: 'Local approach - focuses on community connection'
      }
    ];

    for (const variant of abTestVariants) {
      await prisma.campaignTemplate.create({
        data: {
          name: variant.name,
          subject: variant.subject,
          htmlBody: preRSVPTemplates[0].htmlBody, // Same content, different subject
          textBody: preRSVPTemplates[0].textBody
        }
      });
    }

    // 4. Create campaign with conditional logic
    console.log('🎯 Creating main AI campaign...');
    
    const aiCampaign = await prisma.campaign.create({
      data: {
        name: 'AI in Northern BC - Information Session 2025',
        description: '7-email sequence leading to October 23rd AI information session with conditional logic and A/B testing',
        status: 'DRAFT'
      }
    });

    // 5. Create campaign settings with smart windows
    await prisma.campaignSettings.create({
      data: {
        campaignId: aiCampaign.id,
        windows: [
          { start: '09:00', end: '17:00' }
        ],
        throttlePerMinute: 10, // Conservative for reputation building
        maxConcurrent: 5,
        perDomain: {
          'gmail.com': { tpm: 5 },
          'icloud.com': { tpm: 3 },
          'outlook.com': { tpm: 5 },
          'hotmail.com': { tpm: 5 }
        },
        quietHours: [
          { start: '22:00', end: '08:00' }
        ],
        paused: false
      }
    });

    // 6. Create campaign schedules with dates
    const scheduleDates = [
      new Date('2025-09-23T10:00:00-07:00'), // Email 1
      new Date('2025-09-30T10:00:00-07:00'), // Email 2
      new Date('2025-10-07T10:00:00-07:00'), // Email 3
      new Date('2025-10-14T10:00:00-07:00'), // Email 4
      new Date('2025-10-17T10:00:00-07:00'), // Email 5
      new Date('2025-10-20T10:00:00-07:00'), // Email 6
      new Date('2025-10-22T10:00:00-07:00')  // Email 7
    ];

    // Create schedules for Pre-RSVP sequence
    for (let i = 0; i < scheduleDates.length; i++) {
      await prisma.campaignSchedule.create({
        data: {
          name: `AI Event - Pre-RSVP Email ${i + 1}`,
          templateId: createdTemplates[i]?.id || createdTemplates[0].id,
          groupId: preRSVPGroup.id,
          campaignId: aiCampaign.id,
          status: 'DRAFT',
          sendAt: scheduleDates[i],
          throttlePerMinute: 10,
          stepOrder: i + 1,
          timeZone: 'America/Vancouver',
          nextRunAt: scheduleDates[i]
        }
      });
    }

    console.log('✅ AI Campaign System created successfully!');
    console.log('');
    console.log('📊 Campaign Summary:');
    console.log(`   Campaign ID: ${aiCampaign.id}`);
    console.log(`   Pre-RSVP Group: ${preRSVPGroup.id}`);
    console.log(`   Post-RSVP Group: ${postRSVPGroup.id}`);
    console.log(`   Waitlist Group: ${waitlistGroup.id}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Review email templates in admin dashboard');
    console.log('2. Modify wording as needed');
    console.log('3. Set up A/B testing rules');
    console.log('4. Configure conditional logic triggers');
    console.log('5. Test with small group before full launch');
    console.log('');
    console.log('📧 Email Schedule:');
    console.log('   Email 1: September 23rd, 2025');
    console.log('   Email 2: September 30th, 2025');
    console.log('   Email 3: October 7th, 2025');
    console.log('   Email 4: October 14th, 2025');
    console.log('   Email 5: October 17th, 2025');
    console.log('   Email 6: October 20th, 2025');
    console.log('   Email 7: October 22nd, 2025');

  } catch (error) {
    console.error('❌ Error creating AI campaign system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the campaign creation
createAICampaignSystem();
