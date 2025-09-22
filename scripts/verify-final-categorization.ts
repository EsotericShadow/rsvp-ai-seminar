import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFinalCategorization() {
  console.log('🔍 Verifying Final Categorization Accuracy...\n');

  try {
    // Get all audience groups with their members
    const groups = await prisma.audienceGroup.findMany({
      include: {
        members: {
          take: 5, // Sample 5 members from each group
          orderBy: { businessName: 'asc' }
        },
        _count: { select: { members: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log('📊 Sample Verification by Category:\n');

    for (const group of groups) {
      console.log(`🏷️  ${group.name} (${group._count.members} total businesses):`);
      
      if (group.members.length === 0) {
        console.log('   ⚠️  No members in this group');
        continue;
      }

      // Show sample businesses
      for (const member of group.members) {
        console.log(`   • ${member.businessName}`);
      }

      console.log('');
    }

    // Check for obvious misclassifications
    console.log('🔍 Checking for obvious misclassifications:\n');
    
    const allMembers = await prisma.audienceMember.findMany({
      include: { group: true }
    });

    const misclassifications = [];
    
    for (const member of allMembers) {
      const name = member.businessName.toLowerCase();
      const category = member.group.name.toLowerCase();
      
      // Check for obvious misclassifications
      if (name.includes('dairy queen') && !category.includes('food')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be FOOD`);
      }
      if (name.includes('construction') && !category.includes('construction')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be CONSTRUCTION`);
      }
      if (name.includes('restaurant') && !category.includes('food')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be FOOD`);
      }
      if (name.includes('auto') && !category.includes('automotive')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be AUTOMOTIVE`);
      }
      if (name.includes('medical') && !category.includes('healthcare')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be HEALTHCARE`);
      }
      if (name.includes('bank') && !category.includes('financial')) {
        misclassifications.push(`${member.businessName} in ${member.group.name} - should be FINANCIAL`);
      }
    }

    if (misclassifications.length > 0) {
      console.log('❌ Found misclassifications:');
      misclassifications.forEach(mis => {
        console.log(`   • ${mis}`);
      });
    } else {
      console.log('✅ No obvious misclassifications found!');
    }

    // Overall summary
    console.log('\n📊 Overall Summary:');
    const totalMembers = groups.reduce((sum, group) => sum + group._count.members, 0);
    console.log(`   📧 Total Audience Groups: ${groups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    console.log(`   ❌ Misclassifications Found: ${misclassifications.length}`);

  } catch (error) {
    console.error('❌ Error verifying categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFinalCategorization();
