import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDifferentVariantContent() {
  try {
    console.log('🎨 Creating different content for A/B/C variants...\n');

    // Get all templates grouped by industry and email number
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: [
        { name: 'asc' },
      ],
    });

    // Group templates by industry and email number
    const groupedTemplates = templates.reduce((groups, template) => {
      const parts = template.name.split(' - ');
      const industry = parts[0];
      const emailMatch = parts.find(p => p.includes('Email'));
      const emailNum = emailMatch ? emailMatch.split(' ')[1] : '0';
      
      const groupKey = `${industry} - Email ${emailNum}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(template);
      return groups;
    }, {} as Record<string, typeof templates>);

    let updatedCount = 0;

    for (const [groupKey, groupTemplates] of Object.entries(groupedTemplates)) {
      if (groupTemplates.length < 2) continue; // Skip if no variants
      
      console.log(`Processing: ${groupKey} (${groupTemplates.length} variants)`);
      
      // Create different content for each variant
      const variantContents = createVariantContents(groupKey, groupTemplates.length);
      
      for (let i = 0; i < groupTemplates.length; i++) {
        const template = groupTemplates[i];
        const variantContent = variantContents[i];
        
        if (variantContent) {
          await prisma.campaignTemplate.update({
            where: { id: template.id },
            data: {
              htmlBody: variantContent,
            },
          });
          
          console.log(`  ✅ Updated ${template.name.split(' - ').slice(-1)[0]}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} templates`);
    console.log(`   Groups processed: ${Object.keys(groupedTemplates).length}`);

  } catch (error) {
    console.error('Error creating variant content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createVariantContents(groupKey: string, variantCount: number): string[] {
  const [industry, emailInfo] = groupKey.split(' - Email ');
  const emailNum = parseInt(emailInfo);
  
  // Base content that varies by industry and email number
  const baseContents = {
    // Email 1 - Introduction
    1: {
      Construction: {
        A: `<p>I'm Gabriel Lacroix from Evergreen Web Solutions here in Terrace. I've been developing AI solutions for Northern BC businesses, and what I've discovered is fascinating.</p>

<p>There are practical tools that can automate routine tasks without replacing people. From construction companies optimizing material deliveries to restaurants planning food orders, the applications are real.</p>

<p>I'm sharing these insights at a free session on October 23rd at the Sunshine Inn. You'll hear about real tools and see demonstrations of AI solutions that work in our Northern BC business environment.</p>

<p>This isn't about replacing people - it's about giving you more time for the work that matters.</p>`,
        
        B: `<p>Quick hello from Terrace. I'm Gabriel Lacroix, and I've been working with Northern BC businesses to implement practical AI solutions.</p>

<p>The results have been remarkable. Local companies are saving hours every week on tasks like inventory management, scheduling, and data analysis.</p>

<p>I'm hosting a free informational session on October 23rd to share these tools with other Northern BC businesses. The focus is on solutions that actually work in our environment.</p>

<p>Join us for coffee, networking, and practical demonstrations of AI tools you can implement immediately.</p>`,
        
        C: `<p>What I've learned building AI solutions for Northern BC businesses might surprise you.</p>

<p>Most AI tools are designed for big cities, but I've been adapting them for our unique challenges. From weather-dependent scheduling to remote location logistics, the applications are endless.</p>

<p>I'm hosting a free session on October 23rd to share these discoveries. You'll see live demonstrations and learn about tools that can streamline your operations.</p>

<p>This is about practical solutions, not tech hype.</p>`
      }
    }
  };

  // For now, create simple variations
  const variants = [];
  
  for (let i = 0; i < variantCount; i++) {
    let content = '';
    
    if (emailNum === 1) {
      // Introduction email variations
      const approaches = [
        `<p>I'm Gabriel Lacroix from Evergreen Web Solutions here in Terrace. I've been developing AI solutions for Northern BC businesses, and what I've discovered is fascinating.</p>

<p>There are practical tools that can automate routine tasks without replacing people. From ${industry.toLowerCase()} companies optimizing their operations to restaurants planning food orders, the applications are real.</p>

<p>I'm sharing these insights at a free session on October 23rd at the Sunshine Inn. You'll hear about real tools and see demonstrations of AI solutions that work in our Northern BC business environment.</p>

<p>This isn't about replacing people - it's about giving you more time for the work that matters.</p>`,

        `<p>Quick hello from Terrace. I'm Gabriel Lacroix, and I've been working with Northern BC businesses to implement practical AI solutions.</p>

<p>The results have been remarkable. Local companies are saving hours every week on tasks like inventory management, scheduling, and data analysis.</p>

<p>I'm hosting a free informational session on October 23rd to share these tools with other Northern BC businesses. The focus is on solutions that actually work in our environment.</p>

<p>Join us for coffee, networking, and practical demonstrations of AI tools you can implement immediately.</p>`,

        `<p>What I've learned building AI solutions for Northern BC businesses might surprise you.</p>

<p>Most AI tools are designed for big cities, but I've been adapting them for our unique challenges. From weather-dependent scheduling to remote location logistics, the applications are endless.</p>

<p>I'm hosting a free session on October 23rd to share these discoveries. You'll see live demonstrations and learn about tools that can streamline your operations.</p>

<p>This is about practical solutions, not tech hype.</p>`
      ];
      
      content = approaches[i] || approaches[0];
    } else if (emailNum === 7) {
      // Final reminder variations
      const reminders = [
        `<p>Last chance: Our free AI tools session is tomorrow at 6 PM.</p>

<p>We still have spots available and would love to see you there. This session covers practical AI applications that can help streamline your ${industry.toLowerCase()} operations.</p>

<p>Join us tomorrow evening for coffee, networking, and valuable insights you can implement immediately.</p>

<p>RSVP here: {{invite_link}}</p>`,

        `<p>Don't miss out: Our AI tools session is tomorrow at the Sunshine Inn.</p>

<p>We'll cover real solutions for Northern BC businesses, including practical tools you can use right away.</p>

<p>Free coffee, networking, and actionable insights - what's not to love?</p>

<p>RSVP: {{invite_link}}</p>`,

        `<p>Tomorrow: Free session on AI tools for ${industry.toLowerCase()} businesses.</p>

<p>This is your last opportunity to join us for this valuable session. We'll cover practical applications and real-world examples.</p>

<p>See you tomorrow at 6 PM!</p>

<p>RSVP: {{invite_link}}</p>`
      ];
      
      content = reminders[i] || reminders[0];
    } else {
      // Other emails - create industry-specific content
      content = createIndustrySpecificContent(industry, emailNum, i);
    }
    
    variants.push(content);
  }
  
  return variants;
}

function createIndustrySpecificContent(industry: string, emailNum: number, variantIndex: number): string {
  const industryTopics = {
    'Construction & Building': {
      2: ['Project Efficiency', 'Equipment Management', 'Safety Protocols'],
      3: ['Safety Compliance', 'Weather Planning', 'Cost Optimization'],
      4: ['Local Networking', 'Supplier Relations', 'Community Building'],
      5: ['Cost Savings', 'Resource Management', 'Efficiency Gains'],
      6: ['Weather Planning', 'Seasonal Operations', 'Risk Management']
    },
    'Food & Beverage': {
      2: ['Customer Service', 'Menu Optimization', 'Staff Training'],
      3: ['Staff Scheduling', 'Inventory Management', 'Quality Control'],
      4: ['Restaurant Network', 'Local Suppliers', 'Community Events'],
      5: ['Menu Optimization', 'Cost Control', 'Customer Retention'],
      6: ['Seasonal Planning', 'Holiday Preparations', 'Trend Analysis']
    }
  };

  const topics = industryTopics[industry as keyof typeof industryTopics]?.[emailNum as keyof typeof industryTopics['Construction & Building']] || ['Business Operations', 'Process Improvement', 'Growth Planning'];
  
  const topic = topics[variantIndex] || topics[0];
  
  return `<p>Following up on our AI tools session invitation.</p>

<p>For ${industry.toLowerCase()} businesses like yours, ${topic.toLowerCase()} can be significantly improved with the right AI tools.</p>

<p>At our session on October 23rd, we'll cover practical applications specifically relevant to your industry.</p>

<p>Join us to learn how other Northern BC ${industry.toLowerCase()} businesses are using these tools.</p>

<p>RSVP: {{invite_link}}</p>`;
}

createDifferentVariantContent();

