#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function fetchAllWithPagination() {
  console.log('📧 Fetching ALL businesses from LeadMine with pagination...\n');

  try {
    // Get the clean audience group
    const audienceGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Verified Business Emails' }
    });

    if (!audienceGroup) {
      console.error('❌ Audience group not found!');
      return;
    }

    console.log('🔍 Fetching ALL businesses from LeadMine using pagination...');
    
    let allBusinesses: any[] = [];
    let cursor: string | null = null;
    let pageCount = 0;
    const pageSize = 200;

    // Fetch all pages
    do {
      pageCount++;
      console.log(`\n📄 Fetching page ${pageCount} (limit: ${pageSize}${cursor ? `, cursor: ${cursor.substring(0, 20)}...` : ''})`);
      
      const response = await fetchLeadMineBusinesses({
        limit: pageSize,
        cursor: cursor || undefined,
        hasEmail: true,
        createMissing: false
      });

      const businesses = response.data || [];
      allBusinesses = allBusinesses.concat(businesses);
      
      console.log(`   📊 Page ${pageCount}: ${businesses.length} businesses`);
      console.log(`   📊 Total so far: ${allBusinesses.length} businesses`);
      
      cursor = response.pagination?.nextCursor || null;
      
      if (cursor) {
        console.log(`   ➡️  Next cursor: ${cursor.substring(0, 20)}...`);
      } else {
        console.log(`   ✅ No more pages - pagination complete`);
      }
      
    } while (cursor);

    console.log(`\n📊 TOTAL FETCHED: ${allBusinesses.length} businesses from ${pageCount} pages`);

    // Filter businesses with primary emails
    const businessesWithEmails = allBusinesses.filter(b => 
      b.contact?.primaryEmail && b.name
    );

    console.log(`📧 ${businessesWithEmails.length} businesses have primary emails`);

    // Clear existing members first
    console.log('\n🧹 Clearing existing members...');
    await prisma.audienceMember.deleteMany({
      where: { groupId: audienceGroup.id }
    });

    // Process in batches
    const batchSize = 50;
    let imported = 0;
    let skipped = 0;

    console.log(`\n📦 Processing ${businessesWithEmails.length} businesses in batches of ${batchSize}...`);

    for (let i = 0; i < businessesWithEmails.length; i += batchSize) {
      const batch = businessesWithEmails.slice(i, i + batchSize);
      const batchNum = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(businessesWithEmails.length/batchSize);
      
      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} businesses)`);

      const batchPromises = batch.map(async (business) => {
        try {
          const primaryEmail = business.contact!.primaryEmail!;
          const businessName = business.name!;
          const businessId = business.id;

          await prisma.audienceMember.create({
            data: {
              groupId: audienceGroup.id,
              businessId: businessId,
              businessName: businessName,
              primaryEmail: primaryEmail,
              secondaryEmail: business.contact?.alternateEmail || null,
              tagsSnapshot: business.contact?.tags || [],
              inviteToken: business.invite?.token || null,
              meta: {
                source: 'leadmine-verified',
                address: business.address,
                website: business.website,
                contactPerson: business.contact?.contactPerson,
                leadStatus: business.lead?.status,
                leadPriority: business.lead?.priority,
                emailsSent: business.invite?.emailsSent || 0,
                visitsCount: business.invite?.visitsCount || 0,
                rsvpsCount: business.invite?.rsvpsCount || 0,
                lastEmailSent: business.invite?.lastEmailSent,
                lastVisitedAt: business.invite?.lastVisitedAt,
                lastRsvpAt: business.invite?.lastRsvpAt
              },
              unsubscribed: false
            }
          });

          return { success: true, businessId };
        } catch (error) {
          console.error(`Error processing ${business.id}:`, error);
          return { success: false, businessId: business.id };
        }
      });

      const results = await Promise.allSettled(batchPromises);
      
      let batchImported = 0;
      let batchSkipped = 0;
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          batchImported++;
          imported++;
        } else {
          batchSkipped++;
          skipped++;
        }
      });

      console.log(`   ✅ Batch ${batchNum} complete: ${batchImported} imported, ${batchSkipped} skipped`);
      console.log(`   📊 Total progress: ${imported}/${businessesWithEmails.length} (${Math.round((imported/businessesWithEmails.length)*100)}%)`);
    }

    console.log(`\n✅ Import complete:`);
    console.log(`   📧 Imported: ${imported} verified businesses from LeadMine`);
    console.log(`   ⏭️  Skipped: ${skipped} businesses (errors)`);

    // Show final status
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: audienceGroup.id }
    });

    console.log(`\n📊 Final audience size: ${finalCount} members`);

    if (finalCount >= 1000) {
      console.log('🎉 Excellent! We have over 1000 businesses!');
    } else if (finalCount === 1122) {
      console.log('🎉 Perfect! We have exactly 1122 businesses as expected!');
    } else {
      console.log(`⚠️  Expected 1122 businesses, but got ${finalCount}`);
      console.log('💡 This might be all the businesses in LeadMine, or there might be more on other pages');
    }

  } catch (error) {
    console.error('❌ Error fetching from LeadMine:', error);
  }
}

fetchAllWithPagination()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
