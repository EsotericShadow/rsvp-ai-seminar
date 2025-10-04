require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function cleanDataAndCreateFreshAudience() {
  try {
    console.log('🧹 Starting data cleanup and fresh audience creation...');
    
    // Step 1: Get all sent emails from EmailJob records
    console.log('\n📧 Step 1: Identifying all sent emails...');
    const sentEmailJobs = await prisma.emailJob.findMany({
      where: {
        status: { in: ['sent', 'processing'] }
      },
      select: {
        recipientEmail: true,
        status: true,
        sentAt: true
      }
    });
    
    // Create a set of emails that have already been sent
    const sentEmails = new Set();
    const sentEmailDetails = {};
    
    sentEmailJobs.forEach(job => {
      sentEmails.add(job.recipientEmail);
      if (!sentEmailDetails[job.recipientEmail]) {
        sentEmailDetails[job.recipientEmail] = {
          status: job.status,
          sentAt: job.sentAt,
          count: 0
        };
      }
      sentEmailDetails[job.recipientEmail].count++;
    });
    
    console.log(`📊 Found ${sentEmails.size} unique emails that have been sent`);
    console.log(`📊 Total email jobs: ${sentEmailJobs.length}`);
    
    // Step 2: Get all audience members
    console.log('\n👥 Step 2: Analyzing audience members...');
    const allAudienceMembers = await prisma.audienceMember.findMany({
      select: {
        id: true,
        primaryEmail: true,
        businessName: true,
        businessId: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Total audience members: ${allAudienceMembers.length}`);
    
    // Step 3: Group by email and identify duplicates
    console.log('\n🔄 Step 3: Identifying duplicates and cleaning data...');
    const emailGroups = {};
    
    allAudienceMembers.forEach(member => {
      const email = member.primaryEmail;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(member);
    });
    
    // Step 4: Create clean audience data
    const cleanAudienceData = [];
    const duplicateRecords = [];
    const alreadySentEmails = [];
    const freshEmails = [];
    
    Object.keys(emailGroups).forEach(email => {
      const members = emailGroups[email];
      
      if (members.length > 1) {
        // Keep the first record, mark others as duplicates
        const keepMember = members[0];
        const duplicateMembers = members.slice(1);
        
        cleanAudienceData.push(keepMember);
        duplicateRecords.push(...duplicateMembers);
        
        if (sentEmails.has(email)) {
          alreadySentEmails.push({
            email: email,
            businessName: keepMember.businessName,
            businessId: keepMember.businessId,
            sentCount: sentEmailDetails[email].count,
            status: sentEmailDetails[email].status,
            sentAt: sentEmailDetails[email].sentAt
          });
        } else {
          freshEmails.push({
            email: email,
            businessName: keepMember.businessName,
            businessId: keepMember.businessId,
            memberId: keepMember.id
          });
        }
      } else {
        // Single record
        const member = members[0];
        cleanAudienceData.push(member);
        
        if (sentEmails.has(email)) {
          alreadySentEmails.push({
            email: email,
            businessName: member.businessName,
            businessId: member.businessId,
            sentCount: sentEmailDetails[email].count,
            status: sentEmailDetails[email].status,
            sentAt: sentEmailDetails[email].sentAt
          });
        } else {
          freshEmails.push({
            email: email,
            businessName: member.businessName,
            businessId: member.businessId,
            memberId: member.id
          });
        }
      }
    });
    
    console.log(`\n📊 Data Analysis Results:`);
    console.log(`- Total unique emails: ${Object.keys(emailGroups).length}`);
    console.log(`- Emails already sent: ${alreadySentEmails.length}`);
    console.log(`- Fresh emails (not sent): ${freshEmails.length}`);
    console.log(`- Duplicate records to remove: ${duplicateRecords.length}`);
    console.log(`- Clean audience size: ${cleanAudienceData.length}`);
    
    // Step 5: Save analysis data
    const analysisData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAudienceMembers: allAudienceMembers.length,
        uniqueEmails: Object.keys(emailGroups).length,
        emailsAlreadySent: alreadySentEmails.length,
        freshEmails: freshEmails.length,
        duplicateRecords: duplicateRecords.length,
        cleanAudienceSize: cleanAudienceData.length
      },
      alreadySentEmails: alreadySentEmails,
      freshEmails: freshEmails,
      duplicateRecords: duplicateRecords.map(record => ({
        id: record.id,
        email: record.primaryEmail,
        businessName: record.businessName,
        businessId: record.businessId,
        createdAt: record.createdAt
      }))
    };
    
    fs.writeFileSync('data-cleanup-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Analysis data saved to data-cleanup-analysis.json');
    
    // Step 6: Create CSV files
    // Fresh emails CSV
    const freshEmailsCSV = ['Email', 'Business Name', 'Business ID', 'Member ID'];
    freshEmails.forEach(item => {
      freshEmailsCSV.push(`"${item.email}","${item.businessName || 'N/A'}","${item.businessId || 'N/A'}","${item.memberId}"`);
    });
    fs.writeFileSync('fresh-emails-list.csv', freshEmailsCSV.join('\n'));
    console.log('💾 Fresh emails list saved to fresh-emails-list.csv');
    
    // Already sent emails CSV
    const sentEmailsCSV = ['Email', 'Business Name', 'Business ID', 'Sent Count', 'Status', 'Sent At'];
    alreadySentEmails.forEach(item => {
      sentEmailsCSV.push(`"${item.email}","${item.businessName || 'N/A'}","${item.businessId || 'N/A'}","${item.sentCount}","${item.status}","${item.sentAt || 'N/A'}"`);
    });
    fs.writeFileSync('already-sent-emails.csv', sentEmailsCSV.join('\n'));
    console.log('💾 Already sent emails list saved to already-sent-emails.csv');
    
    // Duplicate records CSV
    const duplicateCSV = ['ID', 'Email', 'Business Name', 'Business ID', 'Created At'];
    duplicateRecords.forEach(record => {
      duplicateCSV.push(`"${record.id}","${record.primaryEmail}","${record.businessName || 'N/A'}","${record.businessId || 'N/A'}","${record.createdAt.toISOString()}"`);
    });
    fs.writeFileSync('duplicate-records-to-remove.csv', duplicateCSV.join('\n'));
    console.log('💾 Duplicate records list saved to duplicate-records-to-remove.csv');
    
    // Step 7: Create plain text lists
    const freshEmailsList = freshEmails.map(item => item.email).join('\n');
    fs.writeFileSync('fresh-emails-list.txt', freshEmailsList);
    console.log('💾 Fresh emails plain text list saved to fresh-emails-list.txt');
    
    const sentEmailsList = alreadySentEmails.map(item => item.email).join('\n');
    fs.writeFileSync('already-sent-emails.txt', sentEmailsList);
    console.log('💾 Already sent emails plain text list saved to already-sent-emails.txt');
    
    // Step 8: Show summary
    console.log('\n🎯 SUMMARY:');
    console.log(`✅ ${freshEmails.length} emails are ready for a fresh campaign`);
    console.log(`❌ ${alreadySentEmails.length} emails have already been sent`);
    console.log(`🗑️  ${duplicateRecords.length} duplicate records need to be removed`);
    
    if (freshEmails.length > 0) {
      console.log('\n📋 Sample of fresh emails:');
      freshEmails.slice(0, 10).forEach((item, index) => {
        console.log(`${index + 1}. ${item.email} (${item.businessName || 'N/A'})`);
      });
      if (freshEmails.length > 10) {
        console.log(`... and ${freshEmails.length - 10} more`);
      }
    }
    
    console.log('\n📁 Files created:');
    console.log('- data-cleanup-analysis.json (complete analysis)');
    console.log('- fresh-emails-list.csv (emails ready for campaign)');
    console.log('- fresh-emails-list.txt (plain text list)');
    console.log('- already-sent-emails.csv (emails already sent)');
    console.log('- duplicate-records-to-remove.csv (duplicates to clean)');
    
    return {
      freshEmails: freshEmails,
      alreadySentEmails: alreadySentEmails,
      duplicateRecords: duplicateRecords,
      cleanAudienceData: cleanAudienceData
    };
    
  } catch (error) {
    console.error('❌ Error during data cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDataAndCreateFreshAudience()
  .then(result => {
    console.log('\n✅ Data cleanup completed successfully!');
    console.log(`\n🚀 Next steps:`);
    console.log(`1. Review the fresh-emails-list.csv file`);
    console.log(`2. Remove duplicate records from database`);
    console.log(`3. Create new campaign with fresh emails only`);
  })
  .catch(error => {
    console.error('❌ Data cleanup failed:', error);
    process.exit(1);
  });
