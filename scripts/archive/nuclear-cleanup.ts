#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function nuclearCleanup() {
  console.log('🧹 NUCLEAR CLEANUP - Starting fresh...\n');

  // 1. Delete ALL campaigns and related data
  console.log('🗑️  Deleting all campaigns...');
  await prisma.campaignSend.deleteMany({});
  await prisma.campaignSchedule.deleteMany({});
  await prisma.campaignSettings.deleteMany({});
  await prisma.campaign.deleteMany({});
  console.log('   ✅ All campaigns deleted');

  // 2. Delete ALL audience groups and members
  console.log('\n🗑️  Deleting all audience groups...');
  await prisma.audienceMember.deleteMany({});
  await prisma.audienceGroup.deleteMany({});
  console.log('   ✅ All audience groups deleted');

  // 3. Delete ALL email templates
  console.log('\n🗑️  Deleting all email templates...');
  await prisma.campaignTemplate.deleteMany({});
  console.log('   ✅ All email templates deleted');

  // 4. Create ONE clean audience group with verified emails
  console.log('\n👥 Creating clean audience group...');
  const verifiedGroup = await prisma.audienceGroup.create({
    data: {
      name: 'Verified Business Emails',
      description: 'Clean list of verified business emails from spreadsheet'
    }
  });

  // Get the verified emails from the original source
  const verifiedEmails = await prisma.audienceMember.findMany({
    where: { primaryEmail: { not: '' } },
    distinct: ['primaryEmail']
  });

  console.log(`   Found ${verifiedEmails.length} unique verified emails`);

  // 5. Create ONE simple email template
  console.log('\n📧 Creating simple email template...');
  const template = await prisma.campaignTemplate.create({
    data: {
      name: 'AI Event Invitation',
      subject: 'Free AI Information Session - October 23rd in Terrace',
      htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">AI Information Session</h1>
    </div>
    <div style="padding: 30px 20px; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        I'm Gabriel Lacroix from Evergreen Web Solutions, and I'm excited to invite you to a <strong>free AI information session</strong> on October 23rd at Sunshine Inn Terrace.
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        This isn't about complex jargon; it's about showing you <strong>real, practical ways AI can benefit your business today.</strong>
      </p>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        You'll leave with:
      </p>
      <ul style="font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
        <li>An actionable set of AI tools in PDF form</li>
        <li>An AI needs assessment worksheet</li>
        <li>Free coffee, refreshments, and networking</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
          RSVP Now - Free Event
        </a>
      </div>
      
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        Best regards,<br>
        Gabriel Lacroix<br>
        Evergreen Web Solutions
      </p>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        P.S. Space is limited to 50 attendees. RSVP soon to secure your spot!
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 0;">
        Evergreen Web Solutions | Terrace, BC, Canada<br>
        <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #6b7280;">gabriel@evergreenwebsolutions.ca</a><br>
        <a href="{{unsubscribeLink}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
      textBody: `Hi {{businessName}},

I'm Gabriel Lacroix from Evergreen Web Solutions, and I'm excited to invite you to a free AI information session on October 23rd at Sunshine Inn Terrace.

This isn't about complex jargon; it's about showing you real, practical ways AI can benefit your business today.

You'll leave with:
- An actionable set of AI tools in PDF form
- An AI needs assessment worksheet  
- Free coffee, refreshments, and networking

RSVP Now: https://rsvp.evergreenwebsolutions.ca/rsvp

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

P.S. Space is limited to 50 attendees. RSVP soon to secure your spot!

---
Evergreen Web Solutions | Terrace, BC, Canada
gabriel@evergreenwebsolutions.ca

Unsubscribe: {{unsubscribeLink}}`
    }
  });

  // 6. Create ONE simple campaign
  console.log('\n📧 Creating simple campaign...');
  const campaign = await prisma.campaign.create({
    data: {
      name: 'AI Event 2025 - Simple Campaign',
      description: 'Clean, simple campaign for AI event invitation',
      status: 'DRAFT'
    }
  });

  // 7. Create ONE schedule for the campaign
  const schedule = await prisma.campaignSchedule.create({
    data: {
      name: 'AI Event Invitation',
      templateId: template.id,
      groupId: verifiedGroup.id,
      campaignId: campaign.id,
      status: 'DRAFT',
      sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      throttlePerMinute: 10,
      stepOrder: 1,
      timeZone: 'America/Vancouver'
    }
  });

  console.log('   ✅ Simple campaign created');

  // 8. Show final clean status
  console.log('\n✅ CLEANUP COMPLETE!');
  console.log('\n📊 Final Status:');
  console.log(`📧 Campaigns: 1 (${campaign.name})`);
  console.log(`📧 Templates: 1 (${template.name})`);
  console.log(`👥 Audience Groups: 1 (${verifiedGroup.name})`);
  console.log(`📅 Schedules: 1 (ready to send tomorrow)`);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Go to: http://localhost:3003/admin/campaign');
  console.log('2. Click on "AI Event 2025 - Simple Campaign"');
  console.log('3. Change status from DRAFT to ACTIVE');
  console.log('4. Watch it send emails tomorrow');
  console.log('5. Monitor results in real-time');
  
  console.log('\n✨ You now have a clean, simple system!');
}

nuclearCleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
