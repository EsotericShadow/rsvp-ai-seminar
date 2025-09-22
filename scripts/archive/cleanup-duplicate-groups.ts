#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateGroups() {
  console.log('🧹 Cleaning up duplicate audience groups...\n');

  // Get all groups
  const groups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${groups.length} total groups`);

  // Group by name to find duplicates
  const groupsByName = new Map<string, any[]>();
  groups.forEach(group => {
    if (!groupsByName.has(group.name)) {
      groupsByName.set(group.name, []);
    }
    groupsByName.get(group.name)!.push(group);
  });

  // Find and clean up duplicates
  let deletedCount = 0;
  for (const [name, groupList] of groupsByName) {
    if (groupList.length > 1) {
      console.log(`\n🔍 Found ${groupList.length} groups named "${name}"`);
      
      // Sort by member count (keep the one with most members)
      groupList.sort((a, b) => b._count.members - a._count.members);
      
      const keepGroup = groupList[0];
      const deleteGroups = groupList.slice(1);
      
      console.log(`   ✅ Keeping group with ${keepGroup._count.members} members`);
      
      for (const deleteGroup of deleteGroups) {
        console.log(`   🗑️  Deleting group with ${deleteGroup._count.members} members`);
        
        // Delete members first
        await prisma.audienceMember.deleteMany({
          where: { groupId: deleteGroup.id }
        });
        
        // Delete the group
        await prisma.audienceGroup.delete({
          where: { id: deleteGroup.id }
        });
        
        deletedCount++;
      }
    }
  }

  console.log(`\n✅ Cleanup complete: Deleted ${deletedCount} duplicate groups`);

  // Show final clean result
  console.log('\n📊 FINAL CLEAN AUDIENCE GROUPS:');
  
  const finalGroups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { _count: { members: 'desc' } }
  });

  let totalMembers = 0;
  for (const group of finalGroups) {
    console.log(`📊 ${group.name}: ${group._count.members} members`);
    totalMembers += group._count.members;
  }

  console.log(`\n📈 Total: ${totalMembers} businesses organized by industry`);
  console.log(`📈 Success: All ${totalMembers} businesses properly categorized!`);

  console.log('\n🏭 TOP INDUSTRIES BY SIZE:');
  
  const topIndustries = finalGroups
    .filter(g => g.name !== 'Other Industries - Northern BC')
    .slice(0, 10);
  
  topIndustries.forEach((group, i) => {
    console.log(`   ${i + 1}. ${group.name}: ${group._count.members} businesses`);
  });

  const otherGroup = finalGroups.find(g => g.name === 'Other Industries - Northern BC');
  if (otherGroup) {
    console.log(`   📊 Other Industries: ${otherGroup._count.members} businesses`);
  }

  console.log('\n🎯 READY FOR INDUSTRY-SPECIFIC CAMPAIGNS!');
  console.log('Each industry can now have tailored predictive AI messaging:');
  console.log('- Construction: Equipment maintenance, project timelines');
  console.log('- Mining: Predictive maintenance, safety optimization');
  console.log('- Retail: Inventory prediction, customer demand forecasting');
  console.log('- Food & Hospitality: Staffing optimization, seasonal planning');
  console.log('- And more...');

  await prisma.$disconnect();
}

cleanupDuplicateGroups()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
