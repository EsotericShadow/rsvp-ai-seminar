const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function deleteAllTemplates() {
  console.log('🗑️ Deleting all email templates...');
  
  try {
    // First delete all campaign schedules that reference templates
    await prisma.campaignSchedule.deleteMany({});
    console.log('✅ Deleted all campaign schedules');
    
    // Then delete all email jobs that reference templates
    await prisma.emailJob.deleteMany({});
    console.log('✅ Deleted all email jobs');
    
    // Then delete all campaign sends that reference templates
    await prisma.campaignSend.deleteMany({});
    console.log('✅ Deleted all campaign sends');
    
    // Finally delete all templates
    const deletedTemplates = await prisma.campaignTemplate.deleteMany({});
    console.log(`✅ Deleted ${deletedTemplates.count} email templates`);
    
    console.log('\n🎉 All templates and related data cleaned up successfully!');
    console.log('📝 Ready to create new templates with proper structure');
    
  } catch (error) {
    console.log('❌ Error deleting templates:', error.message);
  }
}

deleteAllTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
