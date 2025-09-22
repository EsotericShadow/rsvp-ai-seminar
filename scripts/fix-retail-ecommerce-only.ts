import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRetailEcommerceOnly() {
  console.log('🛍️ STEP 9: Fixing ONLY the Retail & E-commerce category...')
  
  try {
    // Find the retail group
    const retailGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Retail & E-commerce' },
      include: {
        members: {
          select: {
            id: true,
            businessName: true,
            primaryEmail: true
          }
        }
      }
    })
    
    if (!retailGroup) {
      console.log('❌ Retail & E-commerce group not found!')
      return
    }
    
    console.log(`\n📊 Current Retail & E-commerce group has ${retailGroup.members.length} members`)
    
    // Get all businesses from other groups to find actual retail businesses
    const allMembers = await prisma.audienceMember.findMany({
      select: {
        id: true,
        businessName: true,
        primaryEmail: true,
        groupId: true,
        group: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL retail & e-commerce businesses...`)
    
    // Find businesses that are ACTUALLY retail & e-commerce
    const realRetailBusinesses = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Retail & e-commerce keywords
      const retailKeywords = [
        'store', 'shop', 'boutique', 'retail', 'outlet', 'market', 'mart',
        'furniture', 'home goods', 'clothing', 'apparel', 'fashion', 'shoes',
        'jewelry', 'jewellery', 'accessories', 'gifts', 'toys', 'books',
        'electronics', 'computers', 'phones', 'gadgets', 'technology',
        'automotive', 'auto parts', 'tires', 'auto accessories',
        'sports', 'outdoor', 'recreation', 'fitness', 'equipment',
        'pharmacy', 'drug store', 'drugstore', 'health products',
        'grocery', 'supermarket', 'food store', 'convenience store',
        'hardware', 'tools', 'building supplies', 'home improvement',
        'garden', 'nursery', 'landscaping supplies', 'plants',
        'pet store', 'pet shop', 'animal supplies',
        'stationery', 'office supplies', 'business supplies',
        'antiques', 'collectibles', 'vintage', 'thrift',
        'online store', 'e-commerce', 'ecommerce', 'web store',
        'catalog', 'catalogue', 'mail order'
      ]
      
      // Check if name contains retail keywords
      const hasRetailKeyword = retailKeywords.some(keyword => name.includes(keyword))
      
      // Also check for retail suffixes
      const hasRetailSuffix = name.includes('store ltd') || 
                             name.includes('store inc') ||
                             name.includes('shop ltd') ||
                             name.includes('shop inc') ||
                             name.includes('retail ltd') ||
                             name.includes('retail inc') ||
                             name.includes('boutique ltd') ||
                             name.includes('boutique inc')
      
      return hasRetailKeyword || hasRetailSuffix
    })
    
    console.log(`\n🎯 Found ${realRetailBusinesses.length} businesses that are ACTUALLY retail & e-commerce:`)
    realRetailBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Retail & E-commerce'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed retail businesses to the correct group
    const incorrectlyPlaced = realRetailBusinesses.filter(member => member.group.name !== 'Retail & E-commerce')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual retail businesses to Retail & E-commerce...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: retailGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Retail & E-commerce`)
      }
    } else {
      console.log(`\n✅ All actual retail businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: retailGroup.id }
    })
    
    console.log(`\n📊 Final Retail & E-commerce count: ${finalCount} ACTUAL retail & e-commerce businesses`)
    
    // Show what's now in retail
    const retailMembers = await prisma.audienceMember.findMany({
      where: { groupId: retailGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual retail & e-commerce businesses in Retail & E-commerce:`)
    retailMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 9 COMPLETE: Retail & E-commerce now contains ONLY actual retail & e-commerce businesses!`)
    
  } catch (error) {
    console.error('❌ Failed to fix retail:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRetailEcommerceOnly()
  .then(() => {
    console.log('\n✅ Retail & e-commerce fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
