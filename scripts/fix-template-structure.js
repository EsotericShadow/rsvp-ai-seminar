const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixTemplateStructure() {
  console.log('🔍 Fixing template structure to use proper fields...');
  
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
      
      // Parse the content from htmlBody and break it into proper fields
      const htmlBody = template.htmlBody;
      
      // Extract content sections using regex patterns
      const mainContentMatch = htmlBody.match(/<h2>(.*?)<\/h2>\s*<p>Hello \{\{business_name\}\},<\/p>\s*(.*?)(?=<h3>|$)/s);
      const mainContentTitle = mainContentMatch ? mainContentMatch[1] : '';
      const mainContentBody = mainContentMatch ? mainContentMatch[2].trim() : htmlBody;
      
      // Extract additional info section
      const additionalInfoMatch = htmlBody.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>(?=<h3>|$)/s);
      const additionalInfoTitle = additionalInfoMatch ? additionalInfoMatch[1] : '';
      const additionalInfoBody = additionalInfoMatch ? additionalInfoMatch[2] : '';
      
      // Extract closing section
      const closingMatch = htmlBody.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>(?=<p><a href|$)/s);
      const closingTitle = closingMatch ? closingMatch[1] : '';
      const closingMessage = closingMatch ? closingMatch[2] : '';
      
      // Extract button text from the link
      const buttonMatch = htmlBody.match(/<a href="\{\{invite_link\}\}".*?>(.*?)<\/a>/);
      const buttonText = buttonMatch ? buttonMatch[1] : 'View details & RSVP';
      
      // Clean up main content body - remove the button link since it's handled separately
      const cleanMainContentBody = mainContentBody.replace(/<p><a href="\{\{invite_link\}\}".*?<\/a><\/p>/s, '').trim();
      
      // Update the template with proper field structure
      const updatedTemplate = await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          // Keep the original htmlBody for backward compatibility
          htmlBody: htmlBody,
          // Add the structured fields
          main_content_title: mainContentTitle,
          main_content_body: cleanMainContentBody,
          button_text: buttonText,
          additional_info_title: additionalInfoTitle,
          additional_info_body: additionalInfoBody,
          closing_title: closingTitle,
          closing_message: closingMessage,
          // Set some default values for other fields
          greeting_title: '',
          greeting_message: '',
          signature_name: 'Gabriel Lacroix',
          signature_title: 'AI Solutions Specialist',
          signature_company: 'Evergreen Web Solutions',
          signature_location: 'Terrace, BC',
        }
      });
      
      console.log(`✅ Updated template: ${updatedTemplate.name}`);
      console.log(`   - Main Content Title: "${mainContentTitle}"`);
      console.log(`   - Button Text: "${buttonText}"`);
      console.log(`   - Additional Info Title: "${additionalInfoTitle}"`);
      console.log(`   - Closing Title: "${closingTitle}"`);
    }
    
    console.log('\n🎉 All templates updated with proper field structure!');
    console.log('📝 Templates now have content in the correct fields for the editor');
    console.log('🔄 Live preview should now work correctly');
    
  } catch (error) {
    console.log('❌ Error fixing template structure:', error.message);
  }
}

fixTemplateStructure()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

