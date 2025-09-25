const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkLeadMineBusinesses() {
  console.log('🔍 Checking what businesses exist in LeadMine...');
  
  // Check environment variables
  const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
  const apiKey = process.env.LEADMINE_API_KEY?.trim();
  
  if (!baseUrl || !apiKey) {
    console.log('❌ LeadMine not configured');
    return;
  }
  
  // Get all test members from our database
  const testMembers = await prisma.audienceMember.findMany({
    where: {
      businessId: {
        startsWith: 'test-'
      }
    }
  });
  
  console.log(`👥 Found ${testMembers.length} test members in database`);
  
  // Check each one in LeadMine
  for (const member of testMembers) {
    console.log(`\n🔍 Checking business: ${member.businessId}`);
    
    try {
      const url = `${baseUrl}/api/integration/businesses?ids=${member.businessId}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const business = data.data[0];
          console.log(`✅ Found in LeadMine:`, {
            id: business.id,
            name: business.name,
            email: business.contact.primaryEmail,
            inviteToken: business.invite?.token || 'NO TOKEN'
          });
        } else {
          console.log(`❌ Not found in LeadMine`);
        }
      } else {
        console.log(`❌ API error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Let's also try to search for businesses with email addresses
  console.log('\n🔍 Searching LeadMine for our test emails...');
  
  const testEmails = [
    'gabriel.lacroix94@icloud.com',
    'greenalderson@gmail.com', 
    'tangible18@outlook.com',
    'availability127@live.ca'
  ];
  
  for (const email of testEmails) {
    try {
      const url = `${baseUrl}/api/integration/businesses?search=${encodeURIComponent(email)}&limit=5`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📧 Search for ${email}: Found ${data.data.length} businesses`);
        if (data.data.length > 0) {
          data.data.forEach(biz => {
            console.log(`  - ${biz.id}: ${biz.name} (${biz.contact.primaryEmail})`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ Search error for ${email}: ${error.message}`);
    }
  }
}

checkLeadMineBusinesses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
