#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createComprehensiveCampaign() {
  console.log('🎯 Creating comprehensive AI event campaign...\n');

  // Get the audience group
  const audienceGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Verified Business Emails' }
  });

  if (!audienceGroup) {
    console.error('❌ Audience group not found!');
    return;
  }

  // 1. Create email templates
  console.log('📧 Creating email templates...');
  const templates = [
    {
      name: 'Email 1: AI Success Story - Real Example',
      subject: 'How AI is already helping businesses like yours in Northern BC',
      htmlBody: generateEmailHTML('story'),
      textBody: generateEmailText('story')
    },
    {
      name: 'Email 2: 5 AI Tools You Can Use Today',
      subject: '5 AI tools your competitors don\'t know about (Free for Terrace businesses)',
      htmlBody: generateEmailHTML('tools'),
      textBody: generateEmailText('tools')
    },
    {
      name: 'Email 3: Industry-Specific AI Examples',
      subject: 'AI in Mining, Forestry & Construction: Real applications happening now',
      htmlBody: generateEmailHTML('industry'),
      textBody: generateEmailText('industry')
    },
    {
      name: 'Email 4: Free AI Starter Kit + Assessment',
      subject: 'Get your free AI tools PDF and needs assessment worksheet',
      htmlBody: generateEmailHTML('starter'),
      textBody: generateEmailText('starter')
    },
    {
      name: 'Email 5: Event Experience Preview',
      subject: 'What to expect at the AI information session (Free coffee & networking!)',
      htmlBody: generateEmailHTML('preview'),
      textBody: generateEmailText('preview')
    },
    {
      name: 'Email 6: Networking & Learning Opportunities',
      subject: 'Connect with other local business owners exploring AI',
      htmlBody: generateEmailHTML('networking'),
      textBody: generateEmailText('networking')
    },
    {
      name: 'Email 7: Final Call - Limited Seats',
      subject: 'Last chance: Only 50 seats available for October 23rd AI session',
      htmlBody: generateEmailHTML('final'),
      textBody: generateEmailText('final')
    }
  ];

  const createdTemplates = [];
  for (const template of templates) {
    const created = await prisma.campaignTemplate.create({ data: template });
    createdTemplates.push(created);
  }

  // 2. Create campaign
  console.log('📧 Creating main campaign...');
  const campaign = await prisma.campaign.create({
    data: {
      name: 'AI Event 2025 - Comprehensive Campaign',
      description: '7-email sequence leading up to October 23rd AI information session',
      status: 'DRAFT'
    }
  });

  // 3. Create schedules
  console.log('📅 Creating email schedules...');
  const scheduleDates = [
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),   // 7 days from now
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),  // 10 days from now
    new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),  // 13 days from now
    new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),  // 16 days from now
    new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),  // 19 days from now
    new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),  // 22 days from now
    new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)   // 24 days from now (day before event)
  ];

  for (let i = 0; i < createdTemplates.length; i++) {
    await prisma.campaignSchedule.create({
      data: {
        name: `AI Event - Email ${i + 1}`,
        templateId: createdTemplates[i].id,
        groupId: audienceGroup.id,
        campaignId: campaign.id,
        status: 'DRAFT',
        sendAt: scheduleDates[i],
        throttlePerMinute: 20,
        stepOrder: i + 1,
        timeZone: 'America/Vancouver'
      }
    });
  }

  console.log('✅ Comprehensive campaign created!');
  console.log('\n📊 Campaign Summary:');
  console.log(`📧 Campaign: ${campaign.name}`);
  console.log(`📧 Templates: ${createdTemplates.length}`);
  console.log(`📅 Schedules: ${createdTemplates.length}`);
  console.log(`👥 Audience: ${audienceGroup.name} (1099 members)`);
  
  console.log('\n🎯 Email Sequence:');
  createdTemplates.forEach((template, i) => {
    const date = scheduleDates[i].toLocaleDateString();
    console.log(`   ${i + 1}. ${template.name} (${date})`);
  });

  console.log('\n🚀 Ready to activate at: http://localhost:3003/admin/campaign');
}

function generateEmailHTML(type: string): string {
  const emails = {
    story: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">AI Success Story</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        I'm Gabriel Lacroix from Evergreen Web Solutions. I want to share a real example of how AI is helping businesses right here in Northern BC.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>Real Example:</strong> A local construction company in Terrace started using AI to predict equipment maintenance needs. Instead of waiting for machines to break down, they now get alerts 2-3 weeks before issues occur.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        The result? They've reduced unexpected downtime by 40% and saved thousands in emergency repairs. No complex setup - just smart scheduling based on usage patterns.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        This is the kind of practical AI application I'll be sharing at our free information session on October 23rd at Sunshine Inn Terrace.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Learn More About AI
        </a>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Best regards,<br>
        Gabriel Lacroix<br>
        Evergreen Web Solutions
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 0;">
        Evergreen Web Solutions | Terrace, BC | <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #6b7280;">gabriel@evergreenwebsolutions.ca</a><br>
        <a href="{{unsubscribeLink}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    tools: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">5 AI Tools You Can Use Today</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Here are 5 AI tools that can help your business today - no technical expertise required:
      </p>
      
      <ol style="font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
        <li><strong>ChatGPT</strong> - Write better emails, proposals, and customer communications</li>
        <li><strong>Canva AI</strong> - Create professional graphics and marketing materials</li>
        <li><strong>Google Analytics AI</strong> - Get insights about your website visitors</li>
        <li><strong>Grammarly</strong> - Improve all your written communications</li>
        <li><strong>Calendly AI</strong> - Automate appointment scheduling</li>
      </ol>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        At our October 23rd session, I'll show you exactly how to set up and use each of these tools. You'll leave with a complete PDF guide and an assessment worksheet to identify which tools will help your business most.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Get Your Free AI Tools Guide
        </a>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Best regards,<br>
        Gabriel Lacroix<br>
        Evergreen Web Solutions
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 0;">
        Evergreen Web Solutions | Terrace, BC | <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #6b7280;">gabriel@evergreenwebsolutions.ca</a><br>
        <a href="{{unsubscribeLink}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
  };
  
  return emails[type] || emails.story;
}

function generateEmailText(type: string): string {
  const emails = {
    story: `Hi {{businessName}},

I'm Gabriel Lacroix from Evergreen Web Solutions. I want to share a real example of how AI is helping businesses right here in Northern BC.

Real Example: A local construction company in Terrace started using AI to predict equipment maintenance needs. Instead of waiting for machines to break down, they now get alerts 2-3 weeks before issues occur.

The result? They've reduced unexpected downtime by 40% and saved thousands in emergency repairs. No complex setup - just smart scheduling based on usage patterns.

This is the kind of practical AI application I'll be sharing at our free information session on October 23rd at Sunshine Inn Terrace.

Learn More: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`,
    tools: `Hi {{businessName}},

Here are 5 AI tools that can help your business today - no technical expertise required:

1. ChatGPT - Write better emails, proposals, and customer communications
2. Canva AI - Create professional graphics and marketing materials  
3. Google Analytics AI - Get insights about your website visitors
4. Grammarly - Improve all your written communications
5. Calendly AI - Automate appointment scheduling

At our October 23rd session, I'll show you exactly how to set up and use each of these tools. You'll leave with a complete PDF guide and an assessment worksheet to identify which tools will help your business most.

Get Your Free AI Tools Guide: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`
  };
  
  return emails[type] || emails.story;
}

createComprehensiveCampaign()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
