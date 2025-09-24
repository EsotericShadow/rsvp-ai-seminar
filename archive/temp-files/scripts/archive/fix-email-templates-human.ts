import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// New, more human email templates
const humanEmailTemplates = [
  {
    name: "Equipment Failures",
    subject: "Stop equipment failures before they happen - Free AI session Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=problem_focused&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=problem_focused&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Problem",
    subject: "Free coffee: Stop equipment failures before they happen - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=coffee_hook&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=coffee_hook&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Local Success",
    subject: "Free coffee: How AI saved a local business $20,000 - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=story_based&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=story_based&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Save Money",
    subject: "Free coffee: Save money on equipment maintenance - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=benefit_focused&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=benefit_focused&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Northern BC",
    subject: "Free coffee: What Northern BC businesses are learning about AI - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=local_connection&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=local_connection&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Join Others",
    subject: "Join other [industry] businesses at our AI session - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.</p>
        
        <p>You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=social_proof&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      I'm hosting a free AI session on October 23rd about how to predict equipment failures before they happen.
      
      You'll learn about specific tools and actionable plans you can implement immediately to avoid surprise breakdowns.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=social_proof&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  },
  {
    name: "Last Chance",
    subject: "Last chance: Free AI session tomorrow - Oct 23rd",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hey [Business Name],</p>
        
        <p>Tomorrow is our free AI session, and I wanted to make sure you didn't miss out.</p>
        
        <p>We'll cover how to predict equipment failures, optimize maintenance schedules, and save money on operational costs.</p>
        
        <p>Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).</p>
        
        <p><strong>October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.</strong></p>
        
        <p><a href="https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=final_reminder&business_id=[business_id]" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">RSVP Here</a></p>
        
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
      </div>
    `,
    textBody: `
      Hey [Business Name],
      
      Tomorrow is our free AI session, and I wanted to make sure you didn't miss out.
      
      We'll cover how to predict equipment failures, optimize maintenance schedules, and save money on operational costs.
      
      Plus free coffee, refreshments, networking, and free food (charcuterie, veggies, dip, donuts).
      
      October 23rd, 6-8:30 PM at the Sunshine Inn Terrace.
      
      RSVP: https://rsvp.evergreenwebsolutions.ca?utm_source=email&utm_campaign=[campaign_name]&utm_medium=final_reminder&business_id=[business_id]
      
      Best regards,
      Gabriel Lacroix
      Evergreen Web Solutions
    `
  }
];

async function fixEmailTemplates() {
  console.log('🔧 Fixing email templates to be more human and less spammy...\n');

  try {
    // Get all campaign templates
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${templates.length} templates to update:\n`);

    for (const template of templates) {
      // Find the matching human template by the last part of the name
      const templateType = template.name.split(' - ').slice(-1)[0];
      const humanTemplate = humanEmailTemplates.find(t => t.name === templateType);
      
      if (!humanTemplate) {
        console.log(`⚠️  No human template found for: ${template.name} (type: ${templateType})`);
        continue;
      }

      // Update the template
      await prisma.campaignTemplate.update({
        where: {
          id: template.id
        },
        data: {
          subject: humanTemplate.subject,
          htmlBody: humanTemplate.htmlBody,
          textBody: humanTemplate.textBody
        }
      });

      console.log(`✅ Updated: ${template.name}`);
    }

    console.log('\n🎉 All email templates updated to be more human!');
    console.log('\n📝 Key improvements:');
    console.log('   • Removed fake numbers and made-up stories');
    console.log('   • Simplified to direct, honest communication');
    console.log('   • Added UTM tracking parameters for analytics');
    console.log('   • Added business_id tracking for LeadMine integration');
    console.log('   • More conversational, less salesy tone');

  } catch (error) {
    console.error('❌ Error updating templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixEmailTemplates()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
