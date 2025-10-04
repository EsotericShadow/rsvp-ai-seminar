const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixGlobalTemplateIntegration() {
  console.log('🔍 Fixing individual templates to use global template structure...');
  
  try {
    // Get all AI Event templates
    const templates = await prisma.campaignTemplate.findMany({
      where: {
        meta: {
          path: ['aiEventTemplate'],
          equals: true
        }
      }
    });
    
    console.log(`📧 Found ${templates.length} templates to fix`);
    
    for (const template of templates) {
      console.log(`\n🔧 Fixing template: ${template.name}`);
      
      // Update each template to use proper global template structure
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          // Set greeting title and message for each template
          greeting_title: 'Hello!',
          greeting_message: 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
          
          // Keep the existing structured content
          main_content_title: template.main_content_title,
          main_content_body: template.main_content_body,
          button_text: template.button_text,
          additional_info_title: template.additional_info_title,
          additional_info_body: template.additional_info_body,
          closing_title: template.closing_title,
          closing_message: template.closing_message,
          
          // Global signature is handled by the global template, but we can set defaults
          signature_name: 'Gabriel Lacroix',
          signature_title: 'AI Solutions Specialist',
          signature_company: 'Evergreen Web Solutions',
          signature_location: 'Terrace, BC',
        }
      });
      
      console.log(`✅ Updated template: ${template.name}`);
      console.log(`   - Added greeting_title: "Hello!"`);
      console.log(`   - Added greeting_message: "Thank you for your interest..."`);
      console.log(`   - Kept existing structured content`);
    }
    
    console.log('\n🎉 All templates updated to use global template structure!');
    console.log('📝 Templates now have proper greeting sections');
    console.log('🔄 Individual template editor should now show all global template variables');
    console.log('🎯 Templates will use the global template HTML structure with individual content');
    
  } catch (error) {
    console.log('❌ Error fixing global template integration:', error.message);
  }
}

fixGlobalTemplateIntegration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

