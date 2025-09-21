#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function quickRestoreFromLeadMine() {
  console.log('📧 Quick restore from LeadMine (batch processing)...\n');

  try {
    // Get the clean audience group
    const audienceGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Verified Business Emails' }
    });

    if (!audienceGroup) {
      console.error('❌ Audience group not found!');
      return;
    }

    console.log('🔍 Fetching businesses from LeadMine...');
    
    // Fetch businesses from LeadMine in smaller batches
    const { data: leadMineBusinesses } = await fetchLeadMineBusinesses({
      limit: 100, // Smaller batch
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

    // Process in batches
    const batchSize = 10;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < businessesWithEmails.length; i += batchSize) {
      const batch = businessesWithEmails.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(businessesWithEmails.length/batchSize)} (${batch.length} businesses)`);

      const batchPromises = batch.map(async (business) => {
        try {
          const primaryEmail = business.contact!.primaryEmail!;
          const businessName = business.name!;
          const businessId = business.id;

          // Check if exists
          const existing = await prisma.audienceMember.findFirst({
            where: {
              groupId: audienceGroup.id,
              businessId: businessId
            }
          });

          if (existing) {
            // Update existing
            await prisma.audienceMember.update({
              where: { id: existing.id },
              data: {
                businessName: businessName,
                primaryEmail: primaryEmail,
                inviteToken: business.invite?.token || null,
                meta: {
                  source: 'leadmine-verified',
                  address: business.address,
                  website: business.website
                }
              }
            });
          } else {
            // Create new
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
                  website: business.website
                },
                unsubscribed: false
              }
            });
          }

          return { success: true, businessId };
        } catch (error) {
          console.error(`Error processing ${business.id}:`, error);
          return { success: false, businessId: business.id };
        }
      });

      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          imported++;
        } else {
          skipped++;
        }
      });

      console.log(`   ✅ Batch complete: ${imported} imported, ${skipped} skipped`);
    }

    console.log(`\n✅ Import complete:`);
    console.log(`   📧 Imported: ${imported} verified businesses from LeadMine`);
    console.log(`   ⏭️  Skipped: ${skipped} businesses (errors)`);

    // Show final status
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: audienceGroup.id }
    });

    console.log(`\n📊 Final audience size: ${finalCount} members`);

    // Show some examples
    const sampleMembers = await prisma.audienceMember.findMany({
      where: { 
        groupId: audienceGroup.id,
        meta: { path: ['source'], equals: 'leadmine-verified' }
      },
      take: 5,
      select: {
        businessName: true,
        primaryEmail: true,
        meta: true
      }
    });

    console.log('\n📋 Sample verified businesses:');
    sampleMembers.forEach(member => {
      const meta = member.meta as any;
      console.log(`   - ${member.businessName}: ${member.primaryEmail}`);
    });

  } catch (error) {
    console.error('❌ Error fetching from LeadMine:', error);
  }
}

quickRestoreFromLeadMine()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
