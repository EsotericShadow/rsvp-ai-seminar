require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function analyzeDeliverabilityIssues() {
  try {
    console.log('📧 Analyzing email deliverability issues...');
    
    // Get all email jobs with failed status
    const failedEmailJobs = await prisma.emailJob.findMany({
      where: {
        status: 'failed'
      },
      select: {
        id: true,
        recipientEmail: true,
        status: true,
        sentAt: true,
        error: true
      }
    });
    
    console.log(`📊 Found ${failedEmailJobs.length} failed email jobs`);
    
    // Analyze failure patterns
    const failureReasons = {};
    const blockedDomains = {};
    const blockedIPs = new Set();
    
    failedEmailJobs.forEach(job => {
      const email = job.recipientEmail;
      const domain = email.split('@')[1];
      
      // Extract failure reason
      let reason = 'Unknown';
      if (job.error) {
        if (job.error.includes('block list')) {
          reason = 'IP Blocked';
        } else if (job.error.includes('spam')) {
          reason = 'Spam Filter';
        } else if (job.error.includes('reputation')) {
          reason = 'IP Reputation';
        } else if (job.error.includes('timeout')) {
          reason = 'Connection Timeout';
        } else if (job.error.includes('rejected')) {
          reason = 'Message Rejected';
        }
      }
      
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      blockedDomains[domain] = (blockedDomains[domain] || 0) + 1;
      
      // Extract IP addresses from error messages
      const ipMatches = job.error?.match(/\d+\.\d+\.\d+\.\d+/g);
      if (ipMatches) {
        ipMatches.forEach(ip => blockedIPs.add(ip));
      }
    });
    
    console.log('\n📊 Failure Analysis:');
    console.log('='.repeat(50));
    
    console.log('\n🔍 Failure Reasons:');
    Object.entries(failureReasons).forEach(([reason, count]) => {
      console.log(`- ${reason}: ${count} emails`);
    });
    
    console.log('\n🌐 Most Blocked Domains:');
    const sortedDomains = Object.entries(blockedDomains)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedDomains.forEach(([domain, count]) => {
      console.log(`- ${domain}: ${count} blocked emails`);
    });
    
    console.log('\n🔒 Blocked IP Addresses:');
    Array.from(blockedIPs).forEach(ip => {
      console.log(`- ${ip}`);
    });
    
    // Get success vs failure rates
    const totalEmailJobs = await prisma.emailJob.count();
    const successfulJobs = await prisma.emailJob.count({
      where: { status: 'sent' }
    });
    const processingJobs = await prisma.emailJob.count({
      where: { status: 'processing' }
    });
    
    const successRate = ((successfulJobs / totalEmailJobs) * 100).toFixed(2);
    const failureRate = ((failedEmailJobs.length / totalEmailJobs) * 100).toFixed(2);
    
    console.log('\n📈 Overall Statistics:');
    console.log(`- Total email jobs: ${totalEmailJobs}`);
    console.log(`- Successful: ${successfulJobs} (${successRate}%)`);
    console.log(`- Processing: ${processingJobs}`);
    console.log(`- Failed: ${failedEmailJobs.length} (${failureRate}%)`);
    
    // Create detailed analysis file
    const analysisData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEmailJobs: totalEmailJobs,
        successfulJobs: successfulJobs,
        processingJobs: processingJobs,
        failedJobs: failedEmailJobs.length,
        successRate: parseFloat(successRate),
        failureRate: parseFloat(failureRate)
      },
      failureReasons: failureReasons,
      blockedDomains: blockedDomains,
      blockedIPs: Array.from(blockedIPs),
      failedEmails: failedEmailJobs.map(job => ({
        email: job.recipientEmail,
        domain: job.recipientEmail.split('@')[1],
        status: job.status,
        sentAt: job.sentAt,
        errorMessage: job.error
      }))
    };
    
    fs.writeFileSync('deliverability-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Deliverability analysis saved to deliverability-analysis.json');
    
    // Create CSV of failed emails
    const csvRows = ['Email', 'Domain', 'Status', 'Sent At', 'Error Message'];
    failedEmailJobs.forEach(job => {
      csvRows.push(`"${job.recipientEmail}","${job.recipientEmail.split('@')[1]}","${job.status}","${job.sentAt || 'N/A'}","${(job.error || '').replace(/"/g, '""')}"`);
    });
    fs.writeFileSync('failed-emails.csv', csvRows.join('\n'));
    console.log('💾 Failed emails CSV saved to failed-emails.csv');
    
    // Recommendations
    console.log('\n🚨 CRITICAL RECOMMENDATIONS:');
    console.log('='.repeat(50));
    console.log('1. 🛑 STOP ALL EMAIL SENDING IMMEDIATELY');
    console.log('2. 📞 Contact SendGrid Support about IP reputation issues');
    console.log('3. 🔄 Request new IP addresses from SendGrid');
    console.log('4. 📧 Set up dedicated IP addresses for your account');
    console.log('5. 🏷️  Implement proper email authentication (SPF, DKIM, DMARC)');
    console.log('6. 📊 Warm up new IP addresses gradually');
    console.log('7. 🧹 Clean your email list (remove invalid/bounced emails)');
    console.log('8. 📝 Review email content for spam triggers');
    console.log('9. ⏰ Implement proper sending intervals (not bulk)');
    console.log('10. 🎯 Focus on engagement and deliverability best practices');
    
    return analysisData;
    
  } catch (error) {
    console.error('❌ Error analyzing deliverability issues:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeDeliverabilityIssues()
  .then(result => {
    console.log('\n⚠️  DELIVERABILITY CRISIS DETECTED!');
    console.log(`Failure rate: ${result.summary.failureRate}%`);
    console.log('Immediate action required to prevent further IP reputation damage.');
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
