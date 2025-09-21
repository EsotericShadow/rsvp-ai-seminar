import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAudienceGroups() {
  console.log('📋 Checking available audience groups...\n');

  try {
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${groups.length} audience groups:\n`);

    for (const group of groups) {
      console.log(`📁 ${group.name}`);
      console.log(`   ID: ${group.id}`);
      console.log(`   Members: ${group._count.members}`);
      console.log(`   Description: ${group.description || 'No description'}`);
      console.log('');
    }

    // Show campaign names for comparison
    console.log('🎯 Campaign names for comparison:');
    const campaigns = await prisma.campaign.findMany({
      select: {
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    campaigns.forEach(campaign => {
      console.log(`   • ${campaign.name}`);
    });

  } catch (error) {
    console.error('❌ Error checking audience groups:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkAudienceGroups()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
