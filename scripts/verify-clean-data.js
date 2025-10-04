require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function verifyCleanData() {
  try {
    console.log('🔍 Verifying clean data and audience setup...');
    
    // Read the clean audience group summary
    const cleanAudienceData = JSON.parse(fs.readFileSync('clean-audience-group-summary.json', 'utf8'));
    const audienceGroupId = cleanAudienceData.audienceGroup.id;
    
    console.log(`📊 Clean Audience Group ID: ${audienceGroupId}`);
    console.log(`📊 Expected member count: ${cleanAudienceData.audienceGroup.memberCount}`);
    
    // Verify the audience group exists
    console.log('\n🔍 Step 1: Verifying audience group...');
    const audienceGroup = await prisma.audienceGroup.findUnique({
      where: { id: audienceGroupId },
      include: {
        members: true
      }
    });
    
    if (!audienceGroup) {
      console.log('❌ Audience group not found!');
      return;
    }
    
    console.log(`✅ Audience group found: ${audienceGroup.name}`);
    console.log(`📊 Actual member count: ${audienceGroup.members.length}`);
    console.log(`📊 Expected member count: ${cleanAudienceData.audienceGroup.memberCount}`);
    
    if (audienceGroup.members.length !== cleanAudienceData.audienceGroup.memberCount) {
      console.log('⚠️  Member count mismatch!');
    } else {
      console.log('✅ Member count matches expected value');
    }
    
    // Check for duplicates in the clean audience
    console.log('\n🔍 Step 2: Checking for duplicates in clean audience...');
    const emailCounts = {};
    audienceGroup.members.forEach(member => {
      emailCounts[member.primaryEmail] = (emailCounts[member.primaryEmail] || 0) + 1;
    });
    
    const duplicates = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate emails found in clean audience');
    } else {
      console.log(`❌ Found ${duplicates.length} duplicate emails in clean audience:`);
      duplicates.forEach(email => {
        console.log(`- ${email} (${emailCounts[email]} records)`);
      });
    }
    
    // Check if any clean audience emails have already been sent
    console.log('\n🔍 Step 3: Checking if clean audience emails have been sent...');
    const cleanEmails = audienceGroup.members.map(member => member.primaryEmail);
    
    const sentEmailJobs = await prisma.emailJob.findMany({
      where: {
        recipientEmail: { in: cleanEmails },
        status: { in: ['sent', 'processing'] }
      },
      select: {
        recipientEmail: true,
        status: true
      }
    });
    
    const sentEmails = new Set(sentEmailJobs.map(job => job.recipientEmail));
    
    if (sentEmails.size === 0) {
      console.log('✅ No clean audience emails have been sent yet');
    } else {
      console.log(`❌ Found ${sentEmails.size} clean audience emails that have already been sent:`);
      Array.from(sentEmails).slice(0, 10).forEach(email => {
        console.log(`- ${email}`);
      });
      if (sentEmails.size > 10) {
        console.log(`... and ${sentEmails.size - 10} more`);
      }
    }
    
    // Overall database statistics
    console.log('\n🔍 Step 4: Overall database statistics...');
    const totalAudienceMembers = await prisma.audienceMember.count();
    const totalEmailJobs = await prisma.emailJob.count();
    const sentEmailJobsCount = await prisma.emailJob.count({
      where: { status: { in: ['sent', 'processing'] } }
    });
    
    console.log(`📊 Total audience members in database: ${totalAudienceMembers}`);
    console.log(`📊 Total email jobs: ${totalEmailJobs}`);
    console.log(`📊 Sent email jobs: ${sentEmailJobsCount}`);
    console.log(`📊 Clean audience members: ${audienceGroup.members.length}`);
    
    // Check for any remaining duplicates in entire database
    console.log('\n🔍 Step 5: Checking entire database for duplicates...');
    const allMembers = await prisma.audienceMember.findMany({
      select: { primaryEmail: true }
    });
    
    const allEmailCounts = {};
    allMembers.forEach(member => {
      allEmailCounts[member.primaryEmail] = (allEmailCounts[member.primaryEmail] || 0) + 1;
    });
    
    const allDuplicates = Object.keys(allEmailCounts).filter(email => allEmailCounts[email] > 1);
    
    if (allDuplicates.length === 0) {
      console.log('✅ No duplicate emails found in entire database');
    } else {
      console.log(`❌ Found ${allDuplicates.length} duplicate emails in entire database:`);
      allDuplicates.slice(0, 5).forEach(email => {
        console.log(`- ${email} (${allEmailCounts[email]} records)`);
      });
      if (allDuplicates.length > 5) {
        console.log(`... and ${allDuplicates.length - 5} more`);
      }
    }
    
    // Final verification summary
    console.log('\n🎯 FINAL VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    const isClean = duplicates.length === 0 && sentEmails.size === 0 && allDuplicates.length === 0;
    
    if (isClean) {
      console.log('✅ DATA IS CLEAN AND READY FOR CAMPAIGN!');
      console.log(`✅ Audience Group: ${audienceGroup.name}`);
      console.log(`✅ Group ID: ${audienceGroupId}`);
      console.log(`✅ Members: ${audienceGroup.members.length}`);
      console.log(`✅ No duplicates in clean audience`);
      console.log(`✅ No previously sent emails in clean audience`);
      console.log(`✅ No duplicates in entire database`);
    } else {
      console.log('⚠️  DATA NEEDS ATTENTION:');
      if (duplicates.length > 0) {
        console.log(`❌ ${duplicates.length} duplicates in clean audience`);
      }
      if (sentEmails.size > 0) {
        console.log(`❌ ${sentEmails.size} clean audience emails already sent`);
      }
      if (allDuplicates.length > 0) {
        console.log(`❌ ${allDuplicates.length} duplicates in entire database`);
      }
    }
    
    console.log('\n📁 Available files:');
    console.log('- clean-audience-group-summary.json (complete summary)');
    console.log('- clean-audience-group.csv (member details)');
    console.log('- clean-audience-emails.txt (email list only)');
    console.log('- data-cleanup-analysis.json (full analysis)');
    console.log('- fresh-emails-list.csv (fresh emails)');
    console.log('- already-sent-emails.csv (sent emails)');
    
    return {
      isClean: isClean,
      audienceGroupId: audienceGroupId,
      memberCount: audienceGroup.members.length,
      duplicatesInCleanAudience: duplicates.length,
      alreadySentInCleanAudience: sentEmails.size,
      duplicatesInDatabase: allDuplicates.length
    };
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyCleanData()
  .then(result => {
    if (result.isClean) {
      console.log('\n🚀 READY TO CREATE NEW CAMPAIGN!');
      console.log(`Use Audience Group ID: ${result.audienceGroupId}`);
      console.log(`With ${result.memberCount} fresh email addresses`);
    } else {
      console.log('\n⚠️  DATA CLEANUP NEEDED BEFORE CREATING CAMPAIGN');
    }
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
