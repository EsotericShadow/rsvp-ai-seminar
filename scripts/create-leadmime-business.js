const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createLeadMineBusiness() {
  console.log('🔍 Testing LeadMine business creation...');
  
  const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
  const apiKey = process.env.LEADMINE_API_KEY?.trim();
  
  if (!baseUrl || !apiKey) {
    console.log('❌ LeadMine not configured');
    return;
  }
  
  // Try to create a business via POST
  const testBusiness = {
    id: 'test-availability-live',
    name: 'Availability Live Test',
    contact: {
      primaryEmail: 'availability127@live.ca',
      contactPerson: 'Test Person',
      tags: ['test', 'automation']
    },
    address: 'Test Address',
    website: 'https://test.com'
  };
  
  console.log('📤 Attempting to create business via POST...');
  
  try {
    const response = await fetch(`${baseUrl}/api/integration/businesses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBusiness)
    });
    
    console.log('📡 POST Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Business created:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ POST Error:', errorText);
    }
  } catch (error) {
    console.log('❌ POST failed:', error.message);
  }
  
  // Now try the GET with createMissing again
  console.log('\n📤 Attempting to create business via GET with createMissing...');
  
  try {
    const url = `${baseUrl}/api/integration/businesses?ids=test-availability-live&createMissing=1&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 GET Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET Response:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const business = data.data[0];
        console.log('🎉 Business found/created:', {
          id: business.id,
          name: business.name,
          email: business.contact.primaryEmail,
          inviteToken: business.invite?.token || 'NO TOKEN'
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ GET Error:', errorText);
    }
  } catch (error) {
    console.log('❌ GET failed:', error.message);
  }
}

createLeadMineBusiness()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

