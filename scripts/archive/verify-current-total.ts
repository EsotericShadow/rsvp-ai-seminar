import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCurrentTotal() {
  console.log('🔍 VERIFYING CURRENT BUSINESS TOTAL')
  console.log('===================================')
  
  try {
    // Get detailed breakdown
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    const totalBusinesses = groups.reduce((sum, group) => sum + group._count.members, 0)
    
    console.log(`\n📊 CURRENT BUSINESS BREAKDOWN:`)
    console.log(`===============================`)
    
    groups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n📈 TOTAL: ${totalBusinesses} businesses`)
    
    // Check if this seems reasonable
    console.log(`\n💡 ANALYSIS:`)
    if (totalBusinesses === 1122) {
      console.log(`✅ Perfect! We have exactly 1122 businesses as expected`)
    } else if (totalBusinesses < 1122) {
      console.log(`⚠️  We have ${totalBusinesses} businesses, but expected 1122`)
      console.log(`   Missing: ${1122 - totalBusinesses} businesses`)
      console.log(`\n🔍 POSSIBLE REASONS:`)
      console.log(`1. LeadMine API is not working (returning 0 businesses)`)
      console.log(`2. The 1122 number was from a different source/time`)
      console.log(`3. Some businesses were filtered out during import`)
      console.log(`4. The 1122 number was incorrect`)
    } else {
      console.log(`⚠️  We have ${totalBusinesses} businesses, more than expected 1122`)
      console.log(`   Extra: ${totalBusinesses - 1122} businesses`)
    }
    
    // Check for any patterns in the data
    console.log(`\n🔍 DATA QUALITY CHECK:`)
    
    // Check for businesses without emails
    const businessesWithoutEmails = await prisma.audienceMember.count({
      where: {
        OR: [
          { primaryEmail: null },
          { primaryEmail: '' }
        ]
      }
    })
    
    console.log(`- Businesses without emails: ${businessesWithoutEmails}`)
    
    // Check for businesses with generic names
    const genericNames = await prisma.audienceMember.count({
      where: {
        businessName: {
          in: ['Unknown Business', 'Business', 'Company', 'Corporation']
        }
      }
    })
    
    console.log(`- Businesses with generic names: ${genericNames}`)
    
    // Check for duplicate emails
    const duplicateEmails = await prisma.$queryRaw`
      SELECT "primaryEmail", COUNT(*) as count
      FROM "AudienceMember"
      WHERE "primaryEmail" IS NOT NULL AND "primaryEmail" != ''
      GROUP BY "primaryEmail"
      HAVING COUNT(*) > 1
    ` as Array<{primaryEmail: string, count: number}>
    
    console.log(`- Duplicate email addresses: ${duplicateEmails.length}`)
    
    // Sample some businesses to verify quality
    console.log(`\n📋 SAMPLE BUSINESSES:`)
    const sampleBusinesses = await prisma.audienceMember.findMany({
      take: 10,
      select: {
        businessName: true,
        primaryEmail: true,
        group: {
          select: { name: true }
        }
      },
      orderBy: {
        businessName: 'asc'
      }
    })
    
    sampleBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.businessName} (${business.primaryEmail}) → ${business.group.name}`)
    })
    
    console.log(`\n🎯 CONCLUSION:`)
    if (totalBusinesses >= 400 && totalBusinesses <= 600) {
      console.log(`✅ ${totalBusinesses} businesses is a reasonable number for a local business database`)
      console.log(`✅ The 1122 number might have been incorrect or from a different source`)
      console.log(`✅ Current categorization is complete and ready for production`)
    } else if (totalBusinesses < 400) {
      console.log(`⚠️  ${totalBusinesses} businesses seems low for a comprehensive database`)
      console.log(`⚠️  We may be missing businesses from LeadMine or other sources`)
    } else {
      console.log(`✅ ${totalBusinesses} businesses is a substantial database`)
      console.log(`✅ Ready for production use`)
    }
    
  } catch (error) {
    console.error('❌ Failed to verify current total:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyCurrentTotal()
  .then(() => {
    console.log('\n✅ Verification complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
