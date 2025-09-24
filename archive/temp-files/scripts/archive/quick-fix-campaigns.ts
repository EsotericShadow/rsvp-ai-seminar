#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickFixCampaigns() {
  console.log('🔧 Quick Campaign Fix...\n');

  // 1. Clean up duplicate campaigns
  console.log('🧹 Cleaning up duplicate campaigns...');
  const campaigns = await prisma.campaign.findMany({
    include: { schedules: true }
  });

  const campaignsByName = new Map<string, any[]>();
  campaigns.forEach(c => {
    if (!campaignsByName.has(c.name)) {
      campaignsByName.set(c.name, []);
    }
    campaignsByName.get(c.name)!.push(c);
  });

  for (const [name, campaignList] of campaignsByName) {
    if (campaignList.length > 1) {
      console.log(`   Found ${campaignList.length} campaigns named "${name}"`);
      campaignList.sort((a, b) => b.schedules.length - a.schedules.length);
      const keepCampaign = campaignList[0];
      const deleteCampaigns = campaignList.slice(1);
      
      for (const deleteCampaign of deleteCampaigns) {
        await prisma.campaign.delete({ where: { id: deleteCampaign.id } });
        console.log(`   Deleted campaign with ${deleteCampaign.schedules.length} schedules`);
      }
    }
  }

  // 2. Clean up duplicate audience groups
  console.log('\n🧹 Cleaning up duplicate audience groups...');
  const groups = await prisma.audienceGroup.findMany();
  const groupsByName = new Map<string, any[]>();
  
  groups.forEach(g => {
    if (!groupsByName.has(g.name)) {
      groupsByName.set(g.name, []);
    }
    groupsByName.get(g.name)!.push(g);
  });

  for (const [name, groupList] of groupsByName) {
    if (groupList.length > 1) {
      console.log(`   Found ${groupList.length} groups named "${name}"`);
      groupList.sort((a, b) => b.id.localeCompare(a.id)); // Keep the first one
      const keepGroup = groupList[0];
      const deleteGroups = groupList.slice(1);
      
      for (const deleteGroup of deleteGroups) {
        await prisma.audienceGroup.delete({ where: { id: deleteGroup.id } });
        console.log(`   Deleted duplicate group`);
      }
    }
  }

  // 3. Get the main verified business emails and assign to Pre-RSVP group
  console.log('\n👥 Assigning verified emails to Pre-RSVP group...');
  
  const verifiedGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Verified Business Emails - Spreadsheet' },
    include: { members: true }
  });

  if (verifiedGroup) {
    console.log(`   Found ${verifiedGroup.members.length} verified business emails`);
    
    const preRSVPGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'AI Event - Pre-RSVP (Educational)' }
    });

    if (preRSVPGroup) {
      // Clear existing members
      await prisma.audienceMember.deleteMany({ where: { groupId: preRSVPGroup.id } });
      
      // Copy verified members to Pre-RSVP group
      for (const member of verifiedGroup.members) {
        await prisma.audienceMember.create({
          data: {
            groupId: preRSVPGroup.id,
            businessId: member.businessId,
            businessName: member.businessName,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail,
            tagsSnapshot: member.tagsSnapshot,
            inviteToken: member.inviteToken,
            meta: member.meta,
            unsubscribed: member.unsubscribed
          }
        });
      }
      console.log(`   ✅ Assigned ${verifiedGroup.members.length} members to Pre-RSVP group`);
    }
  }

  // 4. Show final status
  console.log('\n📊 Final Status:');
  const finalCampaigns = await prisma.campaign.findMany({
    include: {
      schedules: {
        include: {
          group: { include: { _count: { select: { members: true } } } }
        }
      }
    }
  });

  for (const campaign of finalCampaigns) {
    console.log(`\n📧 ${campaign.name}`);
    console.log(`   Status: ${campaign.status}`);
    console.log(`   Schedules: ${campaign.schedules.length}`);
    
    if (campaign.schedules.length > 0) {
      const totalMembers = campaign.schedules.reduce((sum, s) => sum + s.group._count.members, 0);
      console.log(`   Total Audience: ${totalMembers} members`);
    }
  }

  console.log('\n✅ Quick fix complete!');
  console.log('\n🎯 Where to find campaign results:');
  console.log('1. Go to: http://localhost:3000/admin/campaign');
  console.log('2. Click on a campaign to see the dashboard');
  console.log('3. Change status from DRAFT to ACTIVE to start sending');
  console.log('4. View analytics at: http://localhost:3000/admin/analytics');
  console.log('5. A/B test results will show in individual campaign dashboards');
}

quickFixCampaigns()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
