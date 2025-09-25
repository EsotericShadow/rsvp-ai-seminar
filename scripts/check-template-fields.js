const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkTemplateFields() {
  console.log('🔍 Checking template fields structure...');
  
  try {
    const template = await prisma.campaignTemplate.findFirst({
      where: {
        name: {
          contains: 'AI Event'
        }
      }
    });
    
    if (!template) {
      console.log('❌ No AI Event templates found');
      return;
    }
    
    console.log('📧 Template found:', template.name);
    console.log('📊 Template fields:');
    console.log('   - id:', template.id);
    console.log('   - name:', template.name);
    console.log('   - subject:', template.subject);
    console.log('   - htmlBody length:', template.htmlBody?.length || 0);
    console.log('   - textBody length:', template.textBody?.length || 0);
    console.log('   - meta:', JSON.stringify(template.meta, null, 2));
    console.log('   - greeting_title:', template.greeting_title || 'NOT SET');
    console.log('   - greeting_message:', template.greeting_message || 'NOT SET');
    console.log('   - signature_name:', template.signature_name || 'NOT SET');
    console.log('   - signature_title:', template.signature_title || 'NOT SET');
    console.log('   - signature_company:', template.signature_company || 'NOT SET');
    console.log('   - signature_location:', template.signature_location || 'NOT SET');
    console.log('   - main_content_title:', template.main_content_title || 'NOT SET');
    console.log('   - main_content_body:', template.main_content_body || 'NOT SET');
    console.log('   - button_text:', template.button_text || 'NOT SET');
    console.log('   - additional_info_title:', template.additional_info_title || 'NOT SET');
    console.log('   - additional_info_body:', template.additional_info_body || 'NOT SET');
    console.log('   - closing_title:', template.closing_title || 'NOT SET');
    console.log('   - closing_message:', template.closing_message || 'NOT SET');
    
    console.log('\n📝 HTML Body content preview:');
    console.log(template.htmlBody?.substring(0, 200) + '...');
    
  } catch (error) {
    console.log('❌ Error checking template fields:', error.message);
  }
}

checkTemplateFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
