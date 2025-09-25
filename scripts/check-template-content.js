const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkTemplateContent() {
  console.log('🔍 Checking email template content...');
  
  // Find the test template
  const template = await prisma.campaignTemplate.findFirst({
    where: {
      name: 'Test Welcome Email',
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    }
  });
  
  if (!template) {
    console.log('❌ Test template not found');
    return;
  }
  
  console.log('✅ Found template:', template.name);
  console.log('📧 Subject:', template.subject);
  console.log('📄 HTML Content:');
  console.log(template.htmlBody);
  console.log('\n📄 Text Content:');
  console.log(template.textBody);
  
  // Test template rendering with a test context
  console.log('\n🔧 Testing template rendering...');
  
  const testContext = {
    business_name: 'Green Alderson Test Account',
    business_id: 'test-green-alderson',
    inviteToken: 'test-token-test-green-alderson-1758828765084',
    invite_link: 'https://rsvp.evergreenwebsolutions.ca/?eid=biz_test-token-test-green-alderson-1758828765084'
  };
  
  // Replace placeholders
  let processedHTML = template.htmlBody;
  let processedText = template.textBody;
  
  Object.entries(testContext).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processedHTML = processedHTML.replace(regex, value);
    processedText = processedText.replace(regex, value);
  });
  
  console.log('\n📄 Processed HTML:');
  console.log(processedHTML);
  
  console.log('\n📄 Processed Text:');
  console.log(processedText);
  
  // Check if there are any invalid characters or malformed HTML
  console.log('\n🔍 Checking for potential issues:');
  
  // Check for unclosed tags
  const openTags = (processedHTML.match(/<[^\/][^>]*>/g) || []).length;
  const closeTags = (processedHTML.match(/<\/[^>]*>/g) || []).length;
  console.log(`   Open tags: ${openTags}, Close tags: ${closeTags}`);
  
  // Check for invalid characters
  const invalidChars = processedHTML.match(/[^\x20-\x7E\s]/g);
  if (invalidChars) {
    console.log(`   ❌ Invalid characters found: ${invalidChars.join(', ')}`);
  } else {
    console.log('   ✅ No invalid characters found');
  }
  
  // Check for malformed URLs
  const urlMatches = processedHTML.match(/https?:\/\/[^\s"'>]+/g);
  if (urlMatches) {
    console.log('   📎 URLs found:');
    urlMatches.forEach((url, index) => {
      try {
        new URL(url);
        console.log(`      ${index + 1}. ✅ Valid: ${url}`);
      } catch (error) {
        console.log(`      ${index + 1}. ❌ Invalid: ${url} (${error.message})`);
      }
    });
  }
}

checkTemplateContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
