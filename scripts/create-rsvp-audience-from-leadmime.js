const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createRSVPAudienceFromLeadMine() {
  console.log('🔍 Creating RSVP audience group from LeadMine businesses...');
  
  // Clean up any existing test groups
  await prisma.audienceMember.deleteMany({
    where: {
      group: {
        name: {
          contains: 'LeadMine Test'
        }
      }
    }
  });
  
  await prisma.audienceGroup.deleteMany({
    where: {
      name: {
        contains: 'LeadMine Test'
      }
    }
  });
  
  console.log('🧹 Cleaned up existing LeadMine test groups');
  
  // Create new audience group
  const audienceGroup = await prisma.audienceGroup.create({
    data: {
      name: 'LeadMine Test Group',
      description: 'Test group using businesses from LeadMine database',
      meta: {
        testGroup: true,
        source: 'leadmine',
        safeForTesting: true
      }
    }
  });
  
  console.log('✅ Created audience group:', audienceGroup.id);
  
  // The test businesses from LeadMine
  const leadMineBusinesses = [
    {
      businessId: 'test-green-alderson',
      businessName: 'Green Alderson Test Account',
      primaryEmail: 'greenalderson@gmail.com',
      inviteToken: 'test-token-test-green-alderson-1758828765084'
    },
    {
      businessId: 'test-tangible-outlook', 
      businessName: 'Tangible Outlook Test Account',
      primaryEmail: 'tangible18@outlook.com',
      inviteToken: 'test-token-test-tangible-outlook-1758828765524'
    },
    {
      businessId: 'test-availability-live',
      businessName: 'Availability Live Test Account', 
      primaryEmail: 'availability127@live.ca',
      inviteToken: 'test-token-test-availability-live-1758828765862'
    }
  ];
  
  console.log('👥 Adding LeadMine businesses to audience group...');
  
  for (const business of leadMineBusinesses) {
    const member = await prisma.audienceMember.create({
      data: {
        groupId: audienceGroup.id,
        businessId: business.businessId,
        businessName: business.businessName,
        primaryEmail: business.primaryEmail,
        secondaryEmail: null,
        tagsSnapshot: ['test', 'leadmine', 'automation'],
        inviteToken: business.inviteToken,
        meta: {
          source: 'leadmine',
          testMember: true,
          safeForTesting: true,
          leadmineBusinessId: business.businessId
        }
      }
    });
    
    console.log(`✅ Added: ${business.businessName} (${business.primaryEmail})`);
    console.log(`   Token: ${business.inviteToken}`);
  }
  
  console.log('\n🎉 LeadMine audience group created successfully!');
  console.log('⚠️  SAFE: This group contains only test businesses from LeadMine!');
  
  // Show final stats
  const memberCount = await prisma.audienceMember.count({
    where: { groupId: audienceGroup.id }
  });
  
  console.log(`📊 Audience group has ${memberCount} members`);
  console.log('📧 Members with invite tokens:');
  
  const members = await prisma.audienceMember.findMany({
    where: { groupId: audienceGroup.id },
    select: {
      businessName: true,
      primaryEmail: true,
      inviteToken: true
    }
  });
  
  members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    console.log(`      Token: ${member.inviteToken}`);
  });
  
  return audienceGroup.id;
}

createRSVPAudienceFromLeadMine()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
