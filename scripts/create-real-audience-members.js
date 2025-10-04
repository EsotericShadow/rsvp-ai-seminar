const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createRealAudienceMembers() {
  console.log('🔍 Creating audience members from real LeadMine businesses...');
  
  const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
  const apiKey = process.env.LEADMINE_API_KEY?.trim();
  
  if (!baseUrl || !apiKey) {
    console.log('❌ LeadMine not configured');
    return;
  }
  
  // Get some real businesses from LeadMine
  console.log('📡 Fetching businesses from LeadMine...');
  
  try {
    const response = await fetch(`${baseUrl}/api/integration/businesses?limit=10&hasEmail=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ LeadMine request failed:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.data.length} businesses with emails`);
    
    if (data.data.length === 0) {
      console.log('❌ No businesses found with emails');
      return;
    }
    
    // Find or create test group
    let testGroup = await prisma.audienceGroup.findFirst({
      where: {
        name: 'Real LeadMine Test Group'
      }
    });
    
    if (!testGroup) {
      testGroup = await prisma.audienceGroup.create({
        data: {
          name: 'Real LeadMine Test Group',
          description: 'Test group using real businesses from LeadMine',
          meta: {
            testGroup: true,
            source: 'leadmine'
          }
        }
      });
      console.log('✅ Created test group:', testGroup.id);
    } else {
      console.log('✅ Using existing test group:', testGroup.id);
    }
    
    // Create audience members for each business
    for (const business of data.data.slice(0, 4)) { // Use first 4 businesses
      console.log(`\n👤 Processing business: ${business.id}`);
      console.log(`   Name: ${business.name}`);
      console.log(`   Email: ${business.contact.primaryEmail}`);
      console.log(`   Invite Token: ${business.invite?.token || 'NO TOKEN'}`);
      
      if (!business.contact.primaryEmail) {
        console.log('   ❌ Skipping - no email');
        continue;
      }
      
      // Check if member already exists
      const existingMember = await prisma.audienceMember.findFirst({
        where: {
          groupId: testGroup.id,
          businessId: business.id
        }
      });
      
      if (existingMember) {
        console.log('   ✅ Member already exists');
        continue;
      }
      
      // Create new member
      const member = await prisma.audienceMember.create({
        data: {
          groupId: testGroup.id,
          businessId: business.id,
          businessName: business.name,
          primaryEmail: business.contact.primaryEmail,
          secondaryEmail: business.contact.alternateEmail,
          tagsSnapshot: business.contact.tags || [],
          inviteToken: business.invite?.token || null,
          meta: {
            source: 'leadmine',
            address: business.address,
            website: business.website,
            contactPerson: business.contact.contactPerson,
            testMember: true
          }
        }
      });
      
      console.log('   ✅ Created member:', member.id);
    }
    
    console.log('\n🎉 Real audience members created successfully!');
    
    // Show final group stats
    const memberCount = await prisma.audienceMember.count({
      where: { groupId: testGroup.id }
    });
    
    console.log(`📊 Test group now has ${memberCount} members`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createRealAudienceMembers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

