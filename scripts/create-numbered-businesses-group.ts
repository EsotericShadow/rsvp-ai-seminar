import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createNumberedBusinessesGroup() {
  console.log('🔢 Creating "Numbered Businesses" audience group...')
  
  try {
    // Create the audience group for numbered businesses
    const numberedGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Numbered Businesses',
        description: 'Businesses with numbered names (e.g., "Business 123", "Company #456") - typically low-quality leads',
        criteria: {
          type: 'numbered_businesses',
          pattern: 'Business names that are just numbers or contain numbers without clear business identifiers',
          quality: 'low',
          reasoning: 'These are typically low-quality leads that may be test entries or incomplete data'
        },
        meta: {
          category: 'low_quality',
          createdBy: 'systematic_segmentation',
          priority: 'low',
          notes: 'Review these businesses manually - many may need to be removed or updated'
        }
      }
    })
    
    console.log(`✅ Created audience group: ${numberedGroup.name} (ID: ${numberedGroup.id})`)
    
    // Create some example numbered businesses for demonstration
    const exampleNumberedBusinesses = [
      {
        businessId: 'numbered-001',
        businessName: 'Business 123',
        primaryEmail: 'contact@business123.com',
        contactPerson: 'John Smith',
        website: 'https://business123.com',
        tags: ['numbered', 'low-quality', 'needs-review']
      },
      {
        businessId: 'numbered-002', 
        businessName: 'Company #456',
        primaryEmail: 'info@company456.com',
        contactPerson: 'Jane Doe',
        website: 'https://company456.com',
        tags: ['numbered', 'low-quality', 'needs-review']
      },
      {
        businessId: 'numbered-003',
        businessName: 'Enterprise 789',
        primaryEmail: 'admin@enterprise789.com',
        contactPerson: 'Bob Johnson',
        website: 'https://enterprise789.com',
        tags: ['numbered', 'low-quality', 'needs-review']
      }
    ]
    
    console.log('\n📝 Adding example numbered businesses...')
    
    for (const business of exampleNumberedBusinesses) {
      const member = await prisma.audienceMember.create({
        data: {
          groupId: numberedGroup.id,
          businessId: business.businessId,
          businessName: business.businessName,
          primaryEmail: business.primaryEmail,
          secondaryEmail: null,
          tagsSnapshot: business.tags,
          inviteToken: `token_${business.businessId}_${Date.now()}`,
          unsubscribed: false,
          meta: {
            contactPerson: business.contactPerson,
            website: business.website,
            source: 'manual_entry',
            category: 'numbered_business',
            needsReview: true,
            quality: 'low'
          }
        }
      })
      
      console.log(`  ✅ Added: ${business.businessName} (${business.primaryEmail})`)
    }
    
    // Show the group summary
    const groupWithMembers = await prisma.audienceGroup.findUnique({
      where: { id: numberedGroup.id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 Group Summary:`)
    console.log(`- Group: ${numberedGroup.name}`)
    console.log(`- Description: ${numberedGroup.description}`)
    console.log(`- Members: ${groupWithMembers?._count.members}`)
    console.log(`- Quality: Low (needs manual review)`)
    console.log(`- Purpose: Isolate low-quality numbered business entries`)
    
    console.log('\n📋 Next Steps:')
    console.log('1. Review the numbered businesses in the admin panel')
    console.log('2. Manually verify which ones are real businesses')
    console.log('3. Remove or update low-quality entries')
    console.log('4. Move to next category: "Personal Names"')
    
  } catch (error) {
    console.error('❌ Failed to create numbered businesses group:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createNumberedBusinessesGroup()
  .then(() => {
    console.log('\n✅ Numbered businesses group created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
