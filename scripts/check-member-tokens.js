const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkMemberTokens() {
  console.log('🔍 Checking member invite tokens...');
  
  try {
    // Get the test group members
    const group = await prisma.audienceGroup.findUnique({
      where: { id: 'cmfzua8lh0000rulk8sbkx13i' },
      include: {
        members: true
      }
    });
    
    if (!group) {
      console.log('❌ Test group not found');
      return;
    }
    
    console.log('✅ Found test group:', group.name);
    console.log('👥 Members:', group.members.length);
    
    group.members.forEach((member, index) => {
      console.log(`\n${index + 1}. ${member.businessName}`);
      console.log(`   Email: ${member.primaryEmail}`);
      console.log(`   Business ID: ${member.businessId}`);
      console.log(`   Invite Token: ${member.inviteToken || 'NULL'}`);
      console.log(`   Token Length: ${member.inviteToken?.length || 0}`);
      
      if (member.inviteToken) {
        // Test URL generation
        try {
          const linkBase = 'https://rsvp.evergreenwebsolutions.ca';
          const url = new URL(linkBase);
          url.searchParams.set('eid', `biz_${member.inviteToken}`);
          const trackingLink = url.toString();
          console.log(`   ✅ Generated URL: ${trackingLink}`);
        } catch (error) {
          console.log(`   ❌ URL generation failed: ${error.message}`);
        }
      } else {
        console.log(`   ❌ No invite token!`);
      }
    });
    
    // Check EmailJobs
    console.log('\n📧 Checking EmailJobs...');
    const emailJobs = await prisma.emailJob.findMany({
      where: {
        campaignId: 'cmfzuagbb0000itreru58cot3'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📋 Found ${emailJobs.length} EmailJobs:`);
    emailJobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.recipientEmail}`);
      console.log(`   Template ID: ${job.templateId}`);
      console.log(`   Group ID: ${job.groupId}`);
      console.log(`   Schedule ID: ${job.scheduleId}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Error: ${job.error || 'None'}`);
      console.log(`   Attempts: ${job.attempts}`);
    });
    
  } catch (error) {
    console.log('❌ Error checking member tokens:', error.message);
  }
}

checkMemberTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

