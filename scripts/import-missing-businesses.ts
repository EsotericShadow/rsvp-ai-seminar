import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

config()
const prisma = new PrismaClient()

async function importMissingBusinesses() {
  console.log('📥 IMPORTING MISSING BUSINESSES')
  console.log('================================')
  
  try {
    // Get all businesses from database
    const dbBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessId: true,
        businessName: true
      }
    })
    
    console.log(`\n📊 DATABASE HAS: ${dbBusinesses.length} businesses`)
    
    // Get all businesses from LeadMine
    console.log(`\n📡 Fetching all businesses from LeadMine...`)
    
    let allLeadMineBusinesses = []
    let cursor: string | undefined
    let batchCount = 0
    
    while (true) {
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      allLeadMineBusinesses = allLeadMineBusinesses.concat(response.data)
      batchCount++
      console.log(`   - Batch ${batchCount}: ${response.data.length} businesses (total: ${allLeadMineBusinesses.length})`)
      
      cursor = response.pagination?.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end`)
        break
      }
    }
    
    console.log(`\n📊 LEADMINE HAS: ${allLeadMineBusinesses.length} businesses`)
    
    // Find missing businesses
    const dbBusinessIds = new Set(dbBusinesses.map(b => b.businessId))
    const missingBusinesses = allLeadMineBusinesses.filter(b => !dbBusinessIds.has(b.id))
    
    console.log(`\n❌ MISSING FROM DATABASE: ${missingBusinesses.length} businesses`)
    
    if (missingBusinesses.length > 0) {
      console.log(`\n📋 FIRST 10 MISSING BUSINESSES:`)
      missingBusinesses.slice(0, 10).forEach((business, index) => {
        console.log(`${index + 1}. ${business.name} (ID: ${business.id})`)
        console.log(`   Email: ${business.contact?.primaryEmail || 'No email'}`)
      })
      
      if (missingBusinesses.length > 10) {
        console.log(`\n   ... and ${missingBusinesses.length - 10} more`)
      }
      
      // Import missing businesses
      console.log(`\n📥 IMPORTING MISSING BUSINESSES...`)
      
      const groups = await prisma.audienceGroup.findMany()
      const groupMap = new Map(groups.map(g => [g.name, g.id]))
      
      // Create Miscellaneous group if it doesn't exist
      let miscGroupId = groupMap.get('Miscellaneous')
      if (!miscGroupId) {
        const miscGroup = await prisma.audienceGroup.create({
          data: {
            name: 'Miscellaneous',
            description: 'Businesses that need manual categorization',
            meta: {}
          }
        })
        miscGroupId = miscGroup.id
        groupMap.set('Miscellaneous', miscGroupId)
      }
      
      let imported = 0
      let skipped = 0
      
      for (const business of missingBusinesses) {
        // Only import businesses with email addresses
        if (business.contact?.primaryEmail) {
          try {
            await prisma.audienceMember.create({
              data: {
                businessId: business.id,
                businessName: business.name || 'Unknown Business',
                primaryEmail: business.contact.primaryEmail,
                groupId: miscGroupId, // Put in Miscellaneous for now
                unsubscribed: false,
                tagsSnapshot: business.contact?.tags || [],
                meta: {}
              }
            })
            imported++
            
            if (imported % 10 === 0) {
              console.log(`   ✅ Imported ${imported} businesses...`)
            }
          } catch (error) {
            console.log(`   ❌ Failed to import ${business.name}: ${error}`)
            skipped++
          }
        } else {
          console.log(`   ⏭️  Skipped ${business.name} (no email)`)
          skipped++
        }
      }
      
      console.log(`\n📊 IMPORT RESULTS:`)
      console.log(`- Imported: ${imported} businesses`)
      console.log(`- Skipped: ${skipped} businesses (no email)`)
      console.log(`- Total processed: ${imported + skipped} businesses`)
      
      // Show updated totals
      const updatedGroups = await prisma.audienceGroup.findMany({
        include: {
          _count: {
            select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 UPDATED TOTALS:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    const newTotal = updatedGroups.reduce((sum, group) => sum + group._count.members, 0)
    console.log(`\n📈 NEW TOTAL: ${newTotal} businesses`)
    console.log(`\n🔍 EXPECTED: 1122 businesses`)
    console.log(`\n❓ STILL MISSING: ${1122 - newTotal} businesses`)
    
    } else {
      console.log(`\n✅ No missing businesses found!`)
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importMissingBusinesses()
  .then(() => {
    console.log('\n✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })



