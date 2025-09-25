const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImmediateSending() {
  try {
    console.log('🚀 Testing immediate email sending...');
    
    // Get the first test template
    const template = await prisma.campaignTemplate.findFirst({
      where: {
        meta: {
          path: ['testTemplate'],
          equals: true
        }
      }
    });
    
    if (!template) {
      throw new Error('Test template not found. Please run create-test-templates.js first.');
    }
    
    // Get the test group
    const testGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Test Email Group' }
    });
    
    if (!testGroup) {
      throw new Error('Test Email Group not found. Please run add-test-emails.js first.');
    }
    
    // Get one test member
    const testMember = await prisma.audienceMember.findFirst({
      where: { groupId: testGroup.id }
    });
    
    if (!testMember) {
      throw new Error('Test member not found in Test Email Group.');
    }
    
    console.log(`📧 Using template: ${template.name}`);
    console.log(`👤 Sending to: ${testMember.primaryEmail} (${testMember.businessName})`);
    
    // Get the first schedule from our test campaign
    const testSchedule = await prisma.campaignSchedule.findFirst({
      where: {
        meta: {
          path: ['testSchedule'],
          equals: true
        }
      }
    });
    
    if (!testSchedule) {
      throw new Error('Test schedule not found. Please run create-test-campaign.js first.');
    }
    
    console.log(`📅 Using schedule: ${testSchedule.name} (${testSchedule.id})`);
    
    // Create a test campaign send record
    const campaignSend = await prisma.campaignSend.create({
      data: {
        scheduleId: testSchedule.id,
        groupId: testGroup.id,
        templateId: template.id,
        businessId: testMember.businessId,
        businessName: testMember.businessName,
        email: testMember.primaryEmail,
        inviteToken: `test-token-${Date.now()}`,
        status: 'PENDING',
        meta: {
          testSend: true,
          immediateTest: true
        }
      }
    });
    
    console.log(`✅ Created campaign send record: ${campaignSend.id}`);
    
    // Now let's try to actually send the email using the API
    console.log('\n📤 Attempting to send email via API...');
    
    const emailData = {
      to: testMember.primaryEmail,
      subject: template.subject,
      htmlBody: template.htmlBody.replace(/\{\{businessName\}\}/g, testMember.businessName),
      textBody: template.textBody?.replace(/\{\{businessName\}\}/g, testMember.businessName) || '',
      inviteToken: campaignSend.inviteToken
    };
    
    console.log('📧 Email data prepared:');
    console.log(`  To: ${emailData.to}`);
    console.log(`  Subject: ${emailData.subject}`);
    console.log(`  Token: ${emailData.inviteToken}`);
    
    // Try to send via the API endpoint
    try {
      const response = await fetch('http://localhost:3000/api/admin/campaign/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': 'test-secret-123'
        },
        body: JSON.stringify({
          templateId: template.id,
          groupId: testGroup.id,
          limit: 1, // Only send to 1 email for testing
          name: 'Test Immediate Send'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via API!');
        console.log('📊 Response:', result);
        
        // Update the campaign send record
        await prisma.campaignSend.update({
          where: { id: campaignSend.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            resendMessageId: result.messageId || 'test-message-id'
          }
        });
        
        console.log('✅ Campaign send record updated');
        
      } else {
        const error = await response.text();
        console.log('❌ API send failed:', response.status, error);
        
        // Update the campaign send record with error
        await prisma.campaignSend.update({
          where: { id: campaignSend.id },
          data: {
            status: 'FAILED',
            error: `API Error: ${response.status} - ${error}`
          }
        });
      }
      
    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
      
      // Update the campaign send record with error
      await prisma.campaignSend.update({
        where: { id: campaignSend.id },
        data: {
          status: 'FAILED',
          error: `API Call Error: ${apiError.message}`
        }
      });
    }
    
    console.log('\n🎉 Immediate sending test completed!');
    console.log('📊 Check the campaign send record in the database for results.');
    
  } catch (error) {
    console.error('❌ Error testing immediate sending:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImmediateSending();
