require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function removeDuplicateRecords() {
  try {
    console.log('🗑️  Starting duplicate record removal...');
    
    // Read the duplicate records from the analysis file
    const analysisData = JSON.parse(fs.readFileSync('data-cleanup-analysis.json', 'utf8'));
    const duplicateRecords = analysisData.duplicateRecords;
    
    console.log(`📊 Found ${duplicateRecords.length} duplicate records to remove`);
    
    if (duplicateRecords.length === 0) {
      console.log('✅ No duplicate records to remove!');
      return;
    }
    
    // Show some examples before deletion
    console.log('\n📋 Sample duplicate records to be removed:');
    duplicateRecords.slice(0, 5).forEach((record, index) => {
      console.log(`${index + 1}. ${record.email} (${record.businessName || 'N/A'}) - ID: ${record.id}`);
    });
    if (duplicateRecords.length > 5) {
      console.log(`... and ${duplicateRecords.length - 5} more`);
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete duplicate audience member records!');
    console.log('This action cannot be undone.');
    
    // Extract just the IDs for deletion
    const duplicateIds = duplicateRecords.map(record => record.id);
    
    // Delete the duplicate records
    console.log('\n🗑️  Deleting duplicate records...');
    const deleteResult = await prisma.audienceMember.deleteMany({
      where: {
        id: { in: duplicateIds }
      }
    });
    
    console.log(`✅ Successfully deleted ${deleteResult.count} duplicate records`);
    
    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const remainingAudienceMembers = await prisma.audienceMember.count();
    console.log(`📊 Remaining audience members: ${remainingAudienceMembers}`);
    
    // Check for any remaining duplicates
    const allMembers = await prisma.audienceMember.findMany({
      select: {
        primaryEmail: true
      }
    });
    
    const emailCounts = {};
    allMembers.forEach(member => {
      emailCounts[member.primaryEmail] = (emailCounts[member.primaryEmail] || 0) + 1;
    });
    
    const remainingDuplicates = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ No remaining duplicate emails found!');
    } else {
      console.log(`⚠️  Found ${remainingDuplicates.length} emails still with duplicates:`);
      remainingDuplicates.slice(0, 5).forEach(email => {
        console.log(`- ${email} (${emailCounts[email]} records)`);
      });
    }
    
    // Update the analysis file
    analysisData.cleanupCompleted = {
      timestamp: new Date().toISOString(),
      recordsDeleted: deleteResult.count,
      remainingAudienceMembers: remainingAudienceMembers,
      remainingDuplicates: remainingDuplicates.length
    };
    
    fs.writeFileSync('data-cleanup-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Updated analysis file with cleanup results');
    
    console.log('\n🎯 CLEANUP SUMMARY:');
    console.log(`✅ Deleted ${deleteResult.count} duplicate records`);
    console.log(`📊 Remaining audience members: ${remainingAudienceMembers}`);
    console.log(`📧 Fresh emails ready for campaign: ${analysisData.summary.freshEmails}`);
    console.log(`📧 Emails already sent: ${analysisData.summary.emailsAlreadySent}`);
    
    return {
      deletedCount: deleteResult.count,
      remainingMembers: remainingAudienceMembers,
      freshEmails: analysisData.summary.freshEmails,
      alreadySent: analysisData.summary.emailsAlreadySent
    };
    
  } catch (error) {
    console.error('❌ Error during duplicate removal:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
removeDuplicateRecords()
  .then(result => {
    console.log('\n✅ Duplicate removal completed successfully!');
    console.log(`\n🚀 Next steps:`);
    console.log(`1. Review the fresh-emails-list.csv file`);
    console.log(`2. Create new campaign with ${result.freshEmails} fresh emails`);
    console.log(`3. Avoid sending to the ${result.alreadySent} emails that already received emails`);
  })
  .catch(error => {
    console.error('❌ Duplicate removal failed:', error);
    process.exit(1);
  });

