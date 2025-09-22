import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses, type LeadMineBusiness } from '../src/lib/leadMine';

const prisma = new PrismaClient();

async function fetchAllLeadMineBusinesses() {
  console.log('🚀 Fetching All LeadMine Businesses...\n');

  try {
    let cursor: string | null = null;
    let totalFetched = 0;
    let hasMore = true;
    const businesses: LeadMineBusiness[] = [];

    console.log('📡 Fetching businesses from LeadMine API...');

    while (hasMore) {
      console.log(`📄 Fetching batch with cursor: ${cursor || 'initial'}...`);
      
      try {
        const response = await fetchLeadMineBusinesses({
          limit: 100,
          cursor: cursor || undefined,
          hasEmail: true, // Only fetch businesses with email addresses
        });

        if (!response.data || response.data.length === 0) {
          hasMore = false;
          console.log('📄 No more businesses found');
          break;
        }

        businesses.push(...response.data);
        totalFetched += response.data.length;
        
        console.log(`✅ Fetched ${response.data.length} businesses (Total: ${totalFetched})`);
        
        cursor = response.pagination.nextCursor;
        hasMore = !!cursor;
        
        // Safety limit to prevent infinite loops
        if (totalFetched > 5000) {
          console.log('⚠️ Reached safety limit of 5000 businesses');
          break;
        }

        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('❌ Error fetching from LeadMine API:', error);
        break;
      }
    }

    console.log(`\n📊 Total businesses fetched from LeadMine: ${totalFetched}`);

    if (businesses.length === 0) {
      console.log('❌ No businesses found in LeadMine API');
      return;
    }

    // Clear existing audience data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create a single audience group for all businesses
    console.log('\n👥 Creating audience group for all LeadMine businesses...');
    const audienceGroup = await prisma.audienceGroup.create({
      data: {
        name: 'ALL LEADMINE BUSINESSES',
        description: `All ${totalFetched} businesses fetched from LeadMine API`,
        criteria: {
          source: 'leadmine_api',
          totalBusinesses: totalFetched,
          fetchedAt: new Date().toISOString(),
          categorizationMethod: 'raw_leadmine_data'
        }
      }
    });

    // Add all businesses as audience members
    console.log('\n📝 Adding businesses as audience members...');
    let addedCount = 0;
    
    for (const business of businesses) {
      try {
        await prisma.audienceMember.create({
          data: {
            groupId: audienceGroup.id,
            businessId: business.id,
            businessName: business.name || 'Unknown Business',
            primaryEmail: business.contact.primaryEmail || '',
            secondaryEmail: business.contact.alternateEmail || '',
            tagsSnapshot: business.contact.tags || '',
            inviteToken: business.invite?.token || `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            meta: {
              source: 'leadmine_api',
              originalData: business,
              fetchedAt: new Date().toISOString(),
              leadMineId: business.id,
              address: business.address,
              website: business.website,
              contactPerson: business.contact.contactPerson,
              leadStatus: business.lead.status,
              leadPriority: business.lead.priority,
              leadAssignedTo: business.lead.assignedTo,
              nextFollowUpDate: business.lead.nextFollowUpDate,
              emailsSent: business.invite?.emailsSent || 0,
              lastEmailSent: business.invite?.lastEmailSent,
              visitsCount: business.invite?.visitsCount || 0,
              lastVisitedAt: business.invite?.lastVisitedAt,
              rsvpsCount: business.invite?.rsvpsCount || 0,
              lastRsvpAt: business.invite?.lastRsvpAt
            }
          }
        });
        addedCount++;
        
        if (addedCount % 100 === 0) {
          console.log(`   ✅ Added ${addedCount}/${totalFetched} businesses...`);
        }
      } catch (error) {
        console.error(`❌ Error adding business ${business.name}:`, error);
      }
    }

    console.log(`\n🎉 Successfully added ${addedCount} businesses to database!`);

    // Final summary
    const finalCount = await prisma.audienceMember.count();
    const finalGroups = await prisma.audienceGroup.count();
    
    console.log('\n📊 Final Summary:');
    console.log(`   📧 Total Audience Groups: ${finalGroups}`);
    console.log(`   👥 Total Audience Members: ${finalCount}`);
    console.log(`   📡 Fetched from LeadMine: ${totalFetched}`);
    console.log(`   💾 Stored in Database: ${addedCount}`);

  } catch (error) {
    console.error('❌ Error fetching LeadMine businesses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAllLeadMineBusinesses();
