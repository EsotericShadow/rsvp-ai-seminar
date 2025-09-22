import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createIdentifiableBusinessesGroups() {
  console.log('✅ Creating "Identifiable Small Businesses" audience groups by industry...')
  
  try {
    // Define industry categories for small businesses
    const industryGroups = [
      {
        name: 'Healthcare & Wellness',
        description: 'Small healthcare practices, clinics, wellness centers, and medical professionals',
        industry: 'healthcare',
        criteria: {
          type: 'healthcare_small_business',
          includes: ['medical practices', 'dental offices', 'chiropractic', 'physical therapy', 'mental health', 'wellness centers'],
          excludes: ['hospitals', 'large medical systems'],
          quality: 'high',
          reasoning: 'Healthcare practices often need help with patient management, scheduling, and administrative tasks'
        },
        meta: {
          category: 'healthcare',
          createdBy: 'systematic_segmentation',
          priority: 'high',
          notes: 'High-value targets - healthcare practices often need administrative help',
          campaign_focus: 'patient management, scheduling, administrative efficiency'
        }
      },
      {
        name: 'Professional Services',
        description: 'Law firms, accounting firms, consulting practices, and other professional service providers',
        industry: 'professional_services',
        criteria: {
          type: 'professional_services',
          includes: ['law firms', 'accounting firms', 'consulting', 'marketing agencies', 'real estate agencies'],
          excludes: ['large consulting firms', 'big law firms'],
          quality: 'high',
          reasoning: 'Professional services often need help with client management, billing, and workflow optimization'
        },
        meta: {
          category: 'professional_services',
          createdBy: 'systematic_segmentation',
          priority: 'high',
          notes: 'High-value targets - professional services need client management and workflow tools',
          campaign_focus: 'client management, billing, workflow optimization'
        }
      },
      {
        name: 'Retail & E-commerce',
        description: 'Small retail stores, online shops, and e-commerce businesses',
        industry: 'retail',
        criteria: {
          type: 'retail_small_business',
          includes: ['retail stores', 'online shops', 'boutiques', 'specialty stores'],
          excludes: ['large retail chains', 'big box stores'],
          quality: 'medium',
          reasoning: 'Retail businesses often need help with inventory, customer management, and online presence'
        },
        meta: {
          category: 'retail',
          createdBy: 'systematic_segmentation',
          priority: 'medium',
          notes: 'Medium-value targets - retail businesses need inventory and customer management',
          campaign_focus: 'inventory management, customer service, online presence'
        }
      },
      {
        name: 'Restaurants & Food Service',
        description: 'Local restaurants, cafes, catering services, and food service businesses',
        industry: 'food_service',
        criteria: {
          type: 'food_service_small_business',
          includes: ['restaurants', 'cafes', 'catering', 'food trucks', 'bakeries'],
          excludes: ['fast food chains', 'large restaurant groups'],
          quality: 'medium',
          reasoning: 'Food service businesses often need help with reservations, inventory, and customer management'
        },
        meta: {
          category: 'food_service',
          createdBy: 'systematic_segmentation',
          priority: 'medium',
          notes: 'Medium-value targets - food service needs reservation and inventory management',
          campaign_focus: 'reservations, inventory, customer loyalty'
        }
      },
      {
        name: 'Home & Construction Services',
        description: 'Contractors, home improvement, landscaping, and construction services',
        industry: 'construction',
        criteria: {
          type: 'construction_services',
          includes: ['contractors', 'plumbers', 'electricians', 'landscaping', 'roofing', 'painting'],
          excludes: ['large construction companies'],
          quality: 'medium',
          reasoning: 'Construction services often need help with scheduling, estimates, and client communication'
        },
        meta: {
          category: 'construction',
          createdBy: 'systematic_segmentation',
          priority: 'medium',
          notes: 'Medium-value targets - construction services need scheduling and client management',
          campaign_focus: 'scheduling, estimates, client communication'
        }
      },
      {
        name: 'Personal Care & Beauty',
        description: 'Salons, spas, barbershops, and personal care service providers',
        industry: 'personal_care',
        criteria: {
          type: 'personal_care_services',
          includes: ['salons', 'spas', 'barbershops', 'nail salons', 'massage therapy'],
          excludes: ['large spa chains'],
          quality: 'medium',
          reasoning: 'Personal care businesses often need help with appointments, customer management, and marketing'
        },
        meta: {
          category: 'personal_care',
          createdBy: 'systematic_segmentation',
          priority: 'medium',
          notes: 'Medium-value targets - personal care needs appointment and customer management',
          campaign_focus: 'appointments, customer loyalty, marketing'
        }
      }
    ]
    
    const createdGroups = []
    
    // Create each industry group
    for (const groupData of industryGroups) {
      console.log(`\n📝 Creating ${groupData.name} group...`)
      
      const group = await prisma.audienceGroup.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          criteria: groupData.criteria,
          meta: groupData.meta
        }
      })
      
      createdGroups.push(group)
      console.log(`  ✅ Created: ${group.name} (ID: ${group.id})`)
    }
    
    // Add example businesses to each group
    const exampleBusinesses = {
      healthcare: [
        {
          businessId: 'healthcare-001',
          businessName: 'Sunrise Family Practice',
          primaryEmail: 'info@sunrisepractice.com',
          contactPerson: 'Dr. Emily Chen',
          website: 'https://sunrisepractice.com',
          tags: ['family-practice', 'healthcare', 'medical'],
          notes: 'Small family medical practice'
        },
        {
          businessId: 'healthcare-002',
          businessName: 'Downtown Dental Care',
          primaryEmail: 'appointments@downtowndental.com',
          contactPerson: 'Dr. James Wilson',
          website: 'https://downtowndental.com',
          tags: ['dental', 'healthcare', 'medical'],
          notes: 'Local dental practice'
        }
      ],
      professional_services: [
        {
          businessId: 'prof-001',
          businessName: 'Wilson & Associates Law Firm',
          primaryEmail: 'contact@wilsonlaw.com',
          contactPerson: 'Attorney Sarah Wilson',
          website: 'https://wilsonlaw.com',
          tags: ['law-firm', 'legal', 'professional-services'],
          notes: 'Small law firm specializing in business law'
        },
        {
          businessId: 'prof-002',
          businessName: 'Creative Marketing Solutions',
          primaryEmail: 'hello@creativemarketing.com',
          contactPerson: 'Mike Rodriguez',
          website: 'https://creativemarketing.com',
          tags: ['marketing', 'advertising', 'professional-services'],
          notes: 'Local marketing agency'
        }
      ],
      retail: [
        {
          businessId: 'retail-001',
          businessName: 'Boutique Fashion Store',
          primaryEmail: 'info@boutiquefashion.com',
          contactPerson: 'Lisa Martinez',
          website: 'https://boutiquefashion.com',
          tags: ['retail', 'fashion', 'boutique'],
          notes: 'Local fashion boutique'
        }
      ],
      food_service: [
        {
          businessId: 'food-001',
          businessName: 'Mama Rosa\'s Italian Restaurant',
          primaryEmail: 'reservations@mamarosas.com',
          contactPerson: 'Rosa Martinez',
          website: 'https://mamarosas.com',
          tags: ['restaurant', 'italian', 'food-service'],
          notes: 'Family-owned Italian restaurant'
        }
      ],
      construction: [
        {
          businessId: 'construction-001',
          businessName: 'Elite Home Improvements',
          primaryEmail: 'info@elitehomeimprovements.com',
          contactPerson: 'Tom Johnson',
          website: 'https://elitehomeimprovements.com',
          tags: ['contractor', 'home-improvement', 'construction'],
          notes: 'Local home improvement contractor'
        }
      ],
      personal_care: [
        {
          businessId: 'personal-001',
          businessName: 'Serenity Spa & Wellness',
          primaryEmail: 'bookings@serenityspa.com',
          contactPerson: 'Jennifer Lee',
          website: 'https://serenityspa.com',
          tags: ['spa', 'wellness', 'personal-care'],
          notes: 'Local spa and wellness center'
        }
      ]
    }
    
    // Add example businesses to each group
    for (let i = 0; i < createdGroups.length; i++) {
      const group = createdGroups[i]
      const industryKey = Object.keys(exampleBusinesses)[i] as keyof typeof exampleBusinesses
      const businesses = exampleBusinesses[industryKey] || []
      
      console.log(`\n📝 Adding example businesses to ${group.name}...`)
      
      for (const business of businesses) {
        const member = await prisma.audienceMember.create({
          data: {
            groupId: group.id,
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
              category: industryKey,
              needsReview: false,
              quality: 'high',
              notes: business.notes,
              industry: industryKey,
              campaign_priority: 'high'
            }
          }
        })
        
        console.log(`  ✅ Added: ${business.businessName} (${business.primaryEmail})`)
      }
    }
    
    // Show summary of all groups
    console.log('\n📊 All Identifiable Business Groups Summary:')
    
    for (const group of createdGroups) {
      const groupWithMembers = await prisma.audienceGroup.findUnique({
        where: { id: group.id },
        include: {
          _count: {
            select: { members: true }
          }
        }
      })
      
      console.log(`\n- ${group.name}: ${groupWithMembers?._count.members} members`)
      console.log(`  Description: ${group.description}`)
      console.log(`  Priority: ${(group.meta as any)?.priority}`)
    }
    
    // Overall summary
    const totalMembers = await prisma.audienceMember.count({
      where: {
        group: {
          name: {
            not: 'Chains & Franchises'
          }
        }
      }
    })
    
    console.log(`\n🎯 Overall Summary:`)
    console.log(`- Total identifiable business groups: ${createdGroups.length}`)
    console.log(`- Total active members: ${totalMembers}`)
    console.log(`- All groups ready for targeted campaigns`)
    console.log(`- Each group has industry-specific messaging potential`)
    
    console.log('\n📋 Next Steps:')
    console.log('1. Review all groups in the admin panel')
    console.log('2. Create industry-specific email templates')
    console.log('3. Set up targeted campaigns for each industry')
    console.log('4. Start with highest priority groups (Healthcare, Professional Services)')
    
  } catch (error) {
    console.error('❌ Failed to create identifiable businesses groups:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createIdentifiableBusinessesGroups()
  .then(() => {
    console.log('\n✅ All identifiable business groups created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
