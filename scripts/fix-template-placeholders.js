const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixTemplatePlaceholders() {
  console.log('🔍 Fixing template placeholders...');
  
  // Find all test templates
  const templates = await prisma.campaignTemplate.findMany({
    where: {
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    }
  });
  
  console.log(`📧 Found ${templates.length} test templates to fix`);
  
  for (const template of templates) {
    console.log(`\n🔧 Fixing template: ${template.name}`);
    
    // Fix the HTML content
    let fixedHTML = template.htmlBody
      .replace(/\{\{\s*businessName\s*\}\}/g, '{{business_name}}')
      .replace(/\{\{\s*businessId\s*\}\}/g, '{{business_id}}');
    
    // Fix the text content
    let fixedText = template.textBody
      .replace(/\{\{\s*businessName\s*\}\}/g, '{{business_name}}')
      .replace(/\{\{\s*businessId\s*\}\}/g, '{{business_id}}');
    
    // Update the template
    await prisma.campaignTemplate.update({
      where: { id: template.id },
      data: {
        htmlBody: fixedHTML,
        textBody: fixedText
      }
    });
    
    console.log(`✅ Fixed template: ${template.name}`);
    console.log('   Fixed placeholders: businessName → business_name');
  }
  
  console.log('\n🎉 All templates fixed!');
  
  // Test the fixed template
  const testTemplate = await prisma.campaignTemplate.findFirst({
    where: {
      name: 'Test Welcome Email',
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    }
  });
  
  if (testTemplate) {
    console.log('\n📄 Testing fixed template:');
    
    const testContext = {
      business_name: 'Green Alderson Test Account',
      business_id: 'test-green-alderson',
      invite_link: 'https://rsvp.evergreenwebsolutions.ca/?eid=biz_test-token-test-green-alderson-1758828765084'
    };
    
    let processedHTML = testTemplate.htmlBody;
    Object.entries(testContext).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedHTML = processedHTML.replace(regex, value);
    });
    
    console.log('✅ Processed HTML (should have no {{placeholders}}):');
    console.log(processedHTML);
    
    // Check if all placeholders were replaced
    const remainingPlaceholders = processedHTML.match(/\{\{[^}]+\}\}/g);
    if (remainingPlaceholders) {
      console.log(`❌ Remaining placeholders: ${remainingPlaceholders.join(', ')}`);
    } else {
      console.log('✅ All placeholders replaced successfully!');
    }
  }
}

fixTemplatePlaceholders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

