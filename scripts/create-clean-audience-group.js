require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function createCleanAudienceGroup() {
  try {
    console.log('👥 Creating clean audience group with fresh emails only...');
    
    // Read the fresh emails from the analysis file
    const analysisData = JSON.parse(fs.readFileSync('data-cleanup-analysis.json', 'utf8'));
    const freshEmails = analysisData.freshEmails;
    
    console.log(`📊 Found ${freshEmails.length} fresh emails to add to new audience group`);
    
    if (freshEmails.length === 0) {
      console.log('❌ No fresh emails available for new audience group');
      return;
    }
    
    // Clean up any existing "Clean Audience" groups
    console.log('\n🧹 Cleaning up existing clean audience groups...');
    const existingCleanGroups = await prisma.audienceGroup.findMany({
      where: {
        name: { contains: 'Clean Audience' }
      }
    });
    
    if (existingCleanGroups.length > 0) {
      console.log(`🗑️  Found ${existingCleanGroups.length} existing clean audience groups to remove`);
      
      // Delete existing members first
      for (const group of existingCleanGroups) {
        await prisma.audienceMember.deleteMany({
          where: { groupId: group.id }
        });
      }
      
      // Delete the groups
      await prisma.audienceGroup.deleteMany({
        where: {
          name: { contains: 'Clean Audience' }
        }
      });
      
      console.log('✅ Cleaned up existing clean audience groups');
    }
    
    // Create new clean audience group
    console.log('\n🆕 Creating new clean audience group...');
    const newAudienceGroup = await prisma.audienceGroup.create({
      data: {
        name: `Clean Audience - ${freshEmails.length} Fresh Emails - ${new Date().toISOString().split('T')[0]}`,
        description: `Clean audience group containing ${freshEmails.length} unique email addresses that have not yet received campaign emails. Created after removing ${analysisData.summary.duplicateRecords} duplicate records.`,
        meta: {
          totalEmails: freshEmails.length,
          createdFrom: 'data-cleanup-analysis.json',
          duplicateRecordsRemoved: analysisData.summary.duplicateRecords,
          alreadySentEmails: analysisData.summary.emailsAlreadySent,
          createdAt: new Date().toISOString()
        }
      }
    });
    
    console.log(`✅ Created audience group: ${newAudienceGroup.name}`);
    console.log(`📋 Group ID: ${newAudienceGroup.id}`);
    
    // Get the existing audience members that correspond to fresh emails
    console.log('\n🔍 Finding existing audience members for fresh emails...');
    const freshEmailsList = freshEmails.map(item => item.email);
    
    const existingMembers = await prisma.audienceMember.findMany({
      where: {
        primaryEmail: { in: freshEmailsList }
      }
    });
    
    console.log(`📊 Found ${existingMembers.length} existing audience members for fresh emails`);
    
    // Update existing members to belong to the new clean group
    if (existingMembers.length > 0) {
      console.log('\n🔄 Updating existing members to new clean group...');
      const memberIds = existingMembers.map(member => member.id);
      
      const updateResult = await prisma.audienceMember.updateMany({
        where: {
          id: { in: memberIds }
        },
        data: {
          groupId: newAudienceGroup.id
        }
      });
      
      console.log(`✅ Updated ${updateResult.count} existing members to new clean group`);
    }
    
    // Verify the new audience group
    console.log('\n🔍 Verifying new audience group...');
    const groupMembers = await prisma.audienceMember.findMany({
      where: { groupId: newAudienceGroup.id },
      select: {
        id: true,
        primaryEmail: true,
        businessName: true,
        businessId: true
      }
    });
    
    console.log(`📊 New audience group contains ${groupMembers.length} members`);
    
    // Show sample of members
    console.log('\n📋 Sample members in new clean audience group:');
    groupMembers.slice(0, 10).forEach((member, index) => {
      console.log(`${index + 1}. ${member.primaryEmail} (${member.businessName || 'N/A'})`);
    });
    if (groupMembers.length > 10) {
      console.log(`... and ${groupMembers.length - 10} more`);
    }
    
    // Create summary file
    const summaryData = {
      timestamp: new Date().toISOString(),
      audienceGroup: {
        id: newAudienceGroup.id,
        name: newAudienceGroup.name,
        description: newAudienceGroup.description,
        memberCount: groupMembers.length
      },
      members: groupMembers.map(member => ({
        id: member.id,
        email: member.primaryEmail,
        businessName: member.businessName,
        businessId: member.businessId
      })),
      statistics: {
        totalFreshEmails: freshEmails.length,
        membersInGroup: groupMembers.length,
        duplicateRecordsRemoved: analysisData.summary.duplicateRecords,
        alreadySentEmails: analysisData.summary.emailsAlreadySent,
        totalOriginalAudience: analysisData.summary.totalAudienceMembers
      }
    };
    
    fs.writeFileSync('clean-audience-group-summary.json', JSON.stringify(summaryData, null, 2));
    console.log('\n💾 Clean audience group summary saved to clean-audience-group-summary.json');
    
    // Create CSV of the clean audience
    const csvRows = ['ID', 'Email', 'Business Name', 'Business ID'];
    groupMembers.forEach(member => {
      csvRows.push(`"${member.id}","${member.primaryEmail}","${member.businessName || 'N/A'}","${member.businessId || 'N/A'}"`);
    });
    fs.writeFileSync('clean-audience-group.csv', csvRows.join('\n'));
    console.log('💾 Clean audience group CSV saved to clean-audience-group.csv');
    
    // Create plain text email list
    const emailList = groupMembers.map(member => member.primaryEmail).join('\n');
    fs.writeFileSync('clean-audience-emails.txt', emailList);
    console.log('💾 Clean audience email list saved to clean-audience-emails.txt');
    
    console.log('\n🎯 CLEAN AUDIENCE GROUP CREATION SUMMARY:');
    console.log(`✅ Created audience group: ${newAudienceGroup.name}`);
    console.log(`📊 Group ID: ${newAudienceGroup.id}`);
    console.log(`👥 Members in group: ${groupMembers.length}`);
    console.log(`📧 Fresh emails ready for campaign: ${freshEmails.length}`);
    console.log(`🗑️  Duplicate records removed: ${analysisData.summary.duplicateRecords}`);
    console.log(`❌ Emails already sent (excluded): ${analysisData.summary.emailsAlreadySent}`);
    
    console.log('\n📁 Files created:');
    console.log('- clean-audience-group-summary.json (complete summary)');
    console.log('- clean-audience-group.csv (member details)');
    console.log('- clean-audience-emails.txt (email list only)');
    
    return {
      audienceGroupId: newAudienceGroup.id,
      memberCount: groupMembers.length,
      freshEmails: freshEmails.length
    };
    
  } catch (error) {
    console.error('❌ Error creating clean audience group:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the audience group creation
createCleanAudienceGroup()
  .then(result => {
    console.log('\n✅ Clean audience group creation completed successfully!');
    console.log(`\n🚀 Ready for new campaign:`);
    console.log(`- Audience Group ID: ${result.audienceGroupId}`);
    console.log(`- ${result.memberCount} fresh email addresses`);
    console.log(`- No duplicate records`);
    console.log(`- No previously sent emails`);
  })
  .catch(error => {
    console.error('❌ Clean audience group creation failed:', error);
    process.exit(1);
  });

