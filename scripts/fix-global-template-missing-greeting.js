const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixGlobalTemplateMissingGreeting() {
  console.log('🔍 Fixing global template to include greeting_message placeholder...');
  
  try {
    // Get the current global template
    const globalTemplate = await prisma.globalHTMLTemplate.findFirst();
    
    if (!globalTemplate) {
      console.log('❌ No global template found');
      return;
    }
    
    console.log('📧 Current global template found');
    
    // Check if greeting_message placeholder exists
    if (globalTemplate.html.includes('{{greeting_message}}')) {
      console.log('✅ greeting_message placeholder already exists in global template');
      return;
    }
    
    console.log('🔧 Adding greeting_message placeholder to global template...');
    
    // Find the greeting_title section and add greeting_message after it
    const updatedHtml = globalTemplate.html.replace(
      /<h2>\{\{greeting_title\}\}<\/h2>/,
      `<h2>{{greeting_title}}</h2>
                        <p style="margin-top:6px;margin-bottom:12px;">{{greeting_message}}</p>`
    );
    
    // Update the global template
    await prisma.globalHTMLTemplate.update({
      where: { id: globalTemplate.id },
      data: {
        html: updatedHtml
      }
    });
    
    console.log('✅ Global template updated with greeting_message placeholder');
    console.log('🎯 Individual templates should now display greeting_message in live preview');
    
  } catch (error) {
    console.log('❌ Error fixing global template:', error.message);
  }
}

fixGlobalTemplateMissingGreeting()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
