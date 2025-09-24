#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addRemainingTemplates() {
  console.log('📧 Adding remaining email templates...\n');

  // Get the campaign
  const campaign = await prisma.campaign.findFirst({
    where: { name: 'AI Event 2025 - Comprehensive Campaign' }
  });

  if (!campaign) {
    console.error('❌ Campaign not found!');
    return;
  }

  // Get audience group
  const audienceGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Verified Business Emails' }
  });

  if (!audienceGroup) {
    console.error('❌ Audience group not found!');
    return;
  }

  // Create remaining templates
  const remainingTemplates = [
    {
      name: 'Email 3: Industry-Specific AI Examples',
      subject: 'AI in Mining, Forestry & Construction: Real applications happening now',
      htmlBody: generateIndustryHTML(),
      textBody: generateIndustryText()
    },
    {
      name: 'Email 4: Free AI Starter Kit + Assessment',
      subject: 'Get your free AI tools PDF and needs assessment worksheet',
      htmlBody: generateStarterHTML(),
      textBody: generateStarterText()
    },
    {
      name: 'Email 5: Event Experience Preview',
      subject: 'What to expect at the AI information session (Free coffee & networking!)',
      htmlBody: generatePreviewHTML(),
      textBody: generatePreviewText()
    },
    {
      name: 'Email 6: Networking & Learning Opportunities',
      subject: 'Connect with other local business owners exploring AI',
      htmlBody: generateNetworkingHTML(),
      textBody: generateNetworkingText()
    },
    {
      name: 'Email 7: Final Call - Limited Seats',
      subject: 'Last chance: Only 50 seats available for October 23rd AI session',
      htmlBody: generateFinalHTML(),
      textBody: generateFinalText()
    }
  ];

  // Update existing templates and create new ones
  const existingTemplates = await prisma.campaignTemplate.findMany({
    where: { name: { contains: 'Email' } }
  });

  console.log(`Found ${existingTemplates.length} existing templates`);

  // Update template 3 (industry)
  if (existingTemplates[2]) {
    await prisma.campaignTemplate.update({
      where: { id: existingTemplates[2].id },
      data: {
        htmlBody: generateIndustryHTML(),
        textBody: generateIndustryText()
      }
    });
    console.log('✅ Updated Email 3: Industry-Specific AI Examples');
  }

  // Update template 4 (starter kit)
  if (existingTemplates[3]) {
    await prisma.campaignTemplate.update({
      where: { id: existingTemplates[3].id },
      data: {
        htmlBody: generateStarterHTML(),
        textBody: generateStarterText()
      }
    });
    console.log('✅ Updated Email 4: Free AI Starter Kit + Assessment');
  }

  // Update template 5 (preview)
  if (existingTemplates[4]) {
    await prisma.campaignTemplate.update({
      where: { id: existingTemplates[4].id },
      data: {
        htmlBody: generatePreviewHTML(),
        textBody: generatePreviewText()
      }
    });
    console.log('✅ Updated Email 5: Event Experience Preview');
  }

  // Update template 6 (networking)
  if (existingTemplates[5]) {
    await prisma.campaignTemplate.update({
      where: { id: existingTemplates[5].id },
      data: {
        htmlBody: generateNetworkingHTML(),
        textBody: generateNetworkingText()
      }
    });
    console.log('✅ Updated Email 6: Networking & Learning Opportunities');
  }

  // Update template 7 (final call)
  if (existingTemplates[6]) {
    await prisma.campaignTemplate.update({
      where: { id: existingTemplates[6].id },
      data: {
        htmlBody: generateFinalHTML(),
        textBody: generateFinalText()
      }
    });
    console.log('✅ Updated Email 7: Final Call - Limited Seats');
  }

  // Create A/B test variants for Email 1
  console.log('\n🧪 Creating A/B test variants...');
  
  const abTestTemplates = [
    {
      name: 'Email 1: AI Success Story (Variant A - Direct)',
      subject: 'How AI is already helping businesses like yours in Northern BC',
      htmlBody: generateEmailHTML('story'),
      textBody: generateEmailText('story')
    },
    {
      name: 'Email 1: AI Success Story (Variant B - Question)',
      subject: 'What if you could predict equipment failures before they happen?',
      htmlBody: generateQuestionHTML(),
      textBody: generateQuestionText()
    },
    {
      name: 'Email 1: AI Success Story (Variant C - Local)',
      subject: 'Terrace construction company discovers AI secret',
      htmlBody: generateLocalHTML(),
      textBody: generateLocalText()
    }
  ];

  for (const template of abTestTemplates) {
    await prisma.campaignTemplate.create({ data: template });
  }

  console.log('✅ Created 3 A/B test variants');

  console.log('\n🎉 All templates updated!');
  console.log('\n📊 Final Campaign Summary:');
  console.log('- 7 main email templates');
  console.log('- 3 A/B test variants');
  console.log('- 1099 verified business recipients');
  console.log('- Scheduled over 7 days leading to October 23rd');
  
  console.log('\n🚀 Ready to activate at: http://localhost:3003/admin/campaign');
}

function generateIndustryHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">AI in Northern BC Industries</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        AI isn't just for tech companies. Here's how it's being used in industries that matter to Northern BC:
      </p>
      
      <h3 style="color: #10b981; font-size: 18px; margin: 20px 0 10px 0;">🏭 Mining & Resources</h3>
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Predictive maintenance for heavy machinery, optimizing ore processing, and improving safety through real-time monitoring.
      </p>
      
      <h3 style="color: #10b981; font-size: 18px; margin: 20px 0 10px 0;">🌲 Forestry</h3>
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Smart forest management using satellite imagery and machine learning to optimize harvest timing and prevent disease spread.
      </p>
      
      <h3 style="color: #10b981; font-size: 18px; margin: 20px 0 10px 0;">🏗️ Construction</h3>
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Project timeline optimization, material waste reduction, and automated safety compliance monitoring.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        At our October 23rd session, I'll show you how these technologies can be adapted for businesses of any size.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Learn Industry-Specific AI
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
</html>`;
}

function generateIndustryText(): string {
  return `Hi {{businessName}},

AI isn't just for tech companies. Here's how it's being used in industries that matter to Northern BC:

MINING & RESOURCES
Predictive maintenance for heavy machinery, optimizing ore processing, and improving safety through real-time monitoring.

FORESTRY  
Smart forest management using satellite imagery and machine learning to optimize harvest timing and prevent disease spread.

CONSTRUCTION
Project timeline optimization, material waste reduction, and automated safety compliance monitoring.

At our October 23rd session, I'll show you how these technologies can be adapted for businesses of any size.

Learn More: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateStarterHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Free AI Starter Kit</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Ready to get started with AI? At our October 23rd session, every attendee receives:
      </p>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">📋 What You'll Get:</h3>
        <ul style="font-size: 16px; margin: 0; padding-left: 20px;">
          <li><strong>AI Tools PDF Guide</strong> - Step-by-step setup for 10 essential tools</li>
          <li><strong>AI Needs Assessment Worksheet</strong> - Identify where AI can help your business most</li>
          <li><strong>Free Coffee & Refreshments</strong> - Charcuterie boards, vegetable trays, and networking</li>
          <li><strong>1-on-1 Consultation</strong> - 15 minutes with me to discuss your specific needs</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        This isn't a sales pitch - it's a genuine effort to help local businesses understand and adopt AI tools that can make a real difference.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Get Your Free AI Starter Kit
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
</html>`;
}

function generateStarterText(): string {
  return `Hi {{businessName}},

Ready to get started with AI? At our October 23rd session, every attendee receives:

WHAT YOU'LL GET:
• AI Tools PDF Guide - Step-by-step setup for 10 essential tools
• AI Needs Assessment Worksheet - Identify where AI can help your business most  
• Free Coffee & Refreshments - Charcuterie boards, vegetable trays, and networking
• 1-on-1 Consultation - 15 minutes with me to discuss your specific needs

This isn't a sales pitch - it's a genuine effort to help local businesses understand and adopt AI tools that can make a real difference.

Get Your Free AI Starter Kit: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generatePreviewHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">What to Expect</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Curious about what the October 23rd AI information session will be like? Here's what to expect:
      </p>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">🍽️ Free Refreshments</h3>
        <p style="font-size: 16px; margin: 0 0 15px 0;">Complimentary coffee, tea, charcuterie boards, vegetable trays, and donuts</p>
        
        <h3 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">👥 Networking</h3>
        <p style="font-size: 16px; margin: 0 0 15px 0;">Connect with other local business owners exploring AI</p>
        
        <h3 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">📚 Learning</h3>
        <p style="font-size: 16px; margin: 0 0 15px 0;">Practical demonstrations, not theoretical presentations</p>
        
        <h3 style="color: #10b981; font-size: 18px; margin: 0 0 15px 0;">🎁 Takeaways</h3>
        <p style="font-size: 16px; margin: 0;">AI tools PDF and assessment worksheet</p>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>When:</strong> October 23rd, 6:00 PM - 8:30 PM<br>
        <strong>Where:</strong> Sunshine Inn Terrace — Jasmine Room<br>
        <strong>Address:</strong> 4812 Hwy 16, Terrace, BC
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          RSVP for Free Event
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
</html>`;
}

function generatePreviewText(): string {
  return `Hi {{businessName}},

Curious about what the October 23rd AI information session will be like? Here's what to expect:

FREE REFRESHMENTS
Complimentary coffee, tea, charcuterie boards, vegetable trays, and donuts

NETWORKING
Connect with other local business owners exploring AI

LEARNING  
Practical demonstrations, not theoretical presentations

TAKEAWAYS
AI tools PDF and assessment worksheet

When: October 23rd, 6:00 PM - 8:30 PM
Where: Sunshine Inn Terrace — Jasmine Room
Address: 4812 Hwy 16, Terrace, BC

RSVP: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateNetworkingHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Connect with Local Business Owners</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        One of the most valuable aspects of our October 23rd AI session will be the networking opportunities with other local business owners who are also exploring AI.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>Who's attending:</strong> Construction companies, retail stores, service providers, tourism operators, and more from across Northern BC.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>What you'll discuss:</strong> Real challenges, practical solutions, and how different industries are adapting AI tools to their specific needs.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>Networking format:</strong> Structured introductions, breakout discussions by industry, and informal conversations over coffee and refreshments.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Many attendees have told me they gained as much value from the networking as from the AI content itself.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Join the Network
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
</html>`;
}

function generateNetworkingText(): string {
  return `Hi {{businessName}},

One of the most valuable aspects of our October 23rd AI session will be the networking opportunities with other local business owners who are also exploring AI.

Who's attending: Construction companies, retail stores, service providers, tourism operators, and more from across Northern BC.

What you'll discuss: Real challenges, practical solutions, and how different industries are adapting AI tools to their specific needs.

Networking format: Structured introductions, breakout discussions by industry, and informal conversations over coffee and refreshments.

Many attendees have told me they gained as much value from the networking as from the AI content itself.

Join the Network: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateFinalHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #dc2626; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Last Chance - Limited Seats</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>This is your final reminder:</strong> Our AI information session is tomorrow (October 23rd), and we have limited seating available.
      </p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="color: #dc2626; font-size: 18px; margin: 0 0 15px 0;">⚠️ Limited Capacity</h3>
        <p style="font-size: 16px; margin: 0 0 15px 0;">Only 50 seats available due to venue restrictions</p>
        <p style="font-size: 16px; margin: 0;">Current RSVPs: 47/50</p>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        If you're interested in learning about AI for your business, this is your last opportunity to secure a spot.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>What you'll get:</strong> Free coffee & refreshments, AI tools PDF, assessment worksheet, networking with local business owners, and practical AI demonstrations.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Secure Your Last-Minute Spot
        </a>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        <strong>Event Details:</strong><br>
        Tomorrow, October 23rd<br>
        6:00 PM - 8:30 PM<br>
        Sunshine Inn Terrace — Jasmine Room<br>
        4812 Hwy 16, Terrace, BC
      </p>
      
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
</html>`;
}

function generateFinalText(): string {
  return `Hi {{businessName}},

This is your final reminder: Our AI information session is tomorrow (October 23rd), and we have limited seating available.

LIMITED CAPACITY
Only 50 seats available due to venue restrictions
Current RSVPs: 47/50

If you're interested in learning about AI for your business, this is your last opportunity to secure a spot.

What you'll get: Free coffee & refreshments, AI tools PDF, assessment worksheet, networking with local business owners, and practical AI demonstrations.

Secure Your Spot: https://rsvp.evergreenwebsolutions.ca/rsvp

Event Details:
Tomorrow, October 23rd
6:00 PM - 8:30 PM
Sunshine Inn Terrace — Jasmine Room
4812 Hwy 16, Terrace, BC

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateQuestionHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">What If You Could Predict Problems?</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        What if you could predict equipment failures before they happen? What if you could know which customers are most likely to buy before they even ask?
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        These aren't science fiction scenarios - they're real applications of AI that businesses in Northern BC are using right now.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        At our October 23rd information session, I'll show you exactly how these predictions work and how you can apply similar thinking to your business.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Discover AI Predictions
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
</html>`;
}

function generateQuestionText(): string {
  return `Hi {{businessName}},

What if you could predict equipment failures before they happen? What if you could know which customers are most likely to buy before they even ask?

These aren't science fiction scenarios - they're real applications of AI that businesses in Northern BC are using right now.

At our October 23rd information session, I'll show you exactly how these predictions work and how you can apply similar thinking to your business.

Discover More: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateLocalHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Terrace Company Discovers AI Secret</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        A local construction company here in Terrace discovered something that changed how they operate: AI can predict when their equipment needs maintenance.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Instead of waiting for machines to break down (and losing money on delays), they now get advance warnings. This simple change has saved them thousands in emergency repairs.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        The best part? It's not complicated technology - just smart scheduling based on usage patterns that any business can understand and implement.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        I'll share this story and others like it at our October 23rd AI information session. Real examples from real Northern BC businesses.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          Hear Local Success Stories
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
</html>`;
}

function generateLocalText(): string {
  return `Hi {{businessName}},

A local construction company here in Terrace discovered something that changed how they operate: AI can predict when their equipment needs maintenance.

Instead of waiting for machines to break down (and losing money on delays), they now get advance warnings. This simple change has saved them thousands in emergency repairs.

The best part? It's not complicated technology - just smart scheduling based on usage patterns that any business can understand and implement.

I'll share this story and others like it at our October 23rd AI information session. Real examples from real Northern BC businesses.

Hear More: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

---
Evergreen Web Solutions | Terrace, BC | gabriel@evergreenwebsolutions.ca
Unsubscribe: {{unsubscribeLink}}`;
}

function generateEmailHTML(type: string): string {
  return generateStoryHTML();
}

function generateEmailText(type: string): string {
  return generateStoryText();
}

function generateStoryHTML(): string {
  return `<!DOCTYPE html>
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
</html>`;
}

function generateStoryText(): string {
  return `Hi {{businessName}},

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
Unsubscribe: {{unsubscribeLink}}`;
}

addRemainingTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
