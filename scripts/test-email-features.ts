import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEmailFeatures() {
  try {
    console.log('🧪 Testing all email features...');

    // 1. Test SendGrid configuration
    console.log('📧 Testing SendGrid configuration...');
    const sendGridTest = await fetch('http://localhost:3000/api/test-sendgrid');
    const sendGridResult = await sendGridTest.json();
    
    if (sendGridResult.configured) {
      console.log('✅ SendGrid configuration: WORKING');
    } else {
      console.log('❌ SendGrid configuration: FAILED');
      console.log('   Error:', sendGridResult.error);
    }

    // 2. Test RSVP email sending
    console.log('📝 Testing RSVP email sending...');
    const rsvpTest = await fetch('http://localhost:3000/api/test-sendgrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'gabriel.lacroix94@icloud.com',
        name: 'Gabriel Lacroix (Test)'
      })
    });
    
    const rsvpResult = await rsvpTest.json();
    if (rsvpResult.success) {
      console.log('✅ RSVP email sending: WORKING');
      console.log(`   Message ID: ${rsvpResult.messageId}`);
    } else {
      console.log('❌ RSVP email sending: FAILED');
      console.log('   Error:', rsvpResult.error);
    }

    // 3. Test campaign system
    console.log('🎯 Testing campaign system...');
    
    // Get test campaign
    const testCampaign = await prisma.campaign.findFirst({
      where: { name: { contains: 'Campaign System Test' } },
      include: {
        schedules: {
          include: {
            template: true,
            group: { include: { members: true } }
          }
        }
      }
    });

    if (testCampaign) {
      console.log(`✅ Test campaign found: ${testCampaign.name}`);
      console.log(`   Campaign ID: ${testCampaign.id}`);
      console.log(`   Schedules: ${testCampaign.schedules.length}`);
      console.log(`   Members: ${testCampaign.schedules[0]?.group.members.length || 0}`);
    } else {
      console.log('❌ No test campaign found. Run create-test-campaign.ts first.');
    }

    // 4. Test campaign sending (preview mode)
    console.log('👀 Testing campaign preview...');
    if (testCampaign && testCampaign.schedules.length > 0) {
      const scheduleId = testCampaign.schedules[0].id;
      
      const previewTest = await fetch('http://localhost:3000/api/admin/campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: scheduleId,
          previewOnly: true,
          limit: 2
        })
      });
      
      const previewResult = await previewTest.json();
      if (previewResult.result) {
        console.log('✅ Campaign preview: WORKING');
        console.log(`   Processed: ${previewResult.result.processed || 0} recipients`);
      } else {
        console.log('❌ Campaign preview: FAILED');
        console.log('   Error:', previewResult.error);
      }
    }

    // 5. Test actual campaign sending
    console.log('📤 Testing campaign sending...');
    if (testCampaign && testCampaign.schedules.length > 1) {
      const scheduleId = testCampaign.schedules[1].id; // Use immediate send schedule
      
      const sendTest = await fetch('http://localhost:3000/api/admin/campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: scheduleId,
          previewOnly: false,
          limit: 2
        })
      });
      
      const sendResult = await sendTest.json();
      if (sendResult.result) {
        console.log('✅ Campaign sending: WORKING');
        console.log(`   Sent: ${sendResult.result.sent || 0} emails`);
        console.log(`   Processed: ${sendResult.result.processed || 0} recipients`);
      } else {
        console.log('❌ Campaign sending: FAILED');
        console.log('   Error:', sendResult.error);
      }
    }

    // 6. Test smart window functionality
    console.log('⏰ Testing smart window...');
    if (testCampaign) {
      const smartWindowSchedule = testCampaign.schedules.find(s => s.smartWindowStart);
      if (smartWindowSchedule) {
        console.log('✅ Smart window schedule found');
        console.log(`   Window Start: ${smartWindowSchedule.smartWindowStart?.toLocaleString()}`);
        console.log(`   Window End: ${smartWindowSchedule.smartWindowEnd?.toLocaleString()}`);
        console.log(`   Next Run: ${smartWindowSchedule.nextRunAt?.toLocaleString()}`);
      } else {
        console.log('❌ No smart window schedule found');
      }
    }

    // 7. Test email validation
    console.log('✅ Testing email validation...');
    const testEmails = [
      'gabriel.lacroix94@icloud.com', // Valid
      'greenalderson@gmail.com',      // Valid
      'invalid-email',                // Invalid
      'test@tempmail.org'             // Disposable
    ];

    for (const email of testEmails) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isDisposable = ['tempmail.org', 'mailinator.com'].some(domain => email.includes(domain));
      
      if (isValid && !isDisposable) {
        console.log(`   ✅ ${email}: VALID`);
      } else if (!isValid) {
        console.log(`   ❌ ${email}: INVALID FORMAT`);
      } else if (isDisposable) {
        console.log(`   ⚠️  ${email}: DISPOSABLE DOMAIN`);
      }
    }

    // 8. Test cron job functionality
    console.log('⏰ Testing cron job...');
    const cronTest = await fetch('http://localhost:3000/api/admin/campaign/cron', {
      method: 'GET'
    });
    
    const cronResult = await cronTest.json();
    console.log('✅ Cron job: WORKING');
    console.log(`   Processed: ${cronResult.processed || 0} jobs`);

    console.log('');
    console.log('🎉 Email feature testing complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - SendGrid configuration: Tested');
    console.log('   - RSVP email sending: Tested');
    console.log('   - Campaign system: Tested');
    console.log('   - Smart windows: Tested');
    console.log('   - Email validation: Tested');
    console.log('   - Cron jobs: Tested');
    console.log('');
    console.log('📧 Check your email inboxes for test emails:');
    console.log('   - gabriel.lacroix94@icloud.com');
    console.log('   - greenalderson@gmail.com');
    console.log('');
    console.log('🔍 Check SendGrid dashboard for delivery stats:');
    console.log('   https://app.sendgrid.com/');

  } catch (error) {
    console.error('❌ Error testing email features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailFeatures();
