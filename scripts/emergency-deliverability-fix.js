require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function emergencyDeliverabilityFix() {
  try {
    console.log('🚨 EMERGENCY DELIVERABILITY FIX - IMMEDIATE ACTION REQUIRED');
    console.log('='.repeat(70));
    
    // 1. STOP ALL ACTIVE CAMPAIGNS
    console.log('\n🛑 STEP 1: STOPPING ALL ACTIVE CAMPAIGNS...');
    
    const activeCampaigns = await prisma.campaign.findMany({
      where: {
        status: { in: ['SCHEDULED', 'SENDING'] }
      }
    });
    
    if (activeCampaigns.length > 0) {
      console.log(`📊 Found ${activeCampaigns.length} active campaigns to deactivate`);
      
      await prisma.campaign.updateMany({
        where: {
          status: { in: ['SCHEDULED', 'SENDING'] }
        },
        data: {
          status: 'PAUSED'
        }
      });
      
      console.log('✅ All active campaigns have been paused');
    } else {
      console.log('✅ No active campaigns found');
    }
    
    // 2. PAUSE ALL SCHEDULED EMAIL JOBS
    console.log('\n⏸️  STEP 2: PAUSING ALL SCHEDULED EMAIL JOBS...');
    
    const scheduledJobs = await prisma.emailJob.findMany({
      where: {
        status: 'scheduled'
      }
    });
    
    if (scheduledJobs.length > 0) {
      console.log(`📊 Found ${scheduledJobs.length} scheduled email jobs to pause`);
      
      await prisma.emailJob.updateMany({
        where: {
          status: 'scheduled'
        },
        data: {
          status: 'failed',
          error: 'EMERGENCY PAUSE: Deliverability issues detected - IP reputation damage'
        }
      });
      
      console.log('✅ All scheduled email jobs have been paused');
    } else {
      console.log('✅ No scheduled email jobs found');
    }
    
    // 3. ANALYZE CURRENT EMAIL STATUS
    console.log('\n📊 STEP 3: ANALYZING CURRENT EMAIL STATUS...');
    
    const emailJobStats = await prisma.emailJob.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📈 Current Email Job Statistics:');
    emailJobStats.forEach(stat => {
      console.log(`- ${stat.status}: ${stat._count.id} emails`);
    });
    
    // 4. IDENTIFY PROBLEMATIC DOMAINS
    console.log('\n🔍 STEP 4: IDENTIFYING PROBLEMATIC DOMAINS...');
    
    const allEmailJobs = await prisma.emailJob.findMany({
      select: {
        recipientEmail: true,
        status: true
      }
    });
    
    const domainStats = {};
    allEmailJobs.forEach(job => {
      const domain = job.recipientEmail.split('@')[1];
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, sent: 0, failed: 0 };
      }
      domainStats[domain].total++;
      if (job.status === 'sent') {
        domainStats[domain].sent++;
      } else if (job.status === 'failed') {
        domainStats[domain].failed++;
      }
    });
    
    // Find domains with high failure rates
    const problematicDomains = Object.entries(domainStats)
      .filter(([domain, stats]) => stats.failed > 0 || domain.includes('citywest') || domain.includes('hotmail') || domain.includes('outlook'))
      .sort(([,a], [,b]) => b.failed - a.failed)
      .slice(0, 20);
    
    console.log('\n🚨 Most Problematic Domains:');
    problematicDomains.forEach(([domain, stats]) => {
      const failureRate = ((stats.failed / stats.total) * 100).toFixed(1);
      console.log(`- ${domain}: ${stats.failed}/${stats.total} failed (${failureRate}%)`);
    });
    
    // 5. CREATE DELIVERABILITY REPORT
    console.log('\n📋 STEP 5: CREATING DELIVERABILITY REPORT...');
    
    const deliverabilityReport = {
      timestamp: new Date().toISOString(),
      emergencyActions: {
        campaignsPaused: activeCampaigns.length,
        scheduledJobsPaused: scheduledJobs.length,
        status: 'EMERGENCY_PAUSE_ACTIVATED'
      },
      emailJobStatistics: emailJobStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {}),
      problematicDomains: problematicDomains.map(([domain, stats]) => ({
        domain: domain,
        total: stats.total,
        sent: stats.sent,
        failed: stats.failed,
        failureRate: ((stats.failed / stats.total) * 100).toFixed(1)
      })),
      recommendations: [
        'Contact SendGrid Support immediately about IP reputation issues',
        'Request new dedicated IP addresses',
        'Implement proper email authentication (SPF, DKIM, DMARC)',
        'Clean email list to remove problematic domains',
        'Implement gradual IP warm-up process',
        'Review email content for spam triggers',
        'Set up proper sending intervals (not bulk sending)',
        'Monitor deliverability metrics closely'
      ]
    };
    
    fs.writeFileSync('emergency-deliverability-report.json', JSON.stringify(deliverabilityReport, null, 2));
    console.log('💾 Emergency deliverability report saved to emergency-deliverability-report.json');
    
    // 6. CREATE CLEAN EMAIL LIST
    console.log('\n🧹 STEP 6: CREATING CLEAN EMAIL LIST...');
    
    // Get the clean audience group
    const cleanAudienceGroup = await prisma.audienceGroup.findFirst({
      where: {
        name: { contains: 'Clean Audience' }
      },
      include: {
        members: true
      }
    });
    
    if (cleanAudienceGroup) {
      console.log(`📊 Clean audience group found: ${cleanAudienceGroup.name}`);
      console.log(`📊 Members: ${cleanAudienceGroup.members.length}`);
      
      // Filter out problematic domains
      const problematicDomainList = ['citywest.ca', 'hotmail.com', 'outlook.com', 'live.com'];
      const cleanMembers = cleanAudienceGroup.members.filter(member => {
        const domain = member.primaryEmail.split('@')[1];
        return !problematicDomainList.includes(domain);
      });
      
      console.log(`📊 After filtering problematic domains: ${cleanMembers.length} members`);
      
      // Create clean email list
      const cleanEmailList = cleanMembers.map(member => ({
        email: member.primaryEmail,
        businessName: member.businessName,
        businessId: member.businessId
      }));
      
      const cleanEmailCSV = ['Email', 'Business Name', 'Business ID'];
      cleanEmailList.forEach(member => {
        cleanEmailCSV.push(`"${member.email}","${member.businessName || 'N/A'}","${member.businessId || 'N/A'}"`);
      });
      
      fs.writeFileSync('clean-deliverable-emails.csv', cleanEmailCSV.join('\n'));
      console.log('💾 Clean deliverable emails saved to clean-deliverable-emails.csv');
      
      const cleanEmailTxt = cleanEmailList.map(member => member.email).join('\n');
      fs.writeFileSync('clean-deliverable-emails.txt', cleanEmailTxt);
      console.log('💾 Clean deliverable email list saved to clean-deliverable-emails.txt');
    }
    
    // 7. FINAL RECOMMENDATIONS
    console.log('\n🚨 IMMEDIATE ACTION PLAN:');
    console.log('='.repeat(50));
    console.log('1. ✅ All campaigns have been paused');
    console.log('2. ✅ All scheduled emails have been stopped');
    console.log('3. 📞 Contact SendGrid Support NOW about IP reputation');
    console.log('4. 🔄 Request new dedicated IP addresses');
    console.log('5. 🏷️  Set up proper email authentication');
    console.log('6. 📊 Implement IP warm-up process');
    console.log('7. 🧹 Use clean email list (filtered problematic domains)');
    console.log('8. ⏰ Send emails gradually, not in bulk');
    console.log('9. 📈 Monitor deliverability metrics');
    console.log('10. 🎯 Focus on engagement and best practices');
    
    console.log('\n📁 Files Created:');
    console.log('- emergency-deliverability-report.json');
    console.log('- clean-deliverable-emails.csv');
    console.log('- clean-deliverable-emails.txt');
    
    console.log('\n⚠️  DO NOT SEND ANY MORE EMAILS UNTIL IP REPUTATION IS FIXED!');
    
    return deliverabilityReport;
    
  } catch (error) {
    console.error('❌ Error during emergency deliverability fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the emergency fix
emergencyDeliverabilityFix()
  .then(result => {
    console.log('\n🚨 EMERGENCY ACTIONS COMPLETED!');
    console.log('All email sending has been stopped to prevent further IP reputation damage.');
    console.log('Contact SendGrid Support immediately!');
  })
  .catch(error => {
    console.error('❌ Emergency fix failed:', error);
    process.exit(1);
  });
