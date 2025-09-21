import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTemplateContentStructure() {
  try {
    console.log('🔧 Fixing template content structure...\n');

    // Get all templates
    const templates = await prisma.campaignTemplate.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
        htmlBody: true,
        textBody: true,
      },
    });

    console.log(`Found ${templates.length} templates to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const template of templates) {
      console.log(`Processing: ${template.name}`);
      
      // Extract content from HTML body
      let contentOnly = extractContentFromHTML(template.htmlBody);
      
      // If no content extracted, use the original
      if (!contentOnly || contentOnly.trim().length < 10) {
        console.log(`  ⚠️  Could not extract content, keeping original`);
        skippedCount++;
        continue;
      }

      // Fix variable names
      contentOnly = contentOnly
        .replace(/\{\{rsvp_link\}\}/g, '{{invite_link}}')
        .replace(/\{\{business_name\}\}/g, '{{business_name}}')
        .replace(/\{\{business_id\}\}/g, '{{business_id}}');

      // Update template with content-only HTML
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          htmlBody: contentOnly,
          textBody: template.textBody?.replace(/\{\{rsvp_link\}\}/g, '{{invite_link}}') || null,
        },
      });

      console.log(`  ✅ Updated to content-only format (${contentOnly.length} chars)`);
      updatedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} templates`);
    console.log(`   Skipped: ${skippedCount} templates`);
    console.log(`   Total: ${templates.length} templates`);

  } catch (error) {
    console.error('Error fixing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function extractContentFromHTML(html: string): string {
  // Try to extract content from various HTML structures
  
  // Method 1: Extract from div with content class
  const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s);
  if (contentMatch) {
    return cleanHTML(contentMatch[1]);
  }

  // Method 2: Extract from div with padding style (likely content area)
  const paddingMatch = html.match(/<div[^>]*style="[^"]*padding[^"]*"[^>]*>(.*?)<\/div>/s);
  if (paddingMatch) {
    return cleanHTML(paddingMatch[1]);
  }

  // Method 3: Extract paragraphs
  const paragraphs = html.match(/<p[^>]*>(.*?)<\/p>/gs);
  if (paragraphs && paragraphs.length > 2) {
    return paragraphs.map(p => cleanHTML(p)).join('\n\n');
  }

  // Method 4: If it looks like it's already content-only, return as-is
  if (!html.includes('<!DOCTYPE') && !html.includes('<html') && !html.includes('<head')) {
    return cleanHTML(html);
  }

  return '';
}

function cleanHTML(html: string): string {
  return html
    // Remove script and style tags
    .replace(/<script[^>]*>.*?<\/script>/gs, '')
    .replace(/<style[^>]*>.*?<\/style>/gs, '')
    // Remove tracking pixels
    .replace(/<img[^>]*pixel[^>]*>/gi, '')
    .replace(/<img[^>]*tracking[^>]*>/gi, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

fixTemplateContentStructure();
