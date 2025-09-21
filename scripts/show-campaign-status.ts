#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showCampaignStatus() {
  console.log('📊 Current Campaign Status\n');

  // Show campaigns
  const campaigns = await prisma.campaign.findMany({
    include: {
      schedules: {
        include: {
          group: { include: { _count: { select: { members: true } } } },
          template: true,
          _count: { select: { sends: true } }
        }
      }
    }
  });

  console.log('🎯 CAMPAIGNS:');
  for (const campaign of campaigns) {
    console.log(`\n📧 ${campaign.name}`);
    console.log(`   Status: ${campaign.status}`);
    console.log(`   Schedules: ${campaign.schedules.length}`);
    
    if (campaign.schedules.length > 0) {
      const totalMembers = campaign.schedules.reduce((sum, s) => sum + s.group._count.members, 0);
      const totalSends = campaign.schedules.reduce((sum, s) => sum + s._count.sends, 0);
      console.log(`   Total Audience: ${totalMembers} members`);
      console.log(`   Total Sends: ${totalSends}`);
      
      // Show first few schedules
      for (const schedule of campaign.schedules.slice(0, 3)) {
        console.log(`   - ${schedule.name}: ${schedule.status} (${schedule.group._count.members} members, ${schedule._count.sends} sends)`);
      }
      if (campaign.schedules.length > 3) {
        console.log(`   - ... and ${campaign.schedules.length - 3} more schedules`);
      }
    }
  }

  // Show audience groups
  console.log('\n👥 AUDIENCE GROUPS:');
  const groups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } }
  });

  for (const group of groups) {
    console.log(`📊 ${group.name}: ${group._count.members} members`);
  }

  console.log('\n🎯 WHERE TO FIND CAMPAIGN RESULTS:');
  console.log('1. 📧 Campaign Dashboard: http://localhost:3000/admin/campaign');
  console.log('   - Click on any campaign to see detailed analytics');
  console.log('   - View send counts, open rates, click rates');
  console.log('   - See A/B test performance');
  
  console.log('\n2. 📊 General Analytics: http://localhost:3000/admin/analytics');
  console.log('   - Overall site analytics');
  console.log('   - RSVP tracking');
  console.log('   - Visit patterns');
  
  console.log('\n3. 🔄 Conditional Logic Status:');
  console.log('   - Pre-RSVP campaigns: For users who haven\'t RSVP\'d yet');
  console.log('   - Post-RSVP campaigns: For users who have RSVP\'d');
  console.log('   - Waitlist campaigns: When event reaches capacity');
  
  console.log('\n4. 🧪 A/B Testing Results:');
  console.log('   - Each campaign with A/B variants will show performance');
  console.log('   - Statistical significance testing');
  console.log('   - Winner selection based on open/click rates');
  
  console.log('\n⚠️  WHY CAMPAIGNS SHOW 0 STEPS:');
  console.log('- Campaigns are in DRAFT status (not active yet)');
  console.log('- Some campaigns have duplicate schedules that need cleanup');
  console.log('- Audience groups need proper member assignment');
  
  console.log('\n🚀 TO ACTIVATE CAMPAIGNS:');
  console.log('1. Go to http://localhost:3000/admin/campaign');
  console.log('2. Click on a campaign');
  console.log('3. Change status from DRAFT to ACTIVE');
  console.log('4. Monitor results in real-time');
  
  console.log('\n📈 A/B TESTING TRACKING:');
  console.log('- Open rates: Tracked via pixel in emails');
  console.log('- Click rates: Tracked via UTM parameters');
  console.log('- RSVP conversion: Tracked via invite tokens');
  console.log('- Statistical significance: Calculated automatically');
}

showCampaignStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
