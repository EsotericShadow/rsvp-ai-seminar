#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCampaignStatus() {
  console.log('🔧 Fixing Campaign Status and Audience Assignment...\n');

  // 1. Clean up duplicate campaigns (keep the one with schedules)
  console.log('🧹 Cleaning up duplicate campaigns...');
  const campaigns = await prisma.campaign.findMany({
    include: { schedules: true }
  });

  // Find campaigns with same name
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
      
      // Keep the one with the most schedules, delete the rest
      campaignList.sort((a, b) => b.schedules.length - a.schedules.length);
      const keepCampaign = campaignList[0];
      const deleteCampaigns = campaignList.slice(1);
      
      console.log(`   Keeping campaign with ${keepCampaign.schedules.length} schedules`);
      
      for (const deleteCampaign of deleteCampaigns) {
        console.log(`   Deleting campaign with ${deleteCampaign.schedules.length} schedules`);
        await prisma.campaign.delete({ where: { id: deleteCampaign.id } });
      }
    }
  }

  // 2. Assign audience members to the right groups
  console.log('\n👥 Assigning audience members to campaign groups...');
  
  // Get all business members
  const allMembers = await prisma.audienceMember.findMany();
  console.log(`   Found ${allMembers.length} total audience members`);

  // Get the main audience groups we want to populate
  const targetGroups = await prisma.audienceGroup.findMany({
    where: {
      name: {
        in: [
          'AI Event - Pre-RSVP (Educational)',
          'High-Value Custom Domain Businesses',
          'Gmail Business Owners',
          'Low Engagement - Reactivation'
        ]
      }
    }
  });

  for (const group of targetGroups) {
    console.log(`\n   📊 Processing group: ${group.name}`);
    
    // Clear existing members
    await prisma.audienceMember.deleteMany({ where: { groupId: group.id } });
    
    let assignedCount = 0;
    
    if (group.name === 'AI Event - Pre-RSVP (Educational)') {
      // Assign all verified business emails
      const verifiedGroup = await prisma.audienceGroup.findFirst({
        where: { name: 'Verified Business Emails - Spreadsheet' }
      });
      
      if (verifiedGroup) {
        const verifiedMembers = await prisma.audienceMember.findMany({
          where: { groupId: verifiedGroup.id }
        });
        
        for (const member of verifiedMembers) {
          await prisma.audienceMember.create({
            data: {
              groupId: group.id,
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
          assignedCount++;
        }
      }
    } else if (group.name === 'High-Value Custom Domain Businesses') {
      // Assign members with custom domains (not gmail, yahoo, hotmail, etc.)
      const customDomainMembers = allMembers.filter(m => {
        const domain = m.primaryEmail.split('@')[1]?.toLowerCase();
        return domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com'].includes(domain);
      });
      
      for (const member of customDomainMembers) {
        await prisma.audienceMember.create({
          data: {
            groupId: group.id,
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
        assignedCount++;
      }
    } else if (group.name === 'Gmail Business Owners') {
      // Assign Gmail users
      const gmailMembers = allMembers.filter(m => 
        m.primaryEmail.toLowerCase().endsWith('@gmail.com')
      );
      
      for (const member of gmailMembers) {
        await prisma.audienceMember.create({
          data: {
            groupId: group.id,
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
        assignedCount++;
      }
    } else if (group.name === 'Low Engagement - Reactivation') {
      // Assign a sample of members for reactivation
      const sampleMembers = allMembers.slice(0, Math.min(50, allMembers.length));
      
      for (const member of sampleMembers) {
        await prisma.audienceMember.create({
          data: {
            groupId: group.id,
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
        assignedCount++;
      }
    }
    
    console.log(`   ✅ Assigned ${assignedCount} members to ${group.name}`);
  }

  // 3. Update campaign schedules to link to the right groups
  console.log('\n🔗 Linking campaign schedules to audience groups...');
  
  const schedules = await prisma.campaignSchedule.findMany({
    include: { group: true, campaign: true }
  });

  for (const schedule of schedules) {
    let targetGroupId = schedule.groupId;
    
    // Find the right group based on campaign type
    if (schedule.campaign.name.includes('Pre-RSVP') || schedule.name.includes('Pre-RSVP')) {
      const preRSVPGroup = await prisma.audienceGroup.findFirst({
        where: { name: 'AI Event - Pre-RSVP (Educational)' }
      });
      targetGroupId = preRSVPGroup?.id || schedule.groupId;
    }
    
    if (targetGroupId !== schedule.groupId) {
      await prisma.campaignSchedule.update({
        where: { id: schedule.id },
        data: { groupId: targetGroupId }
      });
      console.log(`   ✅ Updated schedule "${schedule.name}" to use correct audience group`);
    }
  }

  // 4. Show final status
  console.log('\n📊 Final Campaign Status:');
  const finalCampaigns = await prisma.campaign.findMany({
    include: {
      schedules: {
        include: {
          group: { include: { _count: { select: { members: true } } } },
          _count: { select: { sends: true } }
        }
      }
    }
  });

  for (const campaign of finalCampaigns) {
    console.log(`\n📧 ${campaign.name}`);
    console.log(`   Status: ${campaign.status}`);
    console.log(`   Schedules: ${campaign.schedules.length}`);
    
    for (const schedule of campaign.schedules.slice(0, 3)) { // Show first 3
      const memberCount = schedule.group._count.members;
      const sendCount = schedule._count.sends;
      console.log(`   - ${schedule.name}: ${schedule.status} (${memberCount} members, ${sendCount} sends)`);
    }
    
    if (campaign.schedules.length > 3) {
      console.log(`   - ... and ${campaign.schedules.length - 3} more schedules`);
    }
  }

  console.log('\n✅ Campaign status fix complete!');
  console.log('\n🎯 Next Steps:');
  console.log('1. Go to /admin/campaign in your browser');
  console.log('2. Click on a campaign to see the dashboard');
  console.log('3. Change status from DRAFT to ACTIVE to start sending');
  console.log('4. Monitor results in the campaign analytics');
}

fixCampaignStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
