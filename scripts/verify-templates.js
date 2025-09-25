const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTemplates() {
  try {
    console.log('Verifying email templates...\n');
    
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Total templates found: ${templates.length}\n`);
    
    // Group templates by email type
    const emailTypes = {
      'Awareness Introduction': [],
      'Benefits Highlight': [],
      'Value Proposition': [],
      'Social Proof': [],
      'Engagement Build': [],
      'Gentle Reminder': [],
      'Day Of Prompt': []
    };
    
    templates.forEach(template => {
      const type = template.name.split(' ')[0] + ' ' + template.name.split(' ')[1];
      if (emailTypes[type]) {
        emailTypes[type].push(template);
      }
    });
    
    // Display templates by type
    Object.entries(emailTypes).forEach(([type, typeTemplates]) => {
      if (typeTemplates.length > 0) {
        console.log(`${type} (${typeTemplates.length} variants):`);
        typeTemplates.forEach(template => {
          console.log(`  - ${template.name}`);
          console.log(`    Subject: "${template.subject}"`);
          console.log(`    Button: "${template.button_text}"`);
          console.log(`    Content: "${template.main_content_body.substring(0, 80)}..."`);
          console.log('');
        });
      }
    });
    
    // Show sample template content
    const sampleTemplate = templates[0];
    console.log('Sample template content:');
    console.log(`Name: ${sampleTemplate.name}`);
    console.log(`Subject: ${sampleTemplate.subject}`);
    console.log(`Greeting: ${sampleTemplate.greeting_title} - ${sampleTemplate.greeting_message}`);
    console.log(`Main Content: ${sampleTemplate.main_content_title}`);
    console.log(`Body: ${sampleTemplate.main_content_body}`);
    console.log(`Button: ${sampleTemplate.button_text}`);
    console.log(`Additional Info: ${sampleTemplate.additional_info_title}`);
    console.log(`Additional Body: ${sampleTemplate.additional_info_body}`);
    console.log(`Closing: ${sampleTemplate.closing_title} - ${sampleTemplate.closing_message}`);
    console.log(`Signature: ${sampleTemplate.signature_name}, ${sampleTemplate.signature_title}`);
    
  } catch (error) {
    console.error('Error verifying templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyTemplates();
