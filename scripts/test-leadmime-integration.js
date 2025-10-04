const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testLeadMineIntegration() {
  console.log('🔍 Testing LeadMine integration...');
  
  // Check environment variables
  console.log('📋 Environment variables:');
  console.log('LEADMINE_API_BASE:', process.env.LEADMINE_API_BASE ? 'SET' : 'NOT SET');
  console.log('LEADMINE_API_KEY:', process.env.LEADMINE_API_KEY ? 'SET' : 'NOT SET');
  
  // Get a test member
  const testMember = await prisma.audienceMember.findFirst({
    where: {
      businessId: {
        startsWith: 'test-'
      }
    }
  });
  
  if (!testMember) {
    console.log('❌ No test members found');
    return;
  }
  
  console.log('👤 Test member:', {
    id: testMember.id,
    businessId: testMember.businessId,
    primaryEmail: testMember.primaryEmail,
    inviteToken: testMember.inviteToken
  });
  
  // Try to call LeadMine API directly
  try {
    const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
    const apiKey = process.env.LEADMINE_API_KEY?.trim();
    
    if (!baseUrl || !apiKey) {
      console.log('❌ LeadMine not configured - missing environment variables');
      return;
    }
    
    const url = `${baseUrl}/api/integration/businesses?ids=${testMember.businessId}&createMissing=1&limit=1`;
    console.log('🌐 Calling LeadMine API:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ LeadMine response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ LeadMine error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ LeadMine call failed:', error.message);
  }
}

testLeadMineIntegration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

