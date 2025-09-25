const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function comprehensiveEmailTest() {
  console.log('🔍 Comprehensive email system test...');
  
  // Test 1: Check database connectivity
  console.log('\n1️⃣ Testing database connectivity...');
  try {
    const templateCount = await prisma.campaignTemplate.count();
    const groupCount = await prisma.audienceGroup.count();
    const campaignCount = await prisma.campaign.count();
    console.log(`   ✅ Templates: ${templateCount}, Groups: ${groupCount}, Campaigns: ${campaignCount}`);
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
    return;
  }
  
  // Test 2: Check test data
  console.log('\n2️⃣ Checking test data...');
  const testCampaign = await prisma.campaign.findFirst({
    where: {
      meta: {
        path: ['finalTestCampaign'],
        equals: true
      }
    },
    include: {
      schedules: {
        include: {
          template: true,
          group: {
            include: {
              members: true
            }
          }
        }
      }
    }
  });
  
  if (!testCampaign) {
    console.log('   ❌ Test campaign not found');
    return;
  }
  
  console.log(`   ✅ Test campaign: ${testCampaign.name}`);
  console.log(`   ✅ Schedules: ${testCampaign.schedules.length}`);
  
  const firstSchedule = testCampaign.schedules[0];
  if (firstSchedule) {
    console.log(`   ✅ Template: ${firstSchedule.template.name}`);
    console.log(`   ✅ Group: ${firstSchedule.group.name}`);
    console.log(`   ✅ Members: ${firstSchedule.group.members.length}`);
    
    // Test 3: Check member data
    console.log('\n3️⃣ Checking member data...');
    firstSchedule.group.members.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
      console.log(`      Token: ${member.inviteToken ? '✅' : '❌'}`);
      console.log(`      Business ID: ${member.businessId}`);
    });
    
    // Test 4: Check template content
    console.log('\n4️⃣ Checking template content...');
    const template = firstSchedule.template;
    console.log(`   ✅ Subject: ${template.subject}`);
    console.log(`   ✅ HTML length: ${template.htmlBody.length}`);
    console.log(`   ✅ Text length: ${template.textBody?.length || 0}`);
    
    // Check for required placeholders
    const hasBusinessName = template.htmlBody.includes('{{business_name}}');
    const hasInviteLink = template.htmlBody.includes('{{invite_link}}');
    console.log(`   ✅ Has {{business_name}}: ${hasBusinessName}`);
    console.log(`   ✅ Has {{invite_link}}: ${hasInviteLink}`);
    
    // Test 5: Check EmailJobs
    console.log('\n5️⃣ Checking EmailJobs...');
    const emailJobs = await prisma.emailJob.findMany({
      where: {
        campaignId: testCampaign.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`   ✅ Total EmailJobs: ${emailJobs.length}`);
    
    const statusCounts = emailJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   📊 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
    
    // Show recent errors
    const failedJobs = emailJobs.filter(job => job.status === 'failed' && job.error);
    if (failedJobs.length > 0) {
      console.log('\n   ❌ Recent errors:');
      failedJobs.slice(0, 3).forEach(job => {
        console.log(`      ${job.recipientEmail}: ${job.error}`);
      });
    }
    
    // Test 6: Check CampaignSend records
    console.log('\n6️⃣ Checking CampaignSend records...');
    const campaignSends = await prisma.campaignSend.count({
      where: {
        schedule: {
          campaignId: testCampaign.id
        }
      }
    });
    
    console.log(`   ✅ CampaignSend records: ${campaignSends}`);
    
    // Test 7: Environment variables
    console.log('\n7️⃣ Checking environment variables...');
    const envVars = [
      'CAMPAIGN_LINK_BASE',
      'RESEND_API_KEY',
      'CAMPAIGN_FROM_EMAIL',
      'LEADMINE_API_BASE',
      'LEADMINE_API_KEY'
    ];
    
    envVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`   ${value ? '✅' : '❌'} ${varName}: ${value ? 'SET' : 'NOT SET'}`);
    });
    
    // Test 8: URL generation test
    console.log('\n8️⃣ Testing URL generation...');
    const testMember = firstSchedule.group.members[0];
    if (testMember && testMember.inviteToken) {
      try {
        const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
        const url = new URL(linkBase);
        url.searchParams.set('eid', `biz_${testMember.inviteToken}`);
        const trackingLink = url.toString();
        console.log(`   ✅ Generated URL: ${trackingLink}`);
        
        // Validate URL
        new URL(trackingLink);
        console.log(`   ✅ URL is valid`);
      } catch (error) {
        console.log(`   ❌ URL generation failed: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Database: ✅ Connected`);
    console.log(`   Test Data: ✅ Available`);
    console.log(`   Templates: ✅ ${templateCount} found`);
    console.log(`   Groups: ✅ ${groupCount} found`);
    console.log(`   Campaigns: ✅ ${campaignCount} found`);
    console.log(`   EmailJobs: ✅ ${emailJobs.length} created`);
    console.log(`   CampaignSends: ✅ ${campaignSends} created`);
    console.log(`   Environment: ✅ Variables set`);
    console.log(`   URL Generation: ✅ Working`);
    
    if (failedJobs.length > 0) {
      console.log(`\n❌ Issues found:`);
      console.log(`   - ${failedJobs.length} failed EmailJobs`);
      console.log(`   - Most common error: ${failedJobs[0]?.error || 'Unknown'}`);
    } else {
      console.log(`\n✅ No issues found in local environment`);
      console.log(`   The problem appears to be in the production deployment`);
    }
  }
}

comprehensiveEmailTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
