#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { htmlToText } from '../src/lib/email-template';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Converting email templates to content-only format...');

  const templates = await prisma.campaignTemplate.findMany({
    select: {
      id: true,
      name: true,
      htmlBody: true,
      textBody: true,
    },
  });

  console.log(`Found ${templates.length} templates to convert`);

  let updated = 0;
  for (const template of templates) {
    try {
      // Extract just the content from HTML, removing wrapper elements
      let content = template.htmlBody;
      
      // Remove common wrapper elements but keep the actual content
      content = content
        // Remove full HTML document structure
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<html[^>]*>/gi, '')
        .replace(/<\/html>/gi, '')
        .replace(/<head>.*?<\/head>/gis, '')
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        // Remove style tags
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        // Remove script tags
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        // Remove meta tags
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<title[^>]*>.*?<\/title>/gi, '')
        // Remove div wrappers but keep content
        .replace(/<div[^>]*class="[^"]*email-container[^"]*"[^>]*>/gi, '')
        .replace(/<div[^>]*class="[^"]*header[^"]*"[^>]*>.*?<\/div>/gis, '')
        .replace(/<div[^>]*class="[^"]*content[^"]*"[^>]*>/gi, '')
        .replace(/<div[^>]*class="[^"]*footer[^"]*"[^>]*>.*?<\/div>/gis, '')
        .replace(/<div[^>]*class="[^"]*body[^"]*"[^>]*>/gi, '')
        .replace(/<div[^>]*class="[^"]*greeting[^"]*"[^>]*>/gi, '')
        // Remove closing divs
        .replace(/<\/div>/g, '')
        // Clean up extra whitespace
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // If we have textBody, use it as the plain text version
      let textContent = template.textBody;
      if (!textContent) {
        textContent = htmlToText(content);
      }

      // Update the template
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          htmlBody: content,
          textBody: textContent,
        },
      });

      updated++;
      console.log(`✅ Updated: ${template.name}`);
    } catch (error) {
      console.error(`❌ Failed to update ${template.name}:`, error);
    }
  }

  console.log(`\n🎉 Conversion complete! Updated ${updated} of ${templates.length} templates`);
  console.log('\n📝 Templates now store content-only format:');
  console.log('   - htmlBody: Just the message content (no wrapper HTML)');
  console.log('   - textBody: Plain text version of the content');
  console.log('   - Global template handles styling and structure');
}

main()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });


