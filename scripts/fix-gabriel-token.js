const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixGabrielToken() {
  console.log('🔍 Fixing Gabriel Lacroix invite token...');
  
  try {
    // Get Gabriel's member record
    const gabrielMember = await prisma.audienceMember.findFirst({
      where: {
        primaryEmail: 'gabriel.lacroix94@icloud.com'
      }
    });
    
    if (!gabrielMember) {
      console.log('❌ Gabriel member not found');
      return;
    }
    
    console.log('✅ Found Gabriel member:', gabrielMember.id);
    console.log('Invitation token details omitted from output.');
    
    // Update with the token from LeadMine
    const inviteToken = requireAuditEnvironment('AUDIENCE_INVITE_TOKEN');
    
    const updatedMember = await prisma.audienceMember.update({
      where: { id: gabrielMember.id },
      data: {
        inviteToken: inviteToken
      }
    });
    
    console.log('Invitation token details omitted from output.');
    
    // Test URL generation
    const inviteLink = `https://rsvp.evergreenwebsolutions.ca/?eid=biz_${inviteToken}`;
    console.log('🔗 Generated invite link:', inviteLink);
    
    // Now let's create a new EmailJob for Gabriel
    console.log('\n📧 Creating new EmailJob for Gabriel...');
    
    const testCampaign = await prisma.campaign.findFirst({
      where: {
        meta: {
          path: ['finalTestCampaign'],
          equals: true
        }
      },
      include: {
        schedules: {
          include: {
            template: true,
            group: true
          }
        }
      }
    });
    
    if (!testCampaign || !testCampaign.schedules[0]) {
      console.log('❌ Test campaign or schedule not found');
      return;
    }
    
    const firstSchedule = testCampaign.schedules[0];
    console.log('✅ Found test campaign and schedule');
    
    // Delete the old failed EmailJob
    await prisma.emailJob.deleteMany({
      where: {
        recipientEmail: 'gabriel.lacroix94@icloud.com'
      }
    });
    
    console.log('🧹 Deleted old failed EmailJob');
    
    // Create new EmailJob for Gabriel
    const now = new Date();
    const gabrielEmailJob = await prisma.emailJob.create({
      data: {
        campaignId: testCampaign.id,
        scheduleId: firstSchedule.id,
        templateId: firstSchedule.templateId,
        groupId: gabrielMember.groupId,
        recipientEmail: 'gabriel.lacroix94@icloud.com',
        recipientId: 'test-gabriel-lacroix',
        sendAt: now,
        status: 'scheduled',
        meta: {
          testEmail: true,
          immediateSend: true
        }
      }
    });
    
    console.log('✅ Created new EmailJob for Gabriel:', gabrielEmailJob.id);
    console.log('📧 Email scheduled for immediate sending');
    
    // Verify the member now has a token
    const finalMember = await prisma.audienceMember.findUnique({
      where: { id: gabrielMember.id }
    });
    
    console.log('\n✅ Final member status:');
    console.log('   Email:', finalMember.primaryEmail);
    console.log('Invitation token details omitted from output.');
    console.log('   Business ID:', finalMember.businessId);
    
  } catch (error) {
    console.log('❌ Error fixing Gabriel token:', error.message);
  }
}

fixGabrielToken()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



// Require an operator-supplied credential without embedding it in source.
function requireAuditEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
