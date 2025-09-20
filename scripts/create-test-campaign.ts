import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestCampaign() {
  try {
    console.log('🚀 Creating test campaign with all features...');

    // 1. Create test audience group
    console.log('📋 Creating test audience group...');
    const testGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Test Email Recipients',
        description: 'Test recipients for email campaign testing',
        criteria: {
          testGroup: true,
          emails: ['gabriel.lacroix94@icloud.com', 'greenalderson@gmail.com']
        }
      }
    });

    // 2. Add test members to the group
    console.log('👥 Adding test members...');
    await prisma.audienceMember.createMany({
      data: [
        {
          groupId: testGroup.id,
          businessId: 'test-business-1',
          businessName: 'Gabriel Lacroix Test Business',
          primaryEmail: 'gabriel.lacroix94@icloud.com',
          tagsSnapshot: ['test', 'terrace', 'ai-services'],
          meta: { 
            testMember: true,
            businessType: 'Technology Services',
            location: 'Terrace, BC'
          }
        },
        {
          groupId: testGroup.id,
          businessId: 'test-business-2',
          businessName: 'Green Alderson Consulting',
          primaryEmail: 'greenalderson@gmail.com',
          tagsSnapshot: ['test', 'terrace', 'consulting'],
          meta: { 
            testMember: true,
            businessType: 'Business Consulting',
            location: 'Terrace, BC'
          }
        }
      ]
    });

    // 3. Create test email template
    console.log('📧 Creating test email template...');
    const testTemplate = await prisma.campaignTemplate.create({
      data: {
        name: 'Test Campaign Email',
        subject: 'Test: AI in Northern BC - Campaign System Test',
        htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign System Test</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">🧪 Campaign System Test</h1>
      <p style="color: white; margin: 5px 0 0 0;">Testing all email features</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 20px;">
      <h2 style="color: #1f2937;">Test Email Features</h2>
      <p>Hello from Evergreen Web Solutions,</p>
      <p>This is a test email to verify all campaign system features are working correctly for your business: <strong>{{businessName}}</strong>.</p>
      
      <!-- Test Features -->
      <div style="background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #10b981; margin-top: 0;">✅ Features Being Tested</h3>
        <ul style="color: #374151; padding-left: 20px;">
          <li><strong>Smart Windows:</strong> Time-based sending optimization</li>
          <li><strong>Throttling:</strong> Rate limiting for deliverability</li>
          <li><strong>Template Rendering:</strong> Dynamic content insertion</li>
          <li><strong>SendGrid Integration:</strong> Professional email delivery</li>
          <li><strong>Tracking:</strong> Open and click monitoring</li>
          <li><strong>Bounce Handling:</strong> Failed email management</li>
        </ul>
      </div>
      
      <!-- Test Data -->
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #92400e; margin-top: 0;">📊 Test Data</h3>
        <p><strong>Business:</strong> {{businessName}}</p>
        <p><strong>Email:</strong> {{primaryEmail}}</p>
        <p><strong>Business Type:</strong> {{meta.businessType}}</p>
        <p><strong>Location:</strong> {{meta.location}}</p>
        <p><strong>Campaign ID:</strong> {{campaignId}}</p>
        <p><strong>Sent At:</strong> {{sentAt}}</p>
      </div>
      
      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
          🎯 Visit RSVP Site
        </a>
        <a href="mailto:gabriel@evergreenwebsolutions.ca" 
           style="background-color: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
          📧 Reply to Test
        </a>
      </div>
      
      <p style="color: #374151; font-size: 14px;">
        This is a test email sent at {{timestamp}} to verify the campaign system is working correctly.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
        <strong>Evergreen Web Solutions</strong><br>
        Terrace, BC, Canada<br>
        Campaign System Test
      </p>
      <p style="font-size: 12px; color: #6b7280; margin: 15px 0 5px 0;">
        <a href="mailto:unsubscribe@evergreenwebsolutions.ca" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
        <a href="https://rsvp.evergreenwebsolutions.ca/privacy" style="color: #6b7280; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
        textBody: `
Campaign System Test - AI in Northern BC

Hi {{firstName}},

This is a test email to verify all campaign system features are working correctly.

FEATURES BEING TESTED:
- Smart Windows: Time-based sending optimization
- Throttling: Rate limiting for deliverability  
- Template Rendering: Dynamic content insertion
- SendGrid Integration: Professional email delivery
- Tracking: Open and click monitoring
- Bounce Handling: Failed email management

TEST DATA:
Business: {{businessName}}
Email: {{email}}
Phone: {{phone}}
Campaign ID: {{campaignId}}
Sent At: {{sentAt}}

This is a test email sent at {{timestamp}} to verify the campaign system is working correctly.

---
Evergreen Web Solutions
Terrace, BC, Canada
Campaign System Test

Unsubscribe: mailto:unsubscribe@evergreenwebsolutions.ca
        `
      }
    });

    // 4. Create test campaign
    console.log('🎯 Creating test campaign...');
    const testCampaign = await prisma.campaign.create({
      data: {
        name: 'Campaign System Test - All Features',
        description: 'Comprehensive test of all campaign features including smart windows, throttling, and email delivery',
        status: 'DRAFT'
      }
    });

    // 5. Create campaign settings with smart window
    console.log('⚙️ Creating campaign settings with smart window...');
    const now = new Date();
    const smartWindowStart = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    const smartWindowEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    await prisma.campaignSettings.create({
      data: {
        campaignId: testCampaign.id,
        windows: [
          {
            start: '09:00',
            end: '17:00'
          }
        ],
        throttlePerMinute: 10, // Slow for testing
        maxConcurrent: 5,
        perDomain: {
          'gmail.com': { tpm: 5 },
          'icloud.com': { tpm: 5 }
        },
        quietHours: [
          {
            start: '22:00',
            end: '08:00'
          }
        ],
        paused: false
      }
    });

    // 6. Create campaign schedule with smart window
    console.log('📅 Creating campaign schedule with smart window...');
    const testSchedule = await prisma.campaignSchedule.create({
      data: {
        name: 'Test Campaign - Smart Window',
        templateId: testTemplate.id,
        groupId: testGroup.id,
        campaignId: testCampaign.id,
        status: 'DRAFT',
        sendAt: null, // Will use smart window
        throttlePerMinute: 10,
        repeatIntervalMins: null,
        stepOrder: 1,
        smartWindowStart: smartWindowStart,
        smartWindowEnd: smartWindowEnd,
        timeZone: 'America/Vancouver',
        nextRunAt: smartWindowStart
      }
    });

    // 7. Create immediate send schedule for testing
    console.log('⚡ Creating immediate send schedule...');
    const immediateSchedule = await prisma.campaignSchedule.create({
      data: {
        name: 'Test Campaign - Send Now',
        templateId: testTemplate.id,
        groupId: testGroup.id,
        campaignId: testCampaign.id,
        status: 'DRAFT',
        sendAt: new Date(now.getTime() + 2 * 60 * 1000), // 2 minutes from now
        throttlePerMinute: 5,
        repeatIntervalMins: null,
        stepOrder: 2,
        smartWindowStart: null,
        smartWindowEnd: null,
        timeZone: 'America/Vancouver',
        nextRunAt: new Date(now.getTime() + 2 * 60 * 1000)
      }
    });

    console.log('✅ Test campaign created successfully!');
    console.log('📊 Campaign Details:');
    console.log(`   Campaign ID: ${testCampaign.id}`);
    console.log(`   Group ID: ${testGroup.id}`);
    console.log(`   Template ID: ${testTemplate.id}`);
    console.log(`   Smart Window Schedule ID: ${testSchedule.id}`);
    console.log(`   Immediate Send Schedule ID: ${immediateSchedule.id}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Go to admin dashboard: http://localhost:3000/admin/campaign');
    console.log('2. Find your test campaign in the campaigns list');
    console.log('3. Test the "Send Now" feature with the immediate schedule');
    console.log('4. Test the "Smart Window" feature with the scheduled send');
    console.log('5. Check your email inboxes for test emails');
    console.log('');
    console.log('📧 Test Recipients:');
    console.log('   - gabriel.lacroix94@icloud.com');
    console.log('   - greenalderson@gmail.com');
    console.log('');
    console.log('⏰ Smart Window:');
    console.log(`   Start: ${smartWindowStart.toLocaleString()}`);
    console.log(`   End: ${smartWindowEnd.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error creating test campaign:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestCampaign();
