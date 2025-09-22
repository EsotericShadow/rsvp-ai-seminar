import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Campaign configurations
const campaignConfigs = [
  // High-Value Industries (50+ members)
  {
    name: "Construction & Building",
    description: "AI solutions for construction companies - equipment maintenance, safety, project management",
    industryKeywords: ["construction", "building", "contractor", "excavation", "concrete"],
    targetAudience: "Construction & Building",
    priority: "high"
  },
  {
    name: "Mining & Natural Resources", 
    description: "AI solutions for mining operations - predictive maintenance, safety, efficiency optimization",
    industryKeywords: ["mining", "natural resources", "quarry", "aggregate", "mineral"],
    targetAudience: "Mining & Natural Resources",
    priority: "high"
  },
  {
    name: "Transportation & Logistics",
    description: "AI solutions for transportation companies - fleet maintenance, route optimization, fuel efficiency",
    industryKeywords: ["transportation", "logistics", "trucking", "hauling", "delivery"],
    targetAudience: "Transportation & Logistics", 
    priority: "high"
  },
  {
    name: "Food & Beverage",
    description: "AI solutions for food businesses - inventory management, waste reduction, demand forecasting",
    industryKeywords: ["food", "beverage", "restaurant", "catering", "bakery"],
    targetAudience: "Food & Beverage",
    priority: "high"
  },
  {
    name: "Professional Services",
    description: "AI solutions for professional services - client management, document processing, efficiency",
    industryKeywords: ["professional", "consulting", "accounting", "legal", "advisory"],
    targetAudience: "Professional Services",
    priority: "high"
  },
  
  // Medium-Value Groups (50+ members combined)
  {
    name: "Technology & Business Services",
    description: "AI solutions for tech and business services - automation, client management, efficiency",
    industryKeywords: ["technology", "software", "office", "business services", "consulting"],
    targetAudience: "Technology & Business Services",
    priority: "medium"
  },
  {
    name: "Healthcare & Wellness",
    description: "AI solutions for healthcare and wellness - patient management, scheduling, efficiency",
    industryKeywords: ["healthcare", "medical", "wellness", "fitness", "health"],
    targetAudience: "Healthcare & Wellness", 
    priority: "medium"
  },
  {
    name: "Retail & Entertainment",
    description: "AI solutions for retail and entertainment - customer experience, inventory, scheduling",
    industryKeywords: ["retail", "e-commerce", "entertainment", "recreation", "shopping"],
    targetAudience: "Retail & Entertainment",
    priority: "medium"
  },
  {
    name: "Hospitality & Personal Care",
    description: "AI solutions for hospitality and personal care - customer service, scheduling, efficiency",
    industryKeywords: ["hospitality", "hotel", "accommodation", "beauty", "personal care"],
    targetAudience: "Hospitality & Personal Care",
    priority: "medium"
  },
  {
    name: "Financial & Legal Services",
    description: "AI solutions for financial and legal services - document processing, client management, efficiency",
    industryKeywords: ["financial", "legal", "real estate", "insurance", "banking"],
    targetAudience: "Financial & Legal Services",
    priority: "medium"
  },
  
  // Low-Value Generic
  {
    name: "Other Industries",
    description: "AI solutions for general business applications - efficiency, cost savings, automation",
    industryKeywords: ["other", "miscellaneous", "general"],
    targetAudience: "Other Industries",
    priority: "low"
  }
];

// Email template configurations
const emailTemplates = [
  {
    name: "Problem Focused - Equipment Failures",
    subject: "Stop equipment failures before they happen - Free AI session Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>Last week, a local [industry] company lost $15,000 in downtime because their [equipment] broke down unexpectedly. The repair cost $3,000, but the lost time cost them $12,000 in delayed [projects/operations].</p>
        
        <p>What if you could predict equipment failures before they happen?</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures, saving you thousands in downtime costs.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      Last week, a local [industry] company lost $15,000 in downtime because their [equipment] broke down unexpectedly. The repair cost $3,000, but the lost time cost them $12,000 in delayed [projects/operations].
      
      What if you could predict equipment failures before they happen?
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures, saving you thousands in downtime costs.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Coffee Hook - Problem",
    subject: "Free coffee: Stop equipment failures before they happen - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>How often does your [equipment] break down unexpectedly?</p>
        
        <p>Last month, I talked to 15 [industry] companies in Northern BC. Every single one said unexpected equipment failures are their biggest cost and stress point.</p>
        
        <p>What if you could predict these failures before they happen?</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures, saving you thousands in downtime costs.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      How often does your [equipment] break down unexpectedly?
      
      Last month, I talked to 15 [industry] companies in Northern BC. Every single one said unexpected equipment failures are their biggest cost and stress point.
      
      What if you could predict these failures before they happen?
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures, saving you thousands in downtime costs.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Story Based - Local Success",
    subject: "Free coffee: How AI saved a local business $20,000 - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I was talking to a local [industry] operation last month. They were spending $20,000 every quarter on emergency [equipment] repairs because they couldn't predict when things would break down.</p>
        
        <p>Then they started using AI to predict maintenance needs. Now they save $15,000 every quarter by fixing things before they break.</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to implement similar systems in your business.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I was talking to a local [industry] operation last month. They were spending $20,000 every quarter on emergency [equipment] repairs because they couldn't predict when things would break down.
      
      Then they started using AI to predict maintenance needs. Now they save $15,000 every quarter by fixing things before they break.
      
      I'm hosting a free AI session on October 23rd about how to implement similar systems in your business.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Benefit Focused - Save Money",
    subject: "Free coffee: Save $10,000+ on equipment maintenance - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>Want to save $10,000+ on [equipment] maintenance this year?</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen, saving you thousands in downtime costs.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      Want to save $10,000+ on [equipment] maintenance this year?
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen, saving you thousands in downtime costs.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Local Connection - Northern BC",
    subject: "Free coffee: What Northern BC businesses are learning about AI - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I've been working with Northern BC businesses for the past year, helping them implement AI solutions that save time and money.</p>
        
        <p>The results have been incredible - companies are saving thousands on maintenance, improving safety, and increasing efficiency.</p>
        
        <p>I'm hosting a free AI session on October 23rd to share what I've learned and how you can implement similar solutions.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I've been working with Northern BC businesses for the past year, helping them implement AI solutions that save time and money.
      
      The results have been incredible - companies are saving thousands on maintenance, improving safety, and increasing efficiency.
      
      I'm hosting a free AI session on October 23rd to share what I've learned and how you can implement similar solutions.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Social Proof - Join Others",
    subject: "Join 50+ [industry] businesses at our AI session - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>Over 50 [industry] businesses have already RSVP'd for our free AI session on October 23rd.</p>
        
        <p>They're coming to learn how to predict equipment failures, optimize maintenance schedules, and save thousands on operational costs.</p>
        
        <p>Don't miss out on what your competitors are learning about AI.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      Over 50 [industry] businesses have already RSVP'd for our free AI session on October 23rd.
      
      They're coming to learn how to predict equipment failures, optimize maintenance schedules, and save thousands on operational costs.
      
      Don't miss out on what your competitors are learning about AI.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Final Reminder - Last Chance",
    subject: "Last chance: Free AI session tomorrow - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>Tomorrow is our free AI session, and I wanted to make sure you didn't miss out.</p>
        
        <p>We'll cover how to predict equipment failures, optimize maintenance schedules, and save thousands on operational costs.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      Tomorrow is our free AI session, and I wanted to make sure you didn't miss out.
      
      We'll cover how to predict equipment failures, optimize maintenance schedules, and save thousands on operational costs.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  }
];

// Industry-specific content mappings
const industryContent = {
  "Construction & Building": {
    equipment: "excavator, bulldozer, crane",
    projects: "projects",
    operations: "construction projects"
  },
  "Mining & Natural Resources": {
    equipment: "drill, conveyor, crusher",
    projects: "operations", 
    operations: "mining operations"
  },
  "Transportation & Logistics": {
    equipment: "truck, trailer, forklift",
    projects: "deliveries",
    operations: "transportation operations"
  },
  "Food & Beverage": {
    equipment: "refrigerator, oven, mixer",
    projects: "service",
    operations: "food service operations"
  },
  "Professional Services": {
    equipment: "computer, printer, phone system",
    projects: "client work",
    operations: "business operations"
  },
  "Technology & Business Services": {
    equipment: "server, computer, network equipment",
    projects: "client projects",
    operations: "business operations"
  },
  "Healthcare & Wellness": {
    equipment: "medical equipment, computer, phone system",
    projects: "patient care",
    operations: "healthcare operations"
  },
  "Retail & Entertainment": {
    equipment: "POS system, computer, display",
    projects: "sales",
    operations: "retail operations"
  },
  "Hospitality & Personal Care": {
    equipment: "booking system, computer, phone",
    projects: "service",
    operations: "hospitality operations"
  },
  "Financial & Legal Services": {
    equipment: "computer, printer, phone system",
    projects: "client work",
    operations: "business operations"
  },
  "Other Industries": {
    equipment: "equipment",
    projects: "operations",
    operations: "business operations"
  }
};

async function createIndustryCampaigns() {
  console.log('🚀 Creating 11 industry-specific campaigns with 7-email sequences...');

  try {
    // Delete existing campaigns and templates first
    await prisma.campaign.deleteMany({});
    await prisma.campaignTemplate.deleteMany({});
    await prisma.campaignSchedule.deleteMany({});

    console.log('✅ Cleaned up existing campaigns and templates');

    for (const config of campaignConfigs) {
      console.log(`\n📧 Creating campaign: ${config.name}`);

      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: config.name,
          description: config.description,
          status: 'DRAFT'
        }
      });

      // Create campaign settings
      await prisma.campaignSettings.create({
        data: {
          campaignId: campaign.id,
          windows: {
            industryFocus: config.industryKeywords,
            targetAudience: config.targetAudience,
            priority: config.priority,
            eventDate: '2025-10-23T18:00:00Z',
            venue: 'Sunshine Inn Terrace — Jasmine Room',
            address: '4812 Hwy 16, Terrace, BC, Canada',
            capacity: 50,
            includeWaitlist: true
          }
        }
      });

      console.log(`  ✅ Created campaign: ${campaign.name} (ID: ${campaign.id})`);

      // Create email templates for this campaign
      const industryContentMap = industryContent[config.name as keyof typeof industryContent] || industryContent["Other Industries"];
      const campaignTemplates = [];
      
      for (let i = 0; i < emailTemplates.length; i++) {
        const template = emailTemplates[i];
        
        // Customize content for this industry
        let customizedHtmlBody = template.htmlBody
          .replace(/\[industry\]/g, config.name.toLowerCase())
          .replace(/\[equipment\]/g, industryContentMap.equipment)
          .replace(/\[projects\]/g, industryContentMap.projects)
          .replace(/\[operations\]/g, industryContentMap.operations);

        let customizedTextBody = template.textBody
          .replace(/\[industry\]/g, config.name.toLowerCase())
          .replace(/\[equipment\]/g, industryContentMap.equipment)
          .replace(/\[projects\]/g, industryContentMap.projects)
          .replace(/\[operations\]/g, industryContentMap.operations);

        const campaignTemplate = await prisma.campaignTemplate.create({
          data: {
            name: `${config.name} - ${template.name}`,
            subject: template.subject.replace(/\[industry\]/g, config.name.toLowerCase()),
            htmlBody: customizedHtmlBody,
            textBody: customizedTextBody
          }
        });

        campaignTemplates.push(campaignTemplate);
        console.log(`    ✅ Created template: ${campaignTemplate.name}`);
      }

      // Create campaign schedule (7 emails from Sept 23 to Oct 22)
      const scheduleDates = [
        '2024-09-23T09:00:00Z', // Email 1: Sept 23
        '2024-09-30T09:00:00Z', // Email 2: Sept 30  
        '2024-10-07T09:00:00Z', // Email 3: Oct 7
        '2024-10-14T09:00:00Z', // Email 4: Oct 14
        '2024-10-17T09:00:00Z', // Email 5: Oct 17
        '2024-10-20T09:00:00Z', // Email 6: Oct 20
        '2024-10-22T09:00:00Z'  // Email 7: Oct 22
      ];


      // Get a default audience group (we'll use the first available one)
      const defaultGroup = await prisma.audienceGroup.findFirst();
      if (!defaultGroup) {
        console.log(`    ⚠️ No audience groups found, skipping schedule creation`);
        continue;
      }

      for (let i = 0; i < scheduleDates.length && i < campaignTemplates.length; i++) {
        const schedule = await prisma.campaignSchedule.create({
          data: {
            name: `${config.name} - Email ${i + 1}`,
            campaignId: campaign.id,
            templateId: campaignTemplates[i].id,
            groupId: defaultGroup.id,
            status: 'DRAFT',
            sendAt: new Date(scheduleDates[i]),
            stepOrder: i + 1
          }
        });

        console.log(`    ✅ Scheduled email ${i + 1} for ${scheduleDates[i]}`);
      }
    }

    console.log('\n🎉 Successfully created all 11 industry campaigns!');
    console.log('\n📊 Summary:');
    console.log('  • 11 campaigns created');
    console.log('  • 77 email templates created (7 per campaign)');
    console.log('  • 77 scheduled emails (7 per campaign)');
    console.log('  • Campaigns scheduled from Sept 23 to Oct 22');
    console.log('  • Event date: October 23rd, 2025');

  } catch (error) {
    console.error('❌ Error creating campaigns:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createIndustryCampaigns()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
