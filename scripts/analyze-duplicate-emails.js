require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeDuplicateEmails() {
  try {
    console.log('📧 Analyzing duplicate emails...');
    
    // Get all email jobs
    const emailJobs = await prisma.emailJob.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total email jobs: ${emailJobs.length}`);
    
    // Group by email address
    const emailGroups = {};
    
    emailJobs.forEach(job => {
      const email = job.recipientEmail;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(job);
    });
    
    // Find duplicates
    const duplicates = {};
    const singleEmails = {};
    
    Object.keys(emailGroups).forEach(email => {
      if (emailGroups[email].length > 1) {
        duplicates[email] = emailGroups[email];
      } else {
        singleEmails[email] = emailGroups[email][0];
      }
    });
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`- Total unique email addresses: ${Object.keys(emailGroups).length}`);
    console.log(`- Emails sent to only once: ${Object.keys(singleEmails).length}`);
    console.log(`- Emails sent to multiple times: ${Object.keys(duplicates).length}`);
    
    if (Object.keys(duplicates).length > 0) {
      console.log(`\n🔄 Duplicate Emails (${Object.keys(duplicates).length} businesses):`);
      console.log('='.repeat(100));
      
      let totalDuplicateSends = 0;
      
      Object.keys(duplicates).forEach((email, index) => {
        const jobs = duplicates[email];
        totalDuplicateSends += jobs.length;
        
        console.log(`${index + 1}. ${email} (${jobs.length} emails)`);
        jobs.forEach((job, jobIndex) => {
          console.log(`   ${jobIndex + 1}. Job ID: ${job.id}`);
          console.log(`      Status: ${job.status}`);
          console.log(`      Created: ${job.createdAt.toISOString()}`);
          console.log(`      Send At: ${job.sendAt.toISOString()}`);
          console.log(`      Sent At: ${job.sentAt?.toISOString() || 'Not sent yet'}`);
          console.log(`      Campaign ID: ${job.campaignId}`);
          console.log(`      Template ID: ${job.templateId}`);
          console.log('');
        });
      });
      
      console.log(`\n📊 Duplicate Summary:`);
      console.log(`- Businesses that received multiple emails: ${Object.keys(duplicates).length}`);
      console.log(`- Total duplicate email sends: ${totalDuplicateSends}`);
      console.log(`- Extra emails sent (beyond first): ${totalDuplicateSends - Object.keys(duplicates).length}`);
      
      // Save duplicate data
      const fs = require('fs');
      
      const duplicateData = {
        timestamp: new Date().toISOString(),
        totalUniqueEmails: Object.keys(emailGroups).length,
        singleEmails: Object.keys(singleEmails).length,
        duplicateEmails: Object.keys(duplicates).length,
        totalDuplicateSends: totalDuplicateSends,
        extraEmailsSent: totalDuplicateSends - Object.keys(duplicates).length,
        duplicates: duplicates
      };
      
      fs.writeFileSync('duplicate-emails-analysis.json', JSON.stringify(duplicateData, null, 2));
      console.log('\n💾 Duplicate analysis saved to duplicate-emails-analysis.json');
      
      // Create CSV of duplicates
      const csvRows = ['Email', 'Total Sends', 'First Send', 'Last Send', 'Job IDs'];
      Object.keys(duplicates).forEach(email => {
        const jobs = duplicates[email];
        const firstSend = jobs[jobs.length - 1].createdAt.toISOString(); // Oldest first
        const lastSend = jobs[0].createdAt.toISOString(); // Newest first
        const jobIds = jobs.map(job => job.id).join('; ');
        csvRows.push(`"${email}","${jobs.length}","${firstSend}","${lastSend}","${jobIds}"`);
      });
      
      fs.writeFileSync('duplicate-emails.csv', csvRows.join('\n'));
      console.log('💾 Duplicate emails CSV saved to duplicate-emails.csv');
      
    } else {
      console.log('\n✅ No duplicate emails found! Each business received exactly one email.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing duplicate emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDuplicateEmails();

