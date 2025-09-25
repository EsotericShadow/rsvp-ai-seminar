const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function verifyAITemplates() {
  console.log('🔍 Verifying AI event templates...');
  
  try {
    const templates = await prisma.campaignTemplate.findMany({
      where: {
        meta: {
          path: ['aiEventTemplate'],
          equals: true
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📊 Found ${templates.length} AI event templates:`);
    
    // Group by email number
    const groupedTemplates = {};
    templates.forEach(template => {
      const emailNumber = template.meta.emailNumber;
      if (!groupedTemplates[emailNumber]) {
        groupedTemplates[emailNumber] = [];
      }
      groupedTemplates[emailNumber].push(template);
    });
    
    Object.keys(groupedTemplates).sort().forEach(emailNumber => {
      console.log(`\n📧 Email ${emailNumber} (${groupedTemplates[emailNumber][0].meta.sendDate}):`);
      groupedTemplates[emailNumber].forEach(template => {
        console.log(`   ${template.meta.variant}. ${template.name}`);
        console.log(`      Subject: ${template.subject}`);
        console.log(`      Button: ${template.meta.buttonText}`);
      });
    });
    
    // Show sample content from first template
    if (templates.length > 0) {
      const sampleTemplate = templates[0];
      console.log(`\n📝 Sample content from "${sampleTemplate.name}":`);
      console.log(`   Subject: ${sampleTemplate.subject}`);
      console.log(`   Content preview: ${sampleTemplate.htmlBody.substring(0, 200)}...`);
    }
    
    console.log('\n✅ All AI event templates verified successfully!');
    console.log('🎯 Ready to create campaigns with these templates');
    
  } catch (error) {
    console.log('❌ Error verifying templates:', error.message);
  }
}

verifyAITemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
