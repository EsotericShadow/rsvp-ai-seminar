import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createPersonalNamesGroup() {
  console.log('👤 Creating "Personal Names" audience group...')
  
  try {
    // Create the audience group for personal names
    const personalGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Personal Names',
        description: 'Businesses that appear to be personal names without clear business identifiers (e.g., "John Smith", "Sarah Johnson")',
        criteria: {
          type: 'personal_names',
          pattern: 'Names that look like personal names without Inc, LLC, Corp, Ltd, Company, Group, etc.',
          quality: 'medium',
          reasoning: 'These might be individual professionals, consultants, or sole proprietorships'
        },
        meta: {
          category: 'individual_professionals',
          createdBy: 'systematic_segmentation',
          priority: 'medium',
          notes: 'These could be lawyers, doctors, consultants, or other individual professionals'
        }
      }
    })
    
    console.log(`✅ Created audience group: ${personalGroup.name} (ID: ${personalGroup.id})`)
    
    // Create some example personal name businesses for demonstration
    const examplePersonalBusinesses = [
      {
        businessId: 'personal-001',
        businessName: 'Dr. Sarah Johnson',
        primaryEmail: 'dr.sarah@healthcare.com',
        contactPerson: 'Dr. Sarah Johnson',
        website: 'https://drjohnson.com',
        tags: ['healthcare', 'doctor', 'individual'],
        notes: 'Family physician - potential healthcare professional'
      },
      {
        businessId: 'personal-002', 
        businessName: 'Michael Rodriguez',
        primaryEmail: 'mike@rodriguezlaw.com',
        contactPerson: 'Michael Rodriguez',
        website: 'https://rodriguezlaw.com',
        tags: ['legal', 'lawyer', 'individual'],
        notes: 'Personal injury lawyer - potential legal professional'
      },
      {
        businessId: 'personal-003',
        businessName: 'Jennifer Chen',
        primaryEmail: 'jennifer@chenaccounting.com',
        contactPerson: 'Jennifer Chen',
        website: 'https://chenaccounting.com',
        tags: ['accounting', 'cpa', 'individual'],
        notes: 'CPA and tax consultant - potential accounting professional'
      },
      {
        businessId: 'personal-004',
        businessName: 'Robert Thompson',
        primaryEmail: 'robert@thompsonconsulting.com',
        contactPerson: 'Robert Thompson',
        website: 'https://thompsonconsulting.com',
        tags: ['consulting', 'business', 'individual'],
        notes: 'Business consultant - potential consulting professional'
      },
      {
        businessId: 'personal-005',
        businessName: 'Lisa Martinez',
        primaryEmail: 'lisa@martinezrealestate.com',
        contactPerson: 'Lisa Martinez',
        website: 'https://martinezrealestate.com',
        tags: ['real-estate', 'realtor', 'individual'],
        notes: 'Real estate agent - potential real estate professional'
      }
    ]
    
    console.log('\n📝 Adding example personal name businesses...')
    
    for (const business of examplePersonalBusinesses) {
      const member = await prisma.audienceMember.create({
        data: {
          groupId: personalGroup.id,
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
            category: 'personal_name',
            needsReview: true,
            quality: 'medium',
            notes: business.notes,
            profession: business.tags[1] || 'unknown'
          }
        }
      })
      
      console.log(`  ✅ Added: ${business.businessName} (${business.primaryEmail}) - ${business.notes}`)
    }
    
    // Show the group summary
    const groupWithMembers = await prisma.audienceGroup.findUnique({
      where: { id: personalGroup.id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 Group Summary:`)
    console.log(`- Group: ${personalGroup.name}`)
    console.log(`- Description: ${personalGroup.description}`)
    console.log(`- Members: ${groupWithMembers?._count.members}`)
    console.log(`- Quality: Medium (individual professionals)`)
    console.log(`- Purpose: Segment individual professionals and sole proprietorships`)
    
    // Show profession breakdown
    console.log('\n👥 Profession Breakdown:')
    const members = await prisma.audienceMember.findMany({
      where: { groupId: personalGroup.id },
      select: { meta: true, businessName: true }
    })
    
    const professionCounts: Record<string, number> = {}
    members.forEach(member => {
      const meta = member.meta as any
      const profession = meta?.profession || 'unknown'
      professionCounts[profession] = (professionCounts[profession] || 0) + 1
    })
    
    Object.entries(professionCounts).forEach(([profession, count]) => {
      console.log(`  - ${profession}: ${count}`)
    })
    
    console.log('\n📋 Next Steps:')
    console.log('1. Review the personal names in the admin panel')
    console.log('2. Verify they are indeed individual professionals')
    console.log('3. Consider sub-segmenting by profession (Healthcare, Legal, Accounting, etc.)')
    console.log('4. Move to next category: "Chains/Franchises"')
    
  } catch (error) {
    console.error('❌ Failed to create personal names group:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createPersonalNamesGroup()
  .then(() => {
    console.log('\n✅ Personal names group created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })

