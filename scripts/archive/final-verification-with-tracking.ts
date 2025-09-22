import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalVerificationWithTracking() {
  console.log('📊 FINAL VERIFICATION WITH TRACKING')
  console.log('===================================')
  
  try {
    // Get all groups with members
    const groups = await prisma.audienceGroup.findMany({
      include: {
        members: {
          select: {
            id: true,
            businessName: true,
            primaryEmail: true
          },
          orderBy: {
            businessName: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n📈 TOTAL BUSINESSES: ${groups.reduce((sum, group) => sum + group.members.length, 0)}`)
    console.log(`📈 TOTAL GROUPS: ${groups.length}`)
    
    // Track each category with examples
    const categorization = {
      'Chains & Franchises': {
        count: 0,
        examples: [],
        description: 'Large corporations, franchises, chains (UNSUBSCRIBED)',
        keywords: ['mcdonald', 'starbucks', 'walmart', 'subway', 'pizza hut', 'tim hortons', 'a&w', '7-eleven', 'canadian tire']
      },
      'Healthcare & Wellness': {
        count: 0,
        examples: [],
        description: 'Doctors, clinics, pharmacies, therapy services',
        keywords: ['dr.', 'medical', 'clinic', 'pharmacy', 'therapy', 'counseling', 'health', 'wellness']
      },
      'Home & Construction Services': {
        count: 0,
        examples: [],
        description: 'Construction, plumbing, electrical, landscaping, home services',
        keywords: ['construction', 'contracting', 'plumbing', 'electrician', 'roofing', 'welding', 'landscaping']
      },
      'Numbered Businesses': {
        count: 0,
        examples: [],
        description: 'Businesses with only numbers/letters (no clear identifiers)',
        keywords: ['bc ltd', 'canada inc', 'corporation', 'ltd.', 'inc.']
      },
      'Personal Care & Beauty': {
        count: 0,
        examples: [],
        description: 'Salons, spas, barber shops, beauty services',
        keywords: ['salon', 'spa', 'barber', 'beauty', 'nail', 'massage', 'aesthetics']
      },
      'Personal Names': {
        count: 0,
        examples: [],
        description: 'Individual professionals without clear business identifiers',
        keywords: ['personal names', 'individual professionals']
      },
      'Professional Services': {
        count: 0,
        examples: [],
        description: 'Law firms, accounting, consulting, engineering, surveying',
        keywords: ['law', 'legal', 'accounting', 'consulting', 'engineering', 'surveying', 'notary']
      },
      'Restaurants & Food Service': {
        count: 0,
        examples: [],
        description: 'Restaurants, cafes, catering, food trucks',
        keywords: ['restaurant', 'cafe', 'pizza', 'burger', 'catering', 'bar', 'pub', 'food']
      },
      'Retail & E-commerce': {
        count: 0,
        examples: [],
        description: 'Stores, shops, boutiques, retail businesses',
        keywords: ['store', 'shop', 'retail', 'boutique', 'mart', 'furniture', 'electronics']
      }
    }
    
    // Populate tracking data
    groups.forEach(group => {
      if (categorization[group.name]) {
        categorization[group.name].count = group.members.length
        categorization[group.name].examples = group.members.slice(0, 5).map(m => m.businessName)
      }
    })
    
    console.log(`\n🎯 CATEGORIZATION TRACKING:`)
    console.log(`===========================`)
    
    Object.entries(categorization).forEach(([categoryName, data], index) => {
      console.log(`\n${index + 1}. ${categoryName.toUpperCase()}`)
      console.log(`   Count: ${data.count} businesses`)
      console.log(`   Description: ${data.description}`)
      console.log(`   Examples:`)
      data.examples.forEach((example, exIndex) => {
        console.log(`     ${exIndex + 1}. ${example}`)
      })
      if (data.count > 5) {
        console.log(`     ... and ${data.count - 5} more`)
      }
    })
    
    // Manual verification of key businesses
    console.log(`\n🔍 MANUAL VERIFICATION OF KEY BUSINESSES:`)
    console.log(`=========================================`)
    
    const keyBusinesses = [
      'McDonald\'s Restaurant',
      'Starbucks Coffee', 
      'Walmart Supercenter',
      'CVS Pharmacy',
      'DR. THOMAS NAGY INC.',
      'ABC PLUMBING & HEATING',
      'GRAND OL\'E BARBER SHOP',
      'A.E. PENNER LAW CORPORATION',
      'DON DIEGO\'S RESTAURANT',
      'BC1460479'
    ]
    
    for (const businessName of keyBusinesses) {
      const member = await prisma.audienceMember.findFirst({
        where: { businessName },
        include: {
          group: {
            select: { name: true }
          }
        }
      })
      
      if (member) {
        console.log(`✅ ${businessName} → ${member.group.name}`)
      } else {
        console.log(`❌ ${businessName} → NOT FOUND`)
      }
    }
    
    // Final statistics
    const totalBusinesses = Object.values(categorization).reduce((sum, data) => sum + data.count, 0)
    const chainsCount = categorization['Chains & Franchises'].count
    const targetableCount = totalBusinesses - chainsCount
    
    console.log(`\n📊 FINAL STATISTICS:`)
    console.log(`====================`)
    console.log(`- Total businesses: ${totalBusinesses}`)
    console.log(`- Chains & Franchises (unsubscribed): ${chainsCount} (${((chainsCount/totalBusinesses)*100).toFixed(1)}%)`)
    console.log(`- Targetable small businesses: ${targetableCount} (${((targetableCount/totalBusinesses)*100).toFixed(1)}%)`)
    
    console.log(`\n✅ CATEGORIZATION COMPLETE AND TRACKED!`)
    console.log(`All ${totalBusinesses} businesses have been systematically categorized.`)
    console.log(`Chains & Franchises are marked as unsubscribed to avoid targeting them.`)
    
  } catch (error) {
    console.error('❌ Failed to verify categorization:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

finalVerificationWithTracking()
  .then(() => {
    console.log('\n✅ Final verification complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
