import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importRealBusinesses() {
  console.log('📊 Importing real businesses from LeadMine...')
  
  try {
    // First, let's check what we currently have
    const currentCounts = await Promise.all([
      prisma.audienceGroup.count(),
      prisma.audienceMember.count()
    ])
    
    console.log(`Current state: ${currentCounts[0]} groups, ${currentCounts[1]} members`)
    
    // Check if LeadMine API is configured
    const leadMineBaseUrl = process.env.LEADMINE_API_BASE
    const leadMineApiKey = process.env.LEADMINE_API_KEY
    
    console.log('\n🔧 LeadMine Configuration Check:')
    console.log(`- API Base: ${leadMineBaseUrl ? 'Configured' : 'NOT CONFIGURED'}`)
    console.log(`- API Key: ${leadMineApiKey ? 'Configured' : 'NOT CONFIGURED'}`)
    
    if (!leadMineBaseUrl || !leadMineApiKey) {
      console.log('\n❌ LeadMine API not configured!')
      console.log('To import the 1122 businesses, we need:')
      console.log('1. LEADMINE_API_BASE environment variable')
      console.log('2. LEADMINE_API_KEY environment variable')
      console.log('\n📋 Options:')
      console.log('A. Configure LeadMine API and run this script again')
      console.log('B. Export businesses from LeadMine manually and import via CSV')
      console.log('C. Use the admin panel to add businesses manually')
      
      // Let's see if there's any way to get the data
      console.log('\n🔍 Checking for alternative data sources...')
      
      // Check if there are any existing businesses in the database that might have been imported before
      const existingBusinesses = await prisma.audienceMember.findMany({
        select: {
          businessId: true,
          businessName: true,
          primaryEmail: true,
          groupId: true
        },
        take: 10
      })
      
      if (existingBusinesses.length > 0) {
        console.log('\n📋 Found existing businesses in database:')
        existingBusinesses.forEach((business, index) => {
          console.log(`${index + 1}. ${business.businessName} (${business.primaryEmail})`)
        })
        console.log(`... and ${await prisma.audienceMember.count() - 10} more`)
      } else {
        console.log('\n📭 No existing businesses found in database')
      }
      
      console.log('\n💡 Next Steps:')
      console.log('1. Check your LeadMine API credentials')
      console.log('2. Or provide a CSV export of your 1122 businesses')
      console.log('3. Or use the admin panel to manually add businesses')
      
      return
    }
    
    // If LeadMine is configured, try to import
    console.log('\n🚀 LeadMine API configured - attempting to import businesses...')
    
    // Import the LeadMine integration
    const { fetchLeadMineBusinesses } = await import('@/lib/leadMine')
    
    let totalImported = 0
    let cursor: string | undefined = undefined
    let page = 1
    
    console.log('\n📥 Starting business import...')
    
    while (true) {
      console.log(`\n📄 Fetching page ${page}...`)
      
      try {
        const response = await fetchLeadMineBusinesses({
          limit: 100,
          cursor: cursor,
          hasEmail: true,
          createMissing: true
        })
        
        if (response.data.length === 0) {
          console.log('✅ No more businesses to import')
          break
        }
        
        console.log(`📊 Found ${response.data.length} businesses on page ${page}`)
        
        // Process each business
        for (const business of response.data) {
          if (!business.contact.primaryEmail) {
            console.log(`⚠️  Skipping ${business.name} - no email`)
            continue
          }
          
          // Determine which group this business belongs to
          const groupId = await determineBusinessGroup(business)
          
          // Create the audience member
          await prisma.audienceMember.create({
            data: {
              groupId: groupId,
              businessId: business.id,
              businessName: business.name || 'Unknown Business',
              primaryEmail: business.contact.primaryEmail,
              secondaryEmail: business.contact.alternateEmail,
              tagsSnapshot: business.contact.tags || [],
              inviteToken: business.invite?.token || `token_${business.id}_${Date.now()}`,
              unsubscribed: false,
              meta: {
                contactPerson: business.contact.contactPerson,
                website: business.website,
                address: business.address,
                source: 'leadmine_import',
                leadmineId: business.id,
                tags: business.contact.tags,
                leadStatus: business.lead?.status,
                leadPriority: business.lead?.priority,
                lastEmailSent: business.invite?.lastEmailSent,
                emailsSent: business.invite?.emailsSent || 0,
                visitsCount: business.invite?.visitsCount || 0,
                rsvpsCount: business.invite?.rsvpsCount || 0
              }
            }
          })
          
          totalImported++
          
          if (totalImported % 50 === 0) {
            console.log(`  ✅ Imported ${totalImported} businesses...`)
          }
        }
        
        // Check if there are more pages
        cursor = response.pagination.nextCursor || undefined
        if (!cursor) {
          console.log('✅ Reached end of businesses')
          break
        }
        
        page++
        
        // Safety check to prevent infinite loops
        if (page > 50) {
          console.log('⚠️  Stopping after 50 pages to prevent infinite loop')
          break
        }
        
      } catch (error) {
        console.error(`❌ Error importing page ${page}:`, error)
        break
      }
    }
    
    console.log(`\n🎉 Import complete!`)
    console.log(`📊 Total businesses imported: ${totalImported}`)
    
    // Show final counts
    const finalCounts = await Promise.all([
      prisma.audienceGroup.count(),
      prisma.audienceMember.count()
    ])
    
    console.log(`\n📈 Final counts:`)
    console.log(`- Groups: ${finalCounts[0]}`)
    console.log(`- Members: ${finalCounts[1]}`)
    
    // Show breakdown by group
    const groupBreakdown = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n📊 Members by group:`)
    groupBreakdown.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} members`)
    })
    
  } catch (error) {
    console.error('❌ Failed to import businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function determineBusinessGroup(business: any): Promise<string> {
  const name = business.name || ''
  
  // Find existing groups
  const groups = await prisma.audienceGroup.findMany()
  
  // Check for numbered businesses
  if (/^\w+\s*[#\d]+\s*$|^\w+\s+\d+$/.test(name.trim())) {
    const numberedGroup = groups.find(g => g.name === 'Numbered Businesses')
    if (numberedGroup) return numberedGroup.id
  }
  
  // Check for personal names
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim()) && 
      !name.toLowerCase().includes('inc') && 
      !name.toLowerCase().includes('llc') && 
      !name.toLowerCase().includes('corp') &&
      !name.toLowerCase().includes('ltd') &&
      !name.toLowerCase().includes('group') &&
      !name.toLowerCase().includes('company')) {
    const personalGroup = groups.find(g => g.name === 'Personal Names')
    if (personalGroup) return personalGroup.id
  }
  
  // Check for chains/franchises
  const chainKeywords = ['mcdonald', 'starbucks', 'subway', 'pizza hut', 'dominos', 'kfc', 'burger king', 'wendys', 'tim hortons', 'dunkin', 'walgreens', 'cvs', 'walmart', 'target', 'home depot', 'lowes']
  if (chainKeywords.some(keyword => name.toLowerCase().includes(keyword))) {
    const chainsGroup = groups.find(g => g.name === 'Chains & Franchises')
    if (chainsGroup) return chainsGroup.id
  }
  
  // For identifiable businesses, try to determine industry
  const tags = business.contact.tags || []
  const nameLower = name.toLowerCase()
  
  // Healthcare
  if (tags.some((tag: string) => tag.toLowerCase().includes('health')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('medical')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('dental')) ||
      nameLower.includes('medical') || nameLower.includes('dental') || nameLower.includes('clinic')) {
    const healthcareGroup = groups.find(g => g.name === 'Healthcare & Wellness')
    if (healthcareGroup) return healthcareGroup.id
  }
  
  // Professional services
  if (tags.some((tag: string) => tag.toLowerCase().includes('legal')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('law')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('accounting')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('consulting')) ||
      nameLower.includes('law') || nameLower.includes('legal') || nameLower.includes('accounting')) {
    const profGroup = groups.find(g => g.name === 'Professional Services')
    if (profGroup) return profGroup.id
  }
  
  // Retail
  if (tags.some((tag: string) => tag.toLowerCase().includes('retail')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('shop')) ||
      nameLower.includes('store') || nameLower.includes('shop') || nameLower.includes('boutique')) {
    const retailGroup = groups.find(g => g.name === 'Retail & E-commerce')
    if (retailGroup) return retailGroup.id
  }
  
  // Food service
  if (tags.some((tag: string) => tag.toLowerCase().includes('restaurant')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('food')) ||
      nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('bistro')) {
    const foodGroup = groups.find(g => g.name === 'Restaurants & Food Service')
    if (foodGroup) return foodGroup.id
  }
  
  // Construction
  if (tags.some((tag: string) => tag.toLowerCase().includes('construction')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('contractor')) ||
      nameLower.includes('construction') || nameLower.includes('contractor') || nameLower.includes('plumbing')) {
    const constructionGroup = groups.find(g => g.name === 'Home & Construction Services')
    if (constructionGroup) return constructionGroup.id
  }
  
  // Personal care
  if (tags.some((tag: string) => tag.toLowerCase().includes('salon')) ||
      tags.some((tag: string) => tag.toLowerCase().includes('spa')) ||
      nameLower.includes('salon') || nameLower.includes('spa') || nameLower.includes('beauty')) {
    const personalGroup = groups.find(g => g.name === 'Personal Care & Beauty')
    if (personalGroup) return personalGroup.id
  }
  
  // Default to the first identifiable group (Healthcare & Wellness)
  const defaultGroup = groups.find(g => g.name === 'Healthcare & Wellness')
  if (defaultGroup) return defaultGroup.id
  
  // Fallback to first group
  return groups[0]?.id || ''
}

importRealBusinesses()
  .then(() => {
    console.log('\n✅ Business import process complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })

