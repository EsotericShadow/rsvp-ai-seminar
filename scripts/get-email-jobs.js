require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getEmailJobs() {
  try {
    console.log('📧 Getting email jobs from database...');
    
    // Get all email jobs
    const emailJobs = await prisma.emailJob.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total email jobs: ${emailJobs.length}`);
    
    if (emailJobs.length > 0) {
      console.log('\n📋 All Email Jobs:');
      console.log('='.repeat(100));
      
      const sentEmails = [];
      
      emailJobs.forEach((job, index) => {
        const email = job.recipientEmail || 'Unknown';
        
        sentEmails.push({
          email,
          businessId: job.recipientId || 'Unknown',
          status: job.status,
          createdAt: job.createdAt?.toISOString() || 'N/A',
          sendAt: job.sendAt?.toISOString() || 'N/A',
          sentAt: job.sentAt?.toISOString() || 'N/A',
          jobId: job.id,
          campaignId: job.campaignId,
          templateId: job.templateId,
          groupId: job.groupId
        });
        
        console.log(`${index + 1}. ${email}`);
        console.log(`   Business ID: ${job.recipientId || 'Unknown'}`);
        console.log(`   Status: ${job.status}`);
        console.log(`   Created: ${job.createdAt?.toISOString() || 'N/A'}`);
        console.log(`   Send At: ${job.sendAt?.toISOString() || 'N/A'}`);
        console.log(`   Sent At: ${job.sentAt?.toISOString() || 'N/A'}`);
        console.log(`   Job ID: ${job.id}`);
        console.log(`   Campaign ID: ${job.campaignId}`);
        console.log(`   Template ID: ${job.templateId}`);
        console.log('');
      });
      
      // Get unique emails
      const uniqueEmails = [...new Set(sentEmails.map(job => job.email).filter(email => email !== 'Unknown'))];
      
      console.log(`\n📊 Summary:`);
      console.log(`- Total email jobs: ${emailJobs.length}`);
      console.log(`- Unique email addresses: ${uniqueEmails.length}`);
      
      // Save to files
      const fs = require('fs');
      
      // JSON file
      const outputData = {
        timestamp: new Date().toISOString(),
        totalJobs: emailJobs.length,
        uniqueEmails: uniqueEmails.length,
        jobs: sentEmails,
        uniqueEmailList: uniqueEmails
      };
      
      fs.writeFileSync('email-jobs.json', JSON.stringify(outputData, null, 2));
      console.log('\n💾 Data saved to email-jobs.json');
      
      // CSV file
      const csvContent = [
        'Email,Business ID,Status,Created At,Send At,Sent At,Job ID,Campaign ID,Template ID,Group ID',
        ...sentEmails.map(job => `"${job.email}","${job.businessId}","${job.status}","${job.createdAt}","${job.sendAt}","${job.sentAt}","${job.jobId}","${job.campaignId}","${job.templateId}","${job.groupId}"`)
      ].join('\n');
      
      fs.writeFileSync('email-jobs.csv', csvContent);
      console.log('💾 CSV saved to email-jobs.csv');
      
      // Simple email list
      const emailList = uniqueEmails.join('\n');
      fs.writeFileSync('email-jobs-list.txt', emailList);
      console.log('💾 Email list saved to email-jobs-list.txt');
      
      // Show unique emails
      console.log('\n📧 Unique Email Addresses:');
      uniqueEmails.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
      });
      
    } else {
      console.log('❌ No email jobs found');
    }
    
  } catch (error) {
    console.error('❌ Error getting email jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getEmailJobs();
