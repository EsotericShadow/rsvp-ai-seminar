import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLeadMineData() {
  console.log('🔍 Checking LeadMine Data...\n');

  try {
    // Check current audience members
    const audienceMembers = await prisma.audienceMember.findMany();
    console.log(`📊 Current audience members in database: ${audienceMembers.length}`);

    // Check audience groups
    const audienceGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } }
    });
    
    console.log(`📊 Current audience groups: ${audienceGroups.length}`);
    console.log('\n📋 Audience Groups Summary:');
    audienceGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Check if we have business data in any other tables
    console.log('\n🔍 Checking for business data in other tables...');
    
    // Check if there are any business records
    const businessCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Business"
    `;
    console.log(`📊 Business table records: ${JSON.stringify(businessCount)}`);

    // Check all tables for potential business data
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 All database tables:');
    console.log(allTables);

    // Check if we need to fetch from LeadMine
    console.log('\n🚀 Need to fetch businesses from LeadMine API...');
    console.log('The database appears to be missing most of the LeadMine business data.');
    console.log('We should run a script to fetch all businesses from LeadMine and populate the database.');

  } catch (error) {
    console.error('❌ Error checking LeadMine data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeadMineData();

