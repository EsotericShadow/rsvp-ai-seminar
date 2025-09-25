#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function createProperCampaign() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Creating Proper Campaign for greenalderson@gmail.com ===');
    
    // Find greenalderson
    const member = await prisma.audienceMember.findFirst({
      where: {
        primaryEmail: 'greenalderson@gmail.com'
      }
    });
    
    if (!member) {
      console.log('greenalderson@gmail.com not found!');
      return;
    }
    
    console.log('Found member:', member.primaryEmail, 'in group:', member.groupId);
    
    // Get the group
    const group = await prisma.audienceGroup.findUnique({
      where: { id: member.groupId }
    });
    
    console.log('Group:', group.name);
    
    // Create a new campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: 'AI Event Campaign - Proper Schedule - greenalderson@gmail.com',
        status: 'DRAFT',
        description: 'Proper 7-email sequence leading up to October 23rd event',
        meta: {}
      }
    });
    
    console.log('Created campaign:', campaign.id);
    
    // Define the proper schedule based on your dates:
    // Email 1: September 25, 2025 (today - already past, so send immediately)
    // Email 2: October 1, 2025
    // Email 3: October 7, 2025
    // Email 4: October 14, 2025
    // Email 5: October 18, 2025
    // Email 6: October 21, 2025
    // Email 7: October 23, 2025 (event day)
    
    const scheduleDates = [
      new Date('2025-09-25T18:00:00-07:00'), // Email 1: Today at 6 PM
      new Date('2025-10-01T10:00:00-07:00'), // Email 2: Oct 1 at 10 AM
      new Date('2025-10-07T10:00:00-07:00'), // Email 3: Oct 7 at 10 AM
      new Date('2025-10-14T10:00:00-07:00'), // Email 4: Oct 14 at 10 AM
      new Date('2025-10-18T10:00:00-07:00'), // Email 5: Oct 18 at 10 AM
      new Date('2025-10-21T10:00:00-07:00'), // Email 6: Oct 21 at 10 AM
      new Date('2025-10-23T10:00:00-07:00'), // Email 7: Oct 23 at 10 AM (event day)
    ];
    
    // Get one template from each email number (using Variant A)
    const selectedTemplates = [];
    for (let i = 1; i <= 7; i++) {
      const template = await prisma.campaignTemplate.findFirst({
        where: {
          name: `AI Event - Email ${i} - Variant A`
        }
      });
      if (template) {
        selectedTemplates.push(template);
      }
    }
    
    console.log(`Selected ${selectedTemplates.length} templates for the campaign`);
    
    // Create schedules for each email template
    const schedules = [];
    for (let i = 0; i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i];
      const sendAt = scheduleDates[i];
      
      const schedule = await prisma.campaignSchedule.create({
        data: {
          campaignId: campaign.id,
          templateId: template.id,
          groupId: group.id,
          sendAt: sendAt,
          throttlePerMinute: 60,
          status: 'SCHEDULED',
          name: `Email ${i + 1}: ${template.name} - ${sendAt.toLocaleDateString()}`,
          meta: {}
        }
      });
      
      schedules.push(schedule);
      console.log(`Created schedule ${i+1}: ${template.name} -> ${sendAt.toISOString()} (${sendAt.toLocaleDateString()})`);
    }
    
    console.log(`\n✅ Proper campaign created successfully!`);
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Schedules: ${schedules.length}`);
    console.log(`Target: greenalderson@gmail.com`);
    console.log(`Schedule spans from ${scheduleDates[0].toLocaleDateString()} to ${scheduleDates[6].toLocaleDateString()}`);
    console.log(`Next step: Activate campaign to start sending`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProperCampaign();
