const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function improveTemplateParsing() {
  console.log('🔍 Improving template parsing to extract all sections...');
  
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
    
    console.log(`📧 Found ${templates.length} templates to improve`);
    
    for (const template of templates) {
      console.log(`\n🔧 Improving template: ${template.name}`);
      
      const htmlBody = template.htmlBody;
      
      // Better parsing strategy - split by h3 tags to get sections
      const sections = htmlBody.split(/<h3>/);
      
      // Main content (everything before first h3)
      const mainSection = sections[0] || '';
      const mainContentTitleMatch = mainSection.match(/<h2>(.*?)<\/h2>/);
      const mainContentTitle = mainContentTitleMatch ? mainContentTitleMatch[1] : '';
      
      // Remove the h2 title and hello paragraph from main content
      const cleanMainContent = mainSection
        .replace(/<h2>.*?<\/h2>\s*/, '')
        .replace(/<p>Hello \{\{business_name\}\},<\/p>\s*/, '')
        .trim();
      
      // Parse additional sections
      let additionalInfoTitle = '';
      let additionalInfoBody = '';
      let closingTitle = '';
      let closingMessage = '';
      
      // Look for additional info section (usually the first h3 after main content)
      if (sections[1]) {
        const additionalSection = sections[1];
        const additionalMatch = additionalSection.match(/^(.*?)<\/h3>\s*<p>(.*?)<\/p>/s);
        if (additionalMatch) {
          additionalInfoTitle = additionalMatch[1];
          additionalInfoBody = additionalMatch[2];
        }
      }
      
      // Look for closing section (usually the last h3)
      if (sections[2]) {
        const closingSection = sections[2];
        const closingMatch = closingSection.match(/^(.*?)<\/h3>\s*<p>(.*?)<\/p>/s);
        if (closingMatch) {
          closingTitle = closingMatch[1];
          closingMessage = closingMatch[2];
        }
      }
      
      // Extract button text
      const buttonMatch = htmlBody.match(/<a href="\{\{invite_link\}\}".*?>(.*?)<\/a>/);
      const buttonText = buttonMatch ? buttonMatch[1] : 'View details & RSVP';
      
      console.log(`   📝 Parsed sections:`);
      console.log(`      - Main Title: "${mainContentTitle}"`);
      console.log(`      - Additional Title: "${additionalInfoTitle}"`);
      console.log(`      - Closing Title: "${closingTitle}"`);
      console.log(`      - Button: "${buttonText}"`);
      
      // Update the template with improved parsing
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          main_content_title: mainContentTitle,
          main_content_body: cleanMainContent,
          button_text: buttonText,
          additional_info_title: additionalInfoTitle,
          additional_info_body: additionalInfoBody,
          closing_title: closingTitle,
          closing_message: closingMessage,
        }
      });
      
      console.log(`✅ Updated template: ${template.name}`);
    }
    
    console.log('\n🎉 All templates improved with better parsing!');
    console.log('📝 Templates now have all sections properly extracted');
    console.log('🔄 Live preview should show all content sections correctly');
    
  } catch (error) {
    console.log('❌ Error improving template parsing:', error.message);
  }
}

improveTemplateParsing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
