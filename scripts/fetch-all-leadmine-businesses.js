const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import the actual LeadMine integration
const { fetchLeadMineBusinesses } = require('../src/lib/leadMine');

async function fetchAllLeadMineBusinesses() {
  try {
    console.log('=== Fetching All LeadMine Businesses ===');
    
    let allBusinesses = [];
    let cursor = null;
    let pageCount = 0;
    const pageSize = 100; // Fetch 100 at a time
    
    console.log('🔍 Starting paginated fetch from LeadMine...');
    
    while (true) {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}${cursor ? ` (cursor: ${cursor})` : ''}...`);
      
      const response = await fetchLeadMineBusinesses({
        limit: pageSize,
        cursor: cursor,
        hasEmail: true, // Only businesses with email addresses
        createMissing: false // Don't create missing businesses
      });
      
      console.log(`  📊 Found ${response.data.length} businesses on this page`);
      
      allBusinesses = allBusinesses.concat(response.data);
      
      // Check if there are more pages
      if (!response.pagination.nextCursor) {
        console.log('✅ Reached end of pagination');
        break;
      }
      
      cursor = response.pagination.nextCursor;
      
      // Safety check to prevent infinite loops
      if (pageCount > 50) {
        console.log('⚠️ Reached maximum page limit (50), stopping...');
        break;
      }
    }
    
    console.log(`\n🎉 Successfully fetched ${allBusinesses.length} businesses from LeadMine!`);
    
    // Show some statistics
    const withPrimaryEmail = allBusinesses.filter(b => b.contact?.primaryEmail).length;
    const withAlternateEmail = allBusinesses.filter(b => b.contact?.alternateEmail).length;
    const withInviteToken = allBusinesses.filter(b => b.invite?.token).length;
    
    console.log('\n📊 Business Statistics:');
    console.log(`  - Total businesses: ${allBusinesses.length}`);
    console.log(`  - With primary email: ${withPrimaryEmail}`);
    console.log(`  - With alternate email: ${withAlternateEmail}`);
    console.log(`  - With invite token: ${withInviteToken}`);
    console.log(`  - With both emails: ${allBusinesses.filter(b => b.contact?.primaryEmail && b.contact?.alternateEmail).length}`);
    
    return allBusinesses;
    
  } catch (error) {
    console.error('❌ Error fetching LeadMine businesses:', error);
    throw error;
  }
}

async function createComprehensiveAudienceGroup(businesses) {
  try {
    console.log('\n=== Creating Comprehensive Audience Group ===');
    
    // Delete the existing small group first
    const existingGroup = await prisma.audienceGroup.findFirst({
      where: {
        name: 'AI Event 2025 - All Existing Businesses'
      }
    });
    
    if (existingGroup) {
      console.log('🗑️ Deleting existing small audience group...');
      await prisma.audienceMember.deleteMany({
        where: { groupId: existingGroup.id }
      });
      await prisma.audienceGroup.delete({
        where: { id: existingGroup.id }
      });
      console.log('✅ Deleted existing group');
    }
    
    // Create the new comprehensive audience group
    const group = await prisma.audienceGroup.create({
      data: {
        name: 'AI Event 2025 - All LeadMine Businesses',
        description: `Complete list of ${businesses.length} businesses from LeadMine for AI event campaign`,
        meta: {
          source: 'leadmine_comprehensive',
          total_businesses: businesses.length,
          campaign: 'AI Event Series 2025',
          fetched_at: new Date().toISOString()
        }
      }
    });
    
    console.log(`✅ Created audience group: ${group.name} (ID: ${group.id})`);
    
    // Add all businesses as members
    console.log('📝 Adding businesses as audience members...');
    
    const members = [];
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const business of businesses) {
      // Only add businesses that have at least one email
      if (business.contact?.primaryEmail || business.contact?.alternateEmail) {
        const member = await prisma.audienceMember.create({
          data: {
            groupId: group.id,
            businessId: business.id,
            businessName: business.name,
            primaryEmail: business.contact?.primaryEmail || business.contact?.alternateEmail,
            secondaryEmail: business.contact?.alternateEmail || null,
            inviteToken: business.invite?.token || null,
            tagsSnapshot: business.contact?.tags || [],
            meta: {
              contactPerson: business.contact?.contactPerson,
              source: 'leadmine_comprehensive',
              lastEmailMeta: business.invite?.lastEmailMeta,
              leadStatus: business.lead?.status,
              leadPriority: business.lead?.priority,
              website: business.website,
              address: business.address,
              createdAt: business.createdAt,
              campaign: 'AI Event Series 2025'
            }
          }
        });
        
        members.push(member);
        addedCount++;
        
        if (addedCount % 100 === 0) {
          console.log(`  Added ${addedCount}/${businesses.length} members...`);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ Added ${addedCount} members to audience group`);
    if (skippedCount > 0) {
      console.log(`⚠️ Skipped ${skippedCount} businesses (no email address)`);
    }
    
    // Update the group description with actual counts
    await prisma.audienceGroup.update({
      where: { id: group.id },
      data: {
        description: `Complete list of ${addedCount} businesses from LeadMine for AI event campaign (${skippedCount} skipped - no email)`,
        meta: {
          source: 'leadmine_comprehensive',
          total_businesses: businesses.length,
          added_members: addedCount,
          skipped_members: skippedCount,
          campaign: 'AI Event Series 2025',
          fetched_at: new Date().toISOString()
        }
      }
    });
    
    return { group, members };
    
  } catch (error) {
    console.error('❌ Error creating audience group:', error);
    throw error;
  }
}

async function updateCampaignWithNewAudience(audienceGroup) {
  try {
    console.log('\n=== Updating Campaign with New Audience ===');
    
    // Find the campaign we created
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: 'AI Event Series 2025 - Complete Campaign'
      },
      include: {
        schedules: true
      }
    });
    
    if (!campaign) {
      console.log('❌ Campaign not found');
      return null;
    }
    
    console.log(`📧 Found campaign: ${campaign.name} (ID: ${campaign.id})`);
    console.log(`📅 Campaign has ${campaign.schedules.length} schedules`);
    
    // Update all schedules to use the new audience group
    for (const schedule of campaign.schedules) {
      await prisma.campaignSchedule.update({
        where: { id: schedule.id },
        data: {
          groupId: audienceGroup.group.id,
          throttlePerMinute: 25, // More conservative for larger audience
          meta: {
            email_number: schedule.stepOrder,
            email_date: schedule.sendAt?.toISOString().split('T')[0],
            variants_available: 3,
            audience_size: audienceGroup.members.length,
            updated_for_comprehensive_audience: true
          }
        }
      });
      
      console.log(`✅ Updated schedule ${schedule.stepOrder} to use new audience`);
    }
    
    // Update campaign metadata
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        meta: {
          campaign_type: 'ai_event_series',
          total_emails: 7,
          total_recipients: audienceGroup.members.length,
          event_date: '2025-10-23',
          event_time: '17:00',
          event_location: 'Terrace, BC',
          audience_source: 'leadmine_comprehensive',
          created_with_comprehensive_audience: true
        }
      }
    });
    
    console.log(`✅ Updated campaign metadata for ${audienceGroup.members.length} recipients`);
    
    return campaign;
    
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Comprehensive LeadMine Business Fetch\n');
    
    // Step 1: Fetch all businesses from LeadMine
    const businesses = await fetchAllLeadMineBusinesses();
    
    // Step 2: Create comprehensive audience group
    const audienceGroup = await createComprehensiveAudienceGroup(businesses);
    
    // Step 3: Update campaign to use new audience
    const campaign = await updateCampaignWithNewAudience(audienceGroup);
    
    console.log('\n🎉 COMPREHENSIVE LEADMINE INTEGRATION COMPLETE!');
    console.log(`📧 Email templates: 21 (already created)`);
    console.log(`👥 Audience members: ${audienceGroup.members.length}`);
    console.log(`📅 Campaign schedules: 7 (updated)`);
    console.log(`\n📊 Final Summary:`);
    console.log(`  - Campaign ID: ${campaign.id}`);
    console.log(`  - Audience Group ID: ${audienceGroup.group.id}`);
    console.log(`  - Total Recipients: ${audienceGroup.members.length}`);
    console.log(`  - Email Schedule: Sept 25 → Oct 23, 2025`);
    console.log(`  - Throttle Rate: 25 emails per minute`);
    console.log(`  - Status: DRAFT (ready to activate)`);
    
  } catch (error) {
    console.error('❌ LeadMine integration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
