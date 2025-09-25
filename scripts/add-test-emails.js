const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testEmails = [
  {
    businessId: 'test-gabriel-lacroix',
    businessName: 'Gabriel Lacroix Test',
    primaryEmail: 'gabriel.lacroix94@icloud.com',
    secondaryEmail: null,
    industry: 'Technology',
    location: 'Test Location',
    verified: true
  },
  {
    businessId: 'test-green-alderson',
    businessName: 'Green Alderson Test',
    primaryEmail: 'greenalderson@gmail.com',
    secondaryEmail: null,
    industry: 'Technology',
    location: 'Test Location',
    verified: true
  },
  {
    businessId: 'test-tangible-outlook',
    businessName: 'Tangible Outlook Test',
    primaryEmail: 'tangible18@outlook.com',
    secondaryEmail: null,
    industry: 'Technology',
    location: 'Test Location',
    verified: true
  },
  {
    businessId: 'test-availability-live',
    businessName: 'Availability Live Test',
    primaryEmail: 'availability127@live.ca',
    secondaryEmail: null,
    industry: 'Technology',
    location: 'Test Location',
    verified: true
  }
];

async function addTestEmails() {
  try {
    console.log('🚀 Adding test emails to lead mine database...');
    
    for (const email of testEmails) {
      // Check if already exists
      const existing = await prisma.audienceMember.findFirst({
        where: { primaryEmail: email.primaryEmail }
      });
      
      if (existing) {
        console.log(`⚠️  Email ${email.primaryEmail} already exists, skipping...`);
        continue;
      }
      
      // First, create or find a test group
      let testGroup = await prisma.audienceGroup.findFirst({
        where: { name: 'Test Email Group' }
      });
      
      if (!testGroup) {
        testGroup = await prisma.audienceGroup.create({
          data: {
            name: 'Test Email Group',
            description: 'Group for testing email campaigns',
            criteria: {},
            meta: { testGroup: true }
          }
        });
        console.log('✅ Created test group');
      }
      
      // Add to audience members
      const member = await prisma.audienceMember.create({
        data: {
          groupId: testGroup.id,
          businessId: email.businessId,
          businessName: email.businessName,
          primaryEmail: email.primaryEmail,
          secondaryEmail: email.secondaryEmail,
          tagsSnapshot: [email.industry, email.location],
          meta: {
            industry: email.industry,
            location: email.location,
            verified: email.verified,
            testEmail: true
          }
        }
      });
      
      console.log(`✅ Added: ${email.primaryEmail} (${email.businessName})`);
    }
    
    console.log('🎉 Test emails added successfully!');
    
    // Show current count
    const totalMembers = await prisma.audienceMember.count();
    console.log(`📊 Total audience members: ${totalMembers}`);
    
  } catch (error) {
    console.error('❌ Error adding test emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestEmails();
