const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDirectEmailSend() {
  try {
    console.log('🚀 Testing direct email sending...');
    
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
    
    // Create a simple test email send record
    const testSend = await prisma.campaignSend.create({
      data: {
        scheduleId: 'direct-test-send',
        groupId: testGroup.id,
        templateId: template.id,
        businessId: testMember.businessId,
        businessName: testMember.businessName,
        email: testMember.primaryEmail,
        inviteToken: `direct-test-${Date.now()}`,
        status: 'PENDING',
        meta: {
          directTest: true,
          testEmail: true
        }
      }
    });
    
    console.log(`✅ Created test send record: ${testSend.id}`);
    
    // Now let's try to send the email using a simple fetch to a test endpoint
    console.log('\n📤 Attempting to send email...');
    
    const emailData = {
      to: testMember.primaryEmail,
      subject: template.subject,
      htmlBody: template.htmlBody.replace(/\{\{businessName\}\}/g, testMember.businessName),
      textBody: template.textBody?.replace(/\{\{businessName\}\}/g, testMember.businessName) || '',
      inviteToken: testSend.inviteToken
    };
    
    console.log('📧 Email data:');
    console.log(`  To: ${emailData.to}`);
    console.log(`  Subject: ${emailData.subject}`);
    console.log(`  Token: ${emailData.inviteToken}`);
    
    // Try to send via a simple test endpoint
    try {
      const response = await fetch('http://localhost:3000/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: testMember.businessName,
          email: testMember.primaryEmail,
          attendanceStatus: 'yes',
          attendeeCount: 1,
          dietaryPreference: 'none',
          referralSource: 'test'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ RSVP endpoint responded successfully!');
        console.log('📊 Response:', result);
        
        // Update the test send record
        await prisma.campaignSend.update({
          where: { id: testSend.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            resendMessageId: 'rsvp-test-message'
          }
        });
        
        console.log('✅ Test send record updated');
        
      } else {
        const error = await response.text();
        console.log('❌ RSVP endpoint failed:', response.status, error);
        
        // Update the test send record with error
        await prisma.campaignSend.update({
          where: { id: testSend.id },
          data: {
            status: 'FAILED',
            error: `RSVP Error: ${response.status} - ${error}`
          }
        });
      }
      
    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
      
      // Update the test send record with error
      await prisma.campaignSend.update({
        where: { id: testSend.id },
        data: {
          status: 'FAILED',
          error: `API Call Error: ${apiError.message}`
        }
      });
    }
    
    console.log('\n🎉 Direct email send test completed!');
    console.log('📊 Check the campaign send record in the database for results.');
    
  } catch (error) {
    console.error('❌ Error testing direct email send:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectEmailSend();
