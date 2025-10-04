const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixGabrielBusiness() {
  console.log('🔍 Fixing Gabriel Lacroix business in LeadMine...');
  
  try {
    // First, let's update the business in LeadMine with the email and invite token
    console.log('📧 Updating Gabriel Lacroix business in LeadMine...');
    
    const leadMineResponse = await fetch('https://lead-mine.vercel.app/api/integration/businesses?ids=test-gabriel-lacroix&createMissing=true', {
      headers: {
        'Authorization': `Bearer ${process.env.LEADMINE_API_KEY}`
      }
    });
    
    if (leadMineResponse.ok) {
      const leadMineData = await leadMineResponse.json();
      console.log('✅ LeadMine response:', JSON.stringify(leadMineData, null, 2));
    } else {
      console.log('❌ LeadMine request failed:', leadMineResponse.status);
    }
    
    // Now let's add Gabriel to the test group
    console.log('\n👥 Adding Gabriel Lacroix to the test group...');
    
    const testGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'LeadMine Test Group' }
    });
    
    if (!testGroup) {
      console.log('❌ Test group not found');
      return;
    }
    
    console.log('✅ Found test group:', testGroup.id);
    
    // Create the member for Gabriel
    const gabrielMember = await prisma.audienceMember.create({
      data: {
        groupId: testGroup.id,
        businessId: 'test-gabriel-lacroix',
        businessName: 'Gabriel Lacroix Test Account',
        primaryEmail: 'gabriel.lacroix94@icloud.com',
        secondaryEmail: null,
        tagsSnapshot: ['test', 'campaign-testing', 'automation'],
        meta: {
          industry: 'Technology',
          location: 'Test Location',
          verified: true,
          testEmail: true
        }
      }
    });
    
    console.log('✅ Created Gabriel member:', gabrielMember.id);
    
    // Now let's create an EmailJob for Gabriel
    console.log('\n📧 Creating EmailJob for Gabriel...');
    
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
    
    // Create EmailJob for Gabriel
    const now = new Date();
    const gabrielEmailJob = await prisma.emailJob.create({
      data: {
        campaignId: testCampaign.id,
        scheduleId: firstSchedule.id,
        templateId: firstSchedule.templateId,
        groupId: testGroup.id,
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
    
    console.log('✅ Created EmailJob for Gabriel:', gabrielEmailJob.id);
    console.log('📧 Email scheduled for immediate sending');
    
    // Check the current group members
    const groupMembers = await prisma.audienceMember.findMany({
      where: { groupId: testGroup.id }
    });
    
    console.log(`\n📊 Test group now has ${groupMembers.length} members:`);
    groupMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    });
    
  } catch (error) {
    console.log('❌ Error fixing Gabriel business:', error.message);
  }
}

fixGabrielBusiness()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

