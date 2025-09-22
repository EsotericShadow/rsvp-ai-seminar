import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createChainsFranchisesGroup() {
  console.log('🏢 Creating "Chains/Franchises" audience group...')
  
  try {
    // Create the audience group for chains and franchises
    const chainsGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Chains & Franchises',
        description: 'Large chains, franchises, and corporations that are typically not good targets for small business services',
        criteria: {
          type: 'chains_franchises',
          pattern: 'Large corporations, franchises, chains, and big box stores',
          quality: 'avoid',
          reasoning: 'These are typically not good targets for small business AI services - they have their own resources'
        },
        meta: {
          category: 'avoid',
          createdBy: 'systematic_segmentation',
          priority: 'low',
          notes: 'Mark as low priority - avoid emailing these businesses',
          exclude_from_campaigns: true
        }
      }
    })
    
    console.log(`✅ Created audience group: ${chainsGroup.name} (ID: ${chainsGroup.id})`)
    
    // Create some example chain/franchise businesses
    const exampleChainsBusinesses = [
      {
        businessId: 'chain-001',
        businessName: 'McDonald\'s Restaurant',
        primaryEmail: 'franchise@mcdonalds.com',
        contactPerson: 'Franchise Manager',
        website: 'https://mcdonalds.com',
        tags: ['fast-food', 'franchise', 'large-corporation'],
        notes: 'Fast food franchise - avoid targeting'
      },
      {
        businessId: 'chain-002', 
        businessName: 'Starbucks Coffee',
        primaryEmail: 'info@starbucks.com',
        contactPerson: 'Store Manager',
        website: 'https://starbucks.com',
        tags: ['coffee', 'franchise', 'large-corporation'],
        notes: 'Coffee chain franchise - avoid targeting'
      },
      {
        businessId: 'chain-003',
        businessName: 'Walmart Supercenter',
        primaryEmail: 'corporate@walmart.com',
        contactPerson: 'Corporate Office',
        website: 'https://walmart.com',
        tags: ['retail', 'big-box', 'large-corporation'],
        notes: 'Big box retailer - avoid targeting'
      },
      {
        businessId: 'chain-004',
        businessName: 'Home Depot',
        primaryEmail: 'business@homedepot.com',
        contactPerson: 'Business Services',
        website: 'https://homedepot.com',
        tags: ['home-improvement', 'big-box', 'large-corporation'],
        notes: 'Home improvement chain - avoid targeting'
      },
      {
        businessId: 'chain-005',
        businessName: 'Subway Sandwiches',
        primaryEmail: 'franchise@subway.com',
        contactPerson: 'Franchise Owner',
        website: 'https://subway.com',
        tags: ['fast-food', 'franchise', 'large-corporation'],
        notes: 'Sandwich franchise - avoid targeting'
      },
      {
        businessId: 'chain-006',
        businessName: 'Tim Hortons',
        primaryEmail: 'info@timhortons.com',
        contactPerson: 'Franchise Manager',
        website: 'https://timhortons.com',
        tags: ['coffee', 'franchise', 'large-corporation'],
        notes: 'Coffee/donut franchise - avoid targeting'
      },
      {
        businessId: 'chain-007',
        businessName: 'CVS Pharmacy',
        primaryEmail: 'corporate@cvs.com',
        contactPerson: 'Corporate Office',
        website: 'https://cvs.com',
        tags: ['pharmacy', 'chain', 'large-corporation'],
        notes: 'Pharmacy chain - avoid targeting'
      },
      {
        businessId: 'chain-008',
        businessName: 'Target Corporation',
        primaryEmail: 'business@target.com',
        contactPerson: 'Business Services',
        website: 'https://target.com',
        tags: ['retail', 'big-box', 'large-corporation'],
        notes: 'Big box retailer - avoid targeting'
      }
    ]
    
    console.log('\n📝 Adding example chain/franchise businesses...')
    
    for (const business of exampleChainsBusinesses) {
      const member = await prisma.audienceMember.create({
        data: {
          groupId: chainsGroup.id,
          businessId: business.businessId,
          businessName: business.businessName,
          primaryEmail: business.primaryEmail,
          secondaryEmail: null,
          tagsSnapshot: business.tags,
          inviteToken: `token_${business.businessId}_${Date.now()}`,
          unsubscribed: true, // Mark as unsubscribed since we want to avoid them
          meta: {
            contactPerson: business.contactPerson,
            website: business.website,
            source: 'manual_entry',
            category: 'chain_franchise',
            needsReview: false,
            quality: 'avoid',
            notes: business.notes,
            chain_type: business.tags[1] || 'unknown',
            exclude_from_campaigns: true,
            reason_excluded: 'Large corporation/franchise - not ideal target for small business AI services'
          }
        }
      })
      
      console.log(`  ✅ Added: ${business.businessName} (${business.primaryEmail}) - ${business.notes}`)
    }
    
    // Show the group summary
    const groupWithMembers = await prisma.audienceGroup.findUnique({
      where: { id: chainsGroup.id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 Group Summary:`)
    console.log(`- Group: ${chainsGroup.name}`)
    console.log(`- Description: ${chainsGroup.description}`)
    console.log(`- Members: ${groupWithMembers?._count.members}`)
    console.log(`- Quality: Avoid (large corporations)`)
    console.log(`- Purpose: Identify and exclude large chains/franchises from campaigns`)
    console.log(`- Status: All members marked as unsubscribed to avoid targeting`)
    
    // Show chain type breakdown
    console.log('\n🏢 Chain Type Breakdown:')
    const members = await prisma.audienceMember.findMany({
      where: { groupId: chainsGroup.id },
      select: { meta: true, businessName: true }
    })
    
    const chainTypeCounts: Record<string, number> = {}
    members.forEach(member => {
      const meta = member.meta as any
      const chainType = meta?.chain_type || 'unknown'
      chainTypeCounts[chainType] = (chainTypeCounts[chainType] || 0) + 1
    })
    
    Object.entries(chainTypeCounts).forEach(([chainType, count]) => {
      console.log(`  - ${chainType}: ${count}`)
    })
    
    console.log('\n📋 Next Steps:')
    console.log('1. Review the chains/franchises in the admin panel')
    console.log('2. Confirm they should be excluded from campaigns')
    console.log('3. These are marked as unsubscribed to avoid accidental targeting')
    console.log('4. Move to final category: "Identifiable Small Businesses"')
    
    console.log('\n⚠️  Important Notes:')
    console.log('- All members in this group are marked as unsubscribed')
    console.log('- This prevents them from receiving campaign emails')
    console.log('- These businesses typically have their own IT/AI resources')
    console.log('- Focus your campaigns on smaller, independent businesses')
    
  } catch (error) {
    console.error('❌ Failed to create chains/franchises group:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createChainsFranchisesGroup()
  .then(() => {
    console.log('\n✅ Chains & franchises group created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
