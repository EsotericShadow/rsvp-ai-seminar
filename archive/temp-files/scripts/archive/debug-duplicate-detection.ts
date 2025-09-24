import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

const prisma = new PrismaClient()

async function debugDuplicateDetection() {
  console.log('🔍 DEBUGGING DUPLICATE DETECTION')
  console.log('================================')
  
  try {
    // Get current database count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Get all existing business names and emails
    const existingBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessId: true,
        businessName: true,
        primaryEmail: true
      }
    })
    
    const existingNames = new Set(existingBusinesses.map(b => b.businessName?.toLowerCase()))
    const existingEmails = new Set(existingBusinesses.map(b => b.primaryEmail?.toLowerCase()))
    const existingBusinessIds = new Set(existingBusinesses.map(b => b.businessId))
    
    console.log(`\n🔍 Existing businesses:`)
    console.log(`- By name: ${existingNames.size}`)
    console.log(`- By email: ${existingEmails.size}`)
    console.log(`- By businessId: ${existingBusinessIds.size}`)
    
    // Check for duplicates in the database
    const duplicateNames = new Map()
    const duplicateEmails = new Map()
    
    existingBusinesses.forEach(business => {
      const name = business.businessName?.toLowerCase()
      const email = business.primaryEmail?.toLowerCase()
      
      if (name) {
        duplicateNames.set(name, (duplicateNames.get(name) || 0) + 1)
      }
      if (email) {
        duplicateEmails.set(email, (duplicateEmails.get(email) || 0) + 1)
      }
    })
    
    const actualDuplicateNames = Array.from(duplicateNames.entries()).filter(([name, count]) => count > 1)
    const actualDuplicateEmails = Array.from(duplicateEmails.entries()).filter(([email, count]) => count > 1)
    
    console.log(`\n🔍 Duplicates in database:`)
    console.log(`- Duplicate names: ${actualDuplicateNames.length}`)
    console.log(`- Duplicate emails: ${actualDuplicateEmails.length}`)
    
    if (actualDuplicateNames.length > 0) {
      console.log(`\n📋 Sample duplicate names:`)
      actualDuplicateNames.slice(0, 5).forEach(([name, count]) => {
        console.log(`   - "${name}": ${count} times`)
      })
    }
    
    if (actualDuplicateEmails.length > 0) {
      console.log(`\n📋 Sample duplicate emails:`)
      actualDuplicateEmails.slice(0, 5).forEach(([email, count]) => {
        console.log(`   - "${email}": ${count} times`)
      })
    }
    
    // Test LeadMine import with better duplicate detection
    console.log(`\n🔍 Testing LeadMine import with businessId-based duplicate detection...`)
    
    let totalFromLeadMine = 0
    let newBusinesses = 0
    let duplicateBusinesses = 0
    let cursor: string | undefined
    
    while (true) {
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        break
      }
      
      totalFromLeadMine += response.data.length
      
      response.data.forEach(business => {
        if (existingBusinessIds.has(business.id)) {
          duplicateBusinesses++
        } else {
          newBusinesses++
        }
      })
      
      cursor = response.pagination?.nextCursor
      if (!cursor) break
    }
    
    console.log(`\n📊 LEADMINE ANALYSIS:`)
    console.log(`- Total businesses in LeadMine: ${totalFromLeadMine}`)
    console.log(`- New businesses (not in DB): ${newBusinesses}`)
    console.log(`- Duplicate businesses (already in DB): ${duplicateBusinesses}`)
    console.log(`- Current in database: ${currentCount}`)
    console.log(`- Expected total: ${newBusinesses + currentCount}`)
    console.log(`- Missing: ${1122 - (newBusinesses + currentCount)}`)
    
    if (newBusinesses + currentCount === 1122) {
      console.log(`\n✅ PERFECT! All 1122 businesses are accounted for`)
    } else {
      console.log(`\n⚠️  Still missing ${1122 - (newBusinesses + currentCount)} businesses`)
    }
    
  } catch (error) {
    console.error('❌ Failed to debug duplicate detection:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

debugDuplicateDetection()
  .then(() => {
    console.log('\n✅ Debug complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
