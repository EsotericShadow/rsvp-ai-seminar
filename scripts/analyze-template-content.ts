import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeTemplateContent() {
  try {
    console.log('🔍 Analyzing template content structure...\n');

    // Get a few sample templates
    const templates = await prisma.campaignTemplate.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        subject: true,
        htmlBody: true,
        textBody: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${templates.length} sample templates:\n`);

    templates.forEach((template, index) => {
      console.log(`📧 Template ${index + 1}: ${template.name}`);
      console.log(`   Subject: ${template.subject}`);
      console.log(`   HTML Body Length: ${template.htmlBody.length} characters`);
      console.log(`   Text Body Length: ${template.textBody?.length || 0} characters`);
      
      // Show first 200 characters of HTML
      console.log(`   HTML Preview: ${template.htmlBody.substring(0, 200)}...`);
      
      // Check what variables are used
      const htmlVariables = template.htmlBody.match(/\{\{[^}]+\}\}/g) || [];
      const textVariables = template.textBody?.match(/\{\{[^}]+\}\}/g) || [];
      
      console.log(`   HTML Variables: ${htmlVariables.join(', ')}`);
      console.log(`   Text Variables: ${textVariables.join(', ')}`);
      console.log('');
    });

    // Check if templates contain full HTML structure
    const fullHtmlTemplates = templates.filter(t => 
      t.htmlBody.includes('<!DOCTYPE') || 
      t.htmlBody.includes('<html') || 
      t.htmlBody.includes('<head') ||
      t.htmlBody.includes('<body')
    );

    console.log(`📊 Analysis Summary:`);
    console.log(`   Templates with full HTML structure: ${fullHtmlTemplates.length}/${templates.length}`);
    
    if (fullHtmlTemplates.length > 0) {
      console.log(`   ⚠️  ISSUE: Some templates contain full HTML structure`);
      console.log(`   💡 These should be converted to content-only templates`);
    }

    // Check for duplicate content
    const htmlBodies = templates.map(t => t.htmlBody);
    const uniqueHtmlBodies = [...new Set(htmlBodies)];
    
    if (uniqueHtmlBodies.length < htmlBodies.length) {
      console.log(`   ⚠️  ISSUE: Duplicate HTML content found`);
      console.log(`   💡 Multiple templates have identical content`);
    }

  } catch (error) {
    console.error('Error analyzing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeTemplateContent();
