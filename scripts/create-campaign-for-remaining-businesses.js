#!/usr/bin/env node
/**
 * Create campaign for remaining businesses that haven't received emails yet
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createCampaignForRemainingBusinesses() {
  try {
    console.log('=== CREATING CAMPAIGN FOR REMAINING BUSINESSES ===');
    
    // Read the comparison results
    const resultsPath = '/tmp/email_comparison_results.json';
    let canSendEmails = [];
    
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      canSendEmails = results.can_send;
      console.log(`📊 Found ${canSendEmails.length} businesses that can still receive emails`);
    } catch (error) {
      console.log('❌ Could not read comparison results, using registry data directly');
      
      // Read registry directly
      const pandas = require('child_process').execSync('python3 -c "import pandas as pd; df = pd.read_excel(\'lead-mine/Active-Business-Licences-with-email  - June 18, 2025.xlsx\'); print(\'\\n\'.join(df[\'Contact Email\'].dropna().str.lower()))"', { 
        cwd: __dirname + '/..',
        encoding: 'utf8'
      });
      
      canSendEmails = pandas.trim().split('\n').filter(email => email);
      console.log(`📊 Registry has ${canSendEmails.length} businesses with emails`);
    }
    
    if (canSendEmails.length === 0) {
      console.log('❌ No businesses available to email');
      return;
    }
    
    // Get the invitation template we want to use
    const template = await prisma.campaignTemplate.findFirst({
      where: { 
        subject: { contains: 'Free AI Presentation in Terrace' }
      }
    });
    
    if (!template) {
      console.log('❌ No template found');
      return;
    }
    
    console.log(`📧 Using template: ${template.name}`);
    
    // Clean up any existing audience groups for this campaign
    await prisma.audienceGroup.deleteMany({
      where: { name: { contains: 'Remaining Registry' } }
    });
    
    // Create new audience group
    const audienceGroup = await prisma.audienceGroup.create({
      data: {
        name: `Remaining Registry Businesses (${canSendEmails.length})`,
        description: `Businesses from official registry that haven't received emails yet`,
        meta: {},
        createdAt: new Date()
      }
    });
    
    console.log(`✅ Created audience group: ${audienceGroup.name}`);
    
    // Create audience members
    const members = [];
    for (let i = 0; i < canSendEmails.length; i++) {
      const email = canSendEmails[i];
      const businessName = `Business ${i + 1}`; // We don't have business names from the comparison
      const inviteToken = `registry-${Date.now()}-${i}`;
      const businessId = `registry-business-${i + 1}`;
      
      members.push({
        groupId: audienceGroup.id,
        businessId: businessId,
        businessName: businessName,
        primaryEmail: email,
        inviteToken: inviteToken,
        meta: {},
        createdAt: new Date()
      });
    }
    
    // Create members in batches
    const batchSize = 100;
    for (let i = 0; i < members.length; i += batchSize) {
      const batch = members.slice(i, i + batchSize);
      await prisma.audienceMember.createMany({
        data: batch
      });
      console.log(`✅ Created members ${i + 1}-${Math.min(i + batchSize, members.length)}`);
    }
    
    console.log(`✅ Created ${members.length} audience members`);
    
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: `AI Event 2025 - Remaining Registry Businesses (${canSendEmails.length})`,
        description: `Campaign for businesses from official registry that haven't received emails yet`,
        status: 'DRAFT',
        meta: {},
        createdAt: new Date()
      }
    });
    
    console.log(`✅ Created campaign: ${campaign.name}`);
    
    // Create campaign schedule
    const schedule = await prisma.campaignSchedule.create({
      data: {
        campaignId: campaign.id,
        templateId: template.id,
        groupId: audienceGroup.id,
        name: 'Email 1 - Registry Businesses',
        sendAt: new Date(Date.now() + 60000), // 1 minute from now
        status: 'SCHEDULED',
        meta: {},
        createdAt: new Date()
      }
    });
    
    console.log(`✅ Created schedule: ${schedule.name}`);
    console.log(`📅 Scheduled to send at: ${schedule.sendAt}`);
    
    console.log(`\n🎉 SUCCESS!`);
    console.log(`📊 Campaign created for ${canSendEmails.length} remaining businesses`);
    console.log(`📊 Campaign ID: ${campaign.id}`);
    console.log(`📊 Schedule ID: ${schedule.id}`);
    console.log(`📊 Audience Group ID: ${audienceGroup.id}`);
    console.log(`\n📋 NEXT STEPS:`);
    console.log(`1. Review the campaign in the admin interface`);
    console.log(`2. Activate the campaign when ready`);
    console.log(`3. Monitor email delivery`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCampaignForRemainingBusinesses();
