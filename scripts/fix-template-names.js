const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Template name mappings to fix the grouping system
const templateNameMappings = [
  // Email 1 (September 25, 2025 - Awareness Introduction)
  {
    oldName: "Awareness Introduction A",
    newName: "AI Event - Email 1 - Variant A",
    subject: "Simple Ways AI Can Help Your Business"
  },
  {
    oldName: "Awareness Introduction B", 
    newName: "AI Event - Email 1 - Variant B",
    subject: "Get Started with AI for Everyday Business"
  },
  {
    oldName: "Awareness Introduction C",
    newName: "AI Event - Email 1 - Variant C", 
    subject: "AI Tools to Simplify Your Operations"
  },

  // Email 2 (October 1, 2025 - Benefits Highlight)
  {
    oldName: "Benefits Highlight A",
    newName: "AI Event - Email 2 - Variant A",
    subject: "How AI Saves Time in Business Tasks"
  },
  {
    oldName: "Benefits Highlight B",
    newName: "AI Event - Email 2 - Variant B", 
    subject: "Cut Costs Using Practical AI"
  },
  {
    oldName: "Benefits Highlight C",
    newName: "AI Event - Email 2 - Variant C",
    subject: "Better Decisions from AI Tools"
  },

  // Email 3 (October 7, 2025 - Value Proposition)
  {
    oldName: "Value Proposition A",
    newName: "AI Event - Email 3 - Variant A",
    subject: "Unlock Easy AI Wins for Your Business"
  },
  {
    oldName: "Value Proposition B",
    newName: "AI Event - Email 3 - Variant B",
    subject: "Practical AI to Give Your Business an Edge"
  },
  {
    oldName: "Value Proposition C", 
    newName: "AI Event - Email 3 - Variant C",
    subject: "AI Insights That Pay Off Quickly"
  },

  // Email 4 (October 14, 2025 - Social Proof)
  {
    oldName: "Social Proof A",
    newName: "AI Event - Email 4 - Variant A",
    subject: "Hear from Others on Helpful Tech Support"
  },
  {
    oldName: "Social Proof B",
    newName: "AI Event - Email 4 - Variant B",
    subject: "A Recommendation Worth Noting"
  },
  {
    oldName: "Social Proof C",
    newName: "AI Event - Email 4 - Variant C", 
    subject: "Positive Words on Digital Help"
  },

  // Email 5 (October 18, 2025 - Engagement Build)
  {
    oldName: "Engagement Build A",
    newName: "AI Event - Email 5 - Variant A",
    subject: "Questions AI Can Answer for You"
  },
  {
    oldName: "Engagement Build B",
    newName: "AI Event - Email 5 - Variant B",
    subject: "Imagine AI Streamlining Your Day"
  },
  {
    oldName: "Engagement Build C",
    newName: "AI Event - Email 5 - Variant C",
    subject: "AI Possibilities to Consider"
  },

  // Email 6 (October 21, 2025 - Gentle Reminder)
  {
    oldName: "Gentle Reminder A",
    newName: "AI Event - Email 6 - Variant A",
    subject: "Event Nears: AI Tips Await"
  },
  {
    oldName: "Gentle Reminder B",
    newName: "AI Event - Email 6 - Variant B",
    subject: "Quick Note on Upcoming AI Event"
  },
  {
    oldName: "Gentle Reminder C",
    newName: "AI Event - Email 6 - Variant C",
    subject: "AI Event This Week: Still Open"
  },

  // Email 7 (October 23, 2025 - Day Of Prompt)
  {
    oldName: "Day Of Prompt A",
    newName: "AI Event - Email 7 - Variant A",
    subject: "Today: Dive into AI at 5 PM"
  },
  {
    oldName: "Day Of Prompt B",
    newName: "AI Event - Email 7 - Variant B",
    subject: "AI Session Tonight in Terrace"
  },
  {
    oldName: "Day Of Prompt C",
    newName: "AI Event - Email 7 - Variant C",
    subject: "Free AI Event This Evening"
  }
];

async function fixTemplateNames() {
  try {
    console.log('Starting template name fixes...');
    
    for (const mapping of templateNameMappings) {
      // Find the template by old name
      const template = await prisma.campaignTemplate.findFirst({
        where: { name: mapping.oldName }
      });
      
      if (template) {
        // Update the template name
        await prisma.campaignTemplate.update({
          where: { id: template.id },
          data: { name: mapping.newName }
        });
        console.log(`✅ Updated: "${mapping.oldName}" → "${mapping.newName}"`);
      } else {
        console.log(`❌ Template not found: "${mapping.oldName}"`);
      }
    }
    
    console.log('\nTemplate name fixes completed!');
    
    // Verify the templates are now properly grouped
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\nCurrent templates:');
    templates.forEach(template => {
      console.log(`- ${template.name}`);
    });
    
    // Show how they would group
    console.log('\nTemplate groups that will appear in admin:');
    const groups = {};
    templates.forEach(template => {
      const parts = template.name.split(' - ');
      const industry = parts[0] || 'Unknown';
      const emailMatch = parts.find(p => p.includes('Email'));
      const emailNum = emailMatch ? emailMatch.split(' ')[1] : '0';
      const groupKey = `${industry} - Email ${emailNum}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(template.name);
    });
    
    Object.entries(groups).forEach(([groupName, templateNames]) => {
      console.log(`\n${groupName} (${templateNames.length} variants):`);
      templateNames.forEach(name => console.log(`  - ${name}`));
    });
    
  } catch (error) {
    console.error('Error fixing template names:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplateNames();

