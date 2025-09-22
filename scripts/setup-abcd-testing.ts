#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupABCDTesting() {
  console.log('🧪 Setting up A/B/C testing system...');

  try {
    // Get all existing templates
    const templates = await prisma.campaignTemplate.findMany({
      include: {
        schedules: {
          include: {
            campaign: true
          }
        }
      }
    });

    console.log(`📧 Found ${templates.length} existing templates`);

    if (templates.length === 0) {
      console.log('ℹ️  No templates found. Create some templates first to set up A/B/C testing.');
      return;
    }

    // Group templates by industry and email number
    const templateGroups = new Map<string, any[]>();
    
    for (const template of templates) {
      const name = template.name;
      const industryMatch = name.match(/^([^-]+)/);
      const emailMatch = name.match(/Email (\d+)/);
      
      if (industryMatch && emailMatch) {
        const industry = industryMatch[1].trim();
        const emailNumber = emailMatch[1];
        const key = `${industry}|${emailNumber}`;
        
        if (!templateGroups.has(key)) {
          templateGroups.set(key, []);
        }
        templateGroups.get(key)!.push(template);
      }
    }

    console.log(`📊 Found ${templateGroups.size} template groups`);

    // Show what A/B/C testing setup would look like
    for (const [key, groupTemplates] of templateGroups) {
      const [industry, emailNumber] = key.split('|');
      console.log(`\n🏭 ${industry} - Email ${emailNumber}:`);
      console.log(`   ${groupTemplates.length} template(s):`);
      
      for (const template of groupTemplates) {
        const variant = extractVariant(template.name);
        console.log(`   - ${variant}: ${template.name}`);
      }

      if (groupTemplates.length === 1) {
        console.log(`   💡 Could create A/B/C variants for this template`);
      } else if (groupTemplates.length >= 2) {
        console.log(`   ✅ Already has ${groupTemplates.length} variants - A/B/C testing ready!`);
      }
    }

    console.log('\n🎯 A/B/C Testing Setup Complete!');
    console.log('\nTo create A/B/C variants:');
    console.log('1. Go to Admin → Campaign Control → Templates');
    console.log('2. Find a template you want to test');
    console.log('3. Click "Duplicate" to create copies');
    console.log('4. Rename copies to include "Variant A", "Variant B", "Variant C"');
    console.log('5. Modify content in each variant');
    console.log('6. Set up campaigns with these variants');
    console.log('7. The system will automatically monitor and optimize based on RSVP rates');

  } catch (error) {
    console.error('❌ Error setting up A/B/C testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function extractVariant(templateName: string): string {
  if (templateName.includes('Variant A')) return 'Variant A';
  if (templateName.includes('Variant B')) return 'Variant B';
  if (templateName.includes('Variant C')) return 'Variant C';
  return 'Original';
}

setupABCDTesting();


