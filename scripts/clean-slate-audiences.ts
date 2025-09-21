#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSlateAudiences() {
  console.log('🧹 Clean Slate - Starting with Industry-Based Audiences...\n');

  // 1. Delete ALL campaigns and related data
  console.log('🗑️  Deleting all campaigns...');
  await prisma.campaignSend.deleteMany({});
  await prisma.campaignSchedule.deleteMany({});
  await prisma.campaignSettings.deleteMany({});
  await prisma.campaign.deleteMany({});
  console.log('   ✅ All campaigns deleted');

  // 2. Delete ALL audience groups and members
  console.log('🗑️  Deleting all audience groups...');
  await prisma.audienceMember.deleteMany({});
  await prisma.audienceGroup.deleteMany({});
  console.log('   ✅ All audience groups deleted');

  // 3. Delete ALL email templates
  console.log('🗑️  Deleting all email templates...');
  await prisma.campaignTemplate.deleteMany({});
  console.log('   ✅ All email templates deleted');

  // 4. Get all businesses from LeadMine to analyze industries
  console.log('\n🔍 Analyzing businesses by industry...');
  
  try {
    const { fetchLeadMineBusinesses } = await import('@/lib/leadMine');
    const { data: leadMineBusinesses } = await fetchLeadMineBusinesses({
      limit: 2000,
      createMissing: false
    });

    if (!leadMineBusinesses || leadMineBusinesses.length === 0) {
      console.log('❌ No businesses found in LeadMine');
      return;
    }

    console.log(`📊 Found ${leadMineBusinesses.length} businesses in LeadMine`);

    // Filter businesses with primary emails
    const businessesWithEmails = leadMineBusinesses.filter(b => 
      b.contact?.primaryEmail && b.name
    );

    console.log(`📧 ${businessesWithEmails.length} businesses have primary emails`);

    // 5. Analyze and categorize by industry
    console.log('\n🏭 Categorizing businesses by industry...');
    
    const industryCategories = {
      'Construction & Building': [],
      'Retail & Commerce': [],
      'Professional Services': [],
      'Manufacturing & Production': [],
      'Transportation & Logistics': [],
      'Food & Hospitality': [],
      'Health & Wellness': [],
      'Technology & Communications': [],
      'Agriculture & Forestry': [],
      'Mining & Resources': [],
      'Tourism & Recreation': [],
      'Other Industries': []
    };

    // Categorize businesses based on name and description
    businessesWithEmails.forEach(business => {
      const name = business.name.toLowerCase();
      const address = business.address?.toLowerCase() || '';
      
      // Construction & Building
      if (name.includes('construction') || name.includes('building') || 
          name.includes('contractor') || name.includes('roofing') ||
          name.includes('plumbing') || name.includes('electrical') ||
          name.includes('welding') || name.includes('carpentry') ||
          name.includes('excavation') || name.includes('concrete')) {
        industryCategories['Construction & Building'].push(business);
      }
      // Mining & Resources
      else if (name.includes('mining') || name.includes('mineral') ||
               name.includes('quarry') || name.includes('aggregate') ||
               name.includes('coal') || name.includes('metal')) {
        industryCategories['Mining & Resources'].push(business);
      }
      // Agriculture & Forestry
      else if (name.includes('forest') || name.includes('logging') ||
               name.includes('lumber') || name.includes('agriculture') ||
               name.includes('farm') || name.includes('crop') ||
               name.includes('timber') || name.includes('wood')) {
        industryCategories['Agriculture & Forestry'].push(business);
      }
      // Retail & Commerce
      else if (name.includes('store') || name.includes('shop') ||
               name.includes('retail') || name.includes('market') ||
               name.includes('supply') || name.includes('sales') ||
               name.includes('outlet') || name.includes('mart')) {
        industryCategories['Retail & Commerce'].push(business);
      }
      // Food & Hospitality
      else if (name.includes('restaurant') || name.includes('hotel') ||
               name.includes('cafe') || name.includes('bar') ||
               name.includes('food') || name.includes('catering') ||
               name.includes('inn') || name.includes('lodge') ||
               name.includes('motel') || name.includes('pub')) {
        industryCategories['Food & Hospitality'].push(business);
      }
      // Professional Services
      else if (name.includes('law') || name.includes('legal') ||
               name.includes('accounting') || name.includes('financial') ||
               name.includes('consulting') || name.includes('advisory') ||
               name.includes('insurance') || name.includes('real estate') ||
               name.includes('property') || name.includes('management')) {
        industryCategories['Professional Services'].push(business);
      }
      // Health & Wellness
      else if (name.includes('medical') || name.includes('health') ||
               name.includes('clinic') || name.includes('dental') ||
               name.includes('pharmacy') || name.includes('therapy') ||
               name.includes('wellness') || name.includes('care')) {
        industryCategories['Health & Wellness'].push(business);
      }
      // Technology & Communications
      else if (name.includes('tech') || name.includes('computer') ||
               name.includes('software') || name.includes('digital') ||
               name.includes('web') || name.includes('internet') ||
               name.includes('telecom') || name.includes('communications')) {
        industryCategories['Technology & Communications'].push(business);
      }
      // Transportation & Logistics
      else if (name.includes('transport') || name.includes('trucking') ||
               name.includes('shipping') || name.includes('logistics') ||
               name.includes('freight') || name.includes('delivery') ||
               name.includes('hauling') || name.includes('moving')) {
        industryCategories['Transportation & Logistics'].push(business);
      }
      // Tourism & Recreation
      else if (name.includes('tour') || name.includes('travel') ||
               name.includes('adventure') || name.includes('outdoor') ||
               name.includes('recreation') || name.includes('entertainment') ||
               name.includes('attraction') || name.includes('park')) {
        industryCategories['Tourism & Recreation'].push(business);
      }
      // Manufacturing & Production
      else if (name.includes('manufacturing') || name.includes('production') ||
               name.includes('factory') || name.includes('plant') ||
               name.includes('industrial') || name.includes('processing')) {
        industryCategories['Manufacturing & Production'].push(business);
      }
      // Other Industries
      else {
        industryCategories['Other Industries'].push(business);
      }
    });

    // 6. Create industry-based audience groups
    console.log('\n👥 Creating industry-based audience groups...');
    
    for (const [industryName, businesses] of Object.entries(industryCategories)) {
      if (businesses.length > 0) {
        console.log(`\n📊 ${industryName}: ${businesses.length} businesses`);
        
        // Create audience group
        const audienceGroup = await prisma.audienceGroup.create({
          data: {
            name: `${industryName} - Northern BC`,
            description: `${businesses.length} ${industryName.toLowerCase()} businesses in Northern BC`,
            criteria: {
              industry: industryName,
              region: 'Northern BC',
              source: 'LeadMine'
            }
          }
        });

        // Add businesses to group
        let imported = 0;
        for (const business of businesses) {
          try {
            await prisma.audienceMember.create({
              data: {
                groupId: audienceGroup.id,
                businessId: business.id,
                businessName: business.name,
                primaryEmail: business.contact!.primaryEmail!,
                secondaryEmail: business.contact?.alternateEmail || null,
                tagsSnapshot: business.contact?.tags || [],
                inviteToken: business.invite?.token || null,
                meta: {
                  source: 'leadmine-industry-categorized',
                  industry: industryName,
                  address: business.address,
                  website: business.website,
                  contactPerson: business.contact?.contactPerson,
                  leadStatus: business.lead?.status,
                  leadPriority: business.lead?.priority
                },
                unsubscribed: false
              }
            });
            imported++;
          } catch (error) {
            console.error(`Error importing ${business.name}:`, error);
          }
        }
        
        console.log(`   ✅ Created group: ${audienceGroup.name} (${imported} members)`);
      }
    }

    // 7. Show final summary
    console.log('\n🎉 INDUSTRY-BASED AUDIENCES CREATED!');
    console.log('\n📊 Final Audience Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { _count: { members: 'desc' } }
    });

    for (const group of finalGroups) {
      console.log(`📊 ${group.name}: ${group._count.members} members`);
    }

    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    console.log(`\n📈 Total: ${totalMembers} businesses organized by industry`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Review the industry groups at: http://localhost:3003/admin/campaign');
    console.log('2. Create industry-specific email campaigns');
    console.log('3. Tailor messaging to each industry\'s needs');

  } catch (error) {
    console.error('❌ Error fetching from LeadMine:', error);
  }
}

cleanSlateAudiences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
