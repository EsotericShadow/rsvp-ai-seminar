const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createProperTestGroup() {
  console.log('🔍 Creating proper test group with safe test emails...');
  
  // Delete any existing test groups to start fresh
  // First delete campaign schedules that reference test groups
  await prisma.campaignSchedule.deleteMany({
    where: {
      group: {
        name: {
          contains: 'Test'
        }
      }
    }
  });
  
  // Then delete audience members
  await prisma.audienceMember.deleteMany({
    where: {
      group: {
        name: {
          contains: 'Test'
        }
      }
    }
  });
  
  // Finally delete the groups
  await prisma.audienceGroup.deleteMany({
    where: {
      name: {
        contains: 'Test'
      }
    }
  });
  
  console.log('🧹 Cleaned up existing test groups');
  
  // Create a new test group
  const testGroup = await prisma.audienceGroup.create({
    data: {
      name: 'Safe Test Email Group',
      description: 'Test group using safe test email addresses only',
      meta: {
        testGroup: true,
        safeForTesting: true,
        note: 'Contains only safe test emails - no real businesses'
      }
    }
  });
  
  console.log('✅ Created safe test group:', testGroup.id);
  
  // Add the safe test emails you provided
  const testEmails = [
    { 
      primaryEmail: 'gabriel.lacroix94@icloud.com', 
      businessId: 'test-gabriel-lacroix', 
      businessName: 'Gabriel Lacroix Test Account',
      industry: 'Technology',
      location: 'Test Location'
    },
    { 
      primaryEmail: 'greenalderson@gmail.com', 
      businessId: 'test-green-alderson', 
      businessName: 'Green Alderson Test Account',
      industry: 'Marketing',
      location: 'Test Location'
    },
    { 
      primaryEmail: 'tangible18@outlook.com', 
      businessId: 'test-tangible-outlook', 
      businessName: 'Tangible Outlook Test Account',
      industry: 'Consulting',
      location: 'Test Location'
    },
    { 
      primaryEmail: 'availability127@live.ca', 
      businessId: 'test-availability-live', 
      businessName: 'Availability Live Test Account',
      industry: 'Services',
      location: 'Test Location'
    }
  ];
  
  console.log('📧 Adding safe test email addresses...');
  
  for (const email of testEmails) {
    const member = await prisma.audienceMember.create({
      data: {
        groupId: testGroup.id,
        businessId: email.businessId,
        businessName: email.businessName,
        primaryEmail: email.primaryEmail,
        secondaryEmail: null,
        tagsSnapshot: [email.industry, email.location],
        meta: {
          industry: email.industry,
          location: email.location,
          testEmail: true,
          safeForTesting: true
        }
      }
    });
    
    console.log(`✅ Added: ${email.primaryEmail} (${email.businessName})`);
  }
  
  console.log('\n🎉 Safe test group created successfully!');
  console.log('⚠️  IMPORTANT: This group contains only safe test emails - no real businesses!');
  
  // Show final stats
  const memberCount = await prisma.audienceMember.count({
    where: { groupId: testGroup.id }
  });
  
  console.log(`📊 Test group has ${memberCount} safe test members`);
}

createProperTestGroup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
