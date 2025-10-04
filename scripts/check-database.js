#!/usr/bin/env node

/**
 * Check Database Contents
 * Actually verify what's in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking Database Contents...\n');
  
  try {
    // Check campaigns
    const campaigns = await prisma.campaign.findMany();
    console.log(`📢 Campaigns: ${campaigns.length}`);
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name} (${campaign.status}) - Created: ${campaign.createdAt}`);
    });
    
    // Check templates
    const templates = await prisma.campaignTemplate.findMany();
    console.log(`\n📧 Templates: ${templates.length}`);
    templates.forEach(template => {
      console.log(`  - ${template.name} - Created: ${template.createdAt}`);
    });
    
    // Check audience groups
    const audienceGroups = await prisma.audienceGroup.findMany();
    console.log(`\n👥 Audience Groups: ${audienceGroups.length}`);
    audienceGroups.forEach(group => {
      console.log(`  - ${group.name} - Created: ${group.createdAt}`);
    });
    
    // Check audience members
    const audienceMembers = await prisma.audienceMember.findMany();
    console.log(`\n👤 Audience Members: ${audienceMembers.length}`);
    audienceMembers.forEach(member => {
      console.log(`  - ${member.businessName} (${member.primaryEmail}) - Created: ${member.createdAt}`);
    });
    
    // Check campaign schedules
    const schedules = await prisma.campaignSchedule.findMany();
    console.log(`\n📅 Campaign Schedules: ${schedules.length}`);
    schedules.forEach(schedule => {
      console.log(`  - ${schedule.name} (${schedule.status}) - Created: ${schedule.createdAt}`);
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total Records: ${campaigns.length + templates.length + audienceGroups.length + audienceMembers.length + schedules.length}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();


