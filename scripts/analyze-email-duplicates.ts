import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function analyzeEmailDuplicates() {
  console.log('🔍 ANALYZING EMAIL DUPLICATES')
  console.log('=============================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Find duplicates based on email exact match
    const duplicates = await prisma.$queryRaw`
      SELECT "primaryEmail", COUNT(*) as count, 
             STRING_AGG("businessName", ' | ') as business_names,
             STRING_AGG("businessId", ' | ') as business_ids
      FROM "AudienceMember"
      WHERE "primaryEmail" IS NOT NULL AND "primaryEmail" != ''
      GROUP BY "primaryEmail"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    ` as Array<{primaryEmail: string, count: number, business_names: string, business_ids: string}>
    
    console.log(`\n🔍 Found ${duplicates.length} email addresses with duplicates`)
    
    if (duplicates.length > 0) {
      console.log(`\n📋 Analyzing duplicate emails:`)
      
      let legitimateDuplicates = 0
      let actualDuplicates = 0
      
      duplicates.forEach(({primaryEmail, count, business_names, business_ids}) => {
        const names = business_names.split(' | ')
        const ids = business_ids.split(' | ')
        
        // Check if these are legitimate duplicates (same business, different entries)
        const uniqueNames = new Set(names)
        const uniqueIds = new Set(ids)
        
        if (uniqueNames.size === 1 && uniqueIds.size === 1) {
          // Same business name and ID - this is a true duplicate
          actualDuplicates++
          console.log(`   🔴 TRUE DUPLICATE: "${primaryEmail}" (${count} times)`)
          console.log(`      - Business: ${names[0]}`)
          console.log(`      - IDs: ${ids.join(', ')}`)
        } else if (uniqueNames.size === 1) {
          // Same business name but different IDs - likely data inconsistency
          legitimateDuplicates++
          console.log(`   🟡 DATA INCONSISTENCY: "${primaryEmail}" (${count} times)`)
          console.log(`      - Business: ${names[0]}`)
          console.log(`      - IDs: ${ids.join(', ')}`)
        } else {
          // Different business names - legitimate (franchises, chains, etc.)
          legitimateDuplicates++
          console.log(`   🟢 LEGITIMATE: "${primaryEmail}" (${count} times)`)
          console.log(`      - Businesses: ${names.join(', ')}`)
        }
      })
      
      console.log(`\n📊 DUPLICATE ANALYSIS:`)
      console.log(`- Legitimate duplicates (different businesses): ${legitimateDuplicates}`)
      console.log(`- Actual duplicates (same business): ${actualDuplicates}`)
      console.log(`- Total email addresses with duplicates: ${duplicates.length}`)
      
      if (actualDuplicates > 0) {
        console.log(`\n⚠️  We should only remove the ${actualDuplicates} actual duplicates`)
        console.log(`   The ${legitimateDuplicates} legitimate duplicates should be kept`)
      } else {
        console.log(`\n✅ All duplicates are legitimate - no actual duplicates found`)
      }
    } else {
      console.log(`\n✅ No email duplicates found!`)
    }
    
    // Check if we have the right total
    console.log(`\n📊 TARGET ANALYSIS:`)
    console.log(`- Current count: ${currentCount}`)
    console.log(`- Expected: 1122`)
    console.log(`- Difference: ${currentCount - 1122}`)
    
    if (currentCount === 1122) {
      console.log(`\n✅ PERFECT! We have exactly 1122 businesses as expected`)
    } else if (currentCount < 1122) {
      console.log(`\n⚠️  We have ${currentCount} businesses, missing ${1122 - currentCount}`)
      console.log(`   This suggests some businesses in LeadMine don't have emails or have empty emails`)
    } else {
      console.log(`\n⚠️  We have ${currentCount} businesses, ${currentCount - 1122} more than expected`)
    }
    
  } catch (error) {
    console.error('❌ Failed to analyze email duplicates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

analyzeEmailDuplicates()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })
