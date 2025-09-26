const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProperEmailJobs() {
  try {
    console.log('=== CREATING PROPER EMAIL JOBS ===');
    
    // Find the schedule with the large audience
    const schedule = await prisma.campaignSchedule.findUnique({
      where: { id: 'cmg0759p40004u6y6dng35xxi' },
      include: {
        template: true,
        group: {
          include: {
            members: true
          }
        }
      }
    });
    
    if (!schedule) {
      console.log('❌ Schedule not found');
      return;
    }
    
    console.log(`📊 Schedule: ${schedule.id}`);
    console.log(`📊 Template: ${schedule.template.name}`);
    console.log(`📊 Audience: ${schedule.group.name} with ${schedule.group.members.length} members`);
    
    // Clean up any existing email jobs for this schedule
    await prisma.emailJob.deleteMany({
      where: { scheduleId: schedule.id }
    });
    
    console.log('✅ Cleaned up existing email jobs for this schedule');
    
    // Create email jobs for each audience member
    const emailJobs = [];
    const batchSize = 100;
    
    for (let i = 0; i < schedule.group.members.length; i += batchSize) {
      const batch = schedule.group.members.slice(i, i + batchSize);
      
      const jobs = batch.map(member => ({
        campaignId: schedule.campaignId,
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        groupId: schedule.groupId,
        recipientEmail: member.primaryEmail,
        recipientId: member.id,
        sendAt: new Date(),
        status: 'scheduled',
        meta: {
          businessName: member.businessName,
          businessId: member.businessId,
          inviteToken: member.inviteToken,
          tagsSnapshot: member.tagsSnapshot,
          originalMemberData: member
        }
      }));
      
      emailJobs.push(...jobs);
      
      console.log(`✅ Prepared batch ${Math.floor(i / batchSize) + 1}: ${jobs.length} jobs`);
    }
    
    // Create all email jobs in batches
    console.log(`🚀 Creating ${emailJobs.length} email jobs...`);
    
    for (let i = 0; i < emailJobs.length; i += batchSize) {
      const batch = emailJobs.slice(i, i + batchSize);
      
      await prisma.emailJob.createMany({
        data: batch
      });
      
      console.log(`✅ Created email jobs ${i + 1}-${Math.min(i + batchSize, emailJobs.length)} of ${emailJobs.length}`);
    }
    
    // Verify the jobs were created
    const createdJobs = await prisma.emailJob.findMany({
      where: { scheduleId: schedule.id },
      take: 5
    });
    
    console.log('📧 Sample created email jobs:');
    for (const job of createdJobs) {
      console.log(`  - ${job.recipientEmail} - ${job.status} - token: ${job.meta?.inviteToken || 'N/A'}`);
    }
    
    const totalJobs = await prisma.emailJob.count({
      where: { scheduleId: schedule.id }
    });
    
    console.log(`\n🎉 SUCCESS! Created ${totalJobs} email jobs for the campaign`);
    console.log('📧 All jobs are ready to be processed by the cron job');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProperEmailJobs();
