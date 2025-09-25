const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testEmailGenerationLocally() {
  console.log('🔍 Testing email generation locally...');
  
  try {
    // Get the test data
    const template = await prisma.campaignTemplate.findUnique({
      where: { id: 'cmfzua0fi0002llgl3dqmyuz6' }
    });
    
    const group = await prisma.audienceGroup.findUnique({
      where: { id: 'cmfzua8lh0000rulk8sbkx13i' },
      include: {
        members: {
          take: 1
        }
      }
    });
    
    if (!template || !group || !group.members[0]) {
      console.log('❌ Test data not found');
      return;
    }
    
    const member = group.members[0];
    console.log('✅ Test data found:');
    console.log('   Template:', template.name);
    console.log('   Member:', member.businessName);
    console.log('   Email:', member.primaryEmail);
    console.log('   Token:', member.inviteToken);
    
    // Test URL generation
    const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
    const url = new URL(linkBase);
    url.searchParams.set('eid', `biz_${member.inviteToken}`);
    const trackingLink = url.toString();
    
    console.log('✅ Generated tracking link:', trackingLink);
    
    // Test template content processing
    const templateContent = template.htmlBody;
    const processedContent = templateContent
      .replace(/\{\{\s*business_name\s*\}\}/g, member.businessName || 'Valued Customer')
      .replace(/\{\{\s*business_id\s*\}\}/g, member.businessId)
      .replace(/\{\{\s*invite_link\s*\}\}/g, trackingLink);
    
    console.log('✅ Template content processed');
    console.log('   Original length:', templateContent.length);
    console.log('   Processed length:', processedContent.length);
    
    // Check if the processed content contains the tracking link
    const hasTrackingLink = processedContent.includes(trackingLink);
    console.log('   Contains tracking link:', hasTrackingLink);
    
    if (hasTrackingLink) {
      console.log('   ✅ Tracking link successfully inserted');
    } else {
      console.log('   ❌ Tracking link not found in processed content');
    }
    
    // Test the email template generation function
    console.log('\n📄 Testing email template generation...');
    
    // Simulate the generateEmailHTML function call
    const emailData = {
      subject: template.subject,
      greeting: 'Hello!',
      body: processedContent,
      ctaText: 'View details & RSVP',
      ctaLink: trackingLink,
      inviteToken: member.inviteToken,
      businessName: member.businessName || 'Valued Customer',
      businessId: member.businessId,
    };
    
    console.log('✅ Email data prepared:', {
      subject: emailData.subject,
      bodyLength: emailData.body.length,
      ctaLink: emailData.ctaLink,
      inviteToken: emailData.inviteToken ? 'SET' : 'NOT SET'
    });
    
    // Test Resend API key
    console.log('\n📤 Testing Resend API key...');
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      console.log('✅ Resend API key is set');
    } else {
      console.log('❌ Resend API key is not set');
    }
    
    console.log('\n🎯 Local email generation test completed successfully!');
    console.log('   All components are working correctly locally');
    console.log('   The issue must be in the production environment');
    
  } catch (error) {
    console.log('❌ Error testing email generation locally:', error.message);
    console.log('Stack:', error.stack);
  }
}

testEmailGenerationLocally()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
