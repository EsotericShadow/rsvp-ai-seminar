#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function restoreFromLeadMine() {
  console.log('📧 Restoring verified emails from LeadMine database...\n');

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
    
    // Fetch all businesses from LeadMine
    const { data: leadMineBusinesses } = await fetchLeadMineBusinesses({
      limit: 1000, // Adjust based on your data size
      createMissing: false
    });

    if (!leadMineBusinesses || leadMineBusinesses.length === 0) {
      console.log('❌ No businesses found in LeadMine');
      return;
    }

    console.log(`📊 Found ${leadMineBusinesses.length} businesses in LeadMine`);

    let imported = 0;
    let skipped = 0;

    // Import each business that has a primary email
    for (const business of leadMineBusinesses) {
      try {
        const primaryEmail = business.contact?.primaryEmail;
        const businessName = business.name;
        const businessId = business.id;

        if (!primaryEmail || !businessName) {
          skipped++;
          continue;
        }

        // Check if this business already exists in our audience group
        const existing = await prisma.audienceMember.findFirst({
          where: {
            groupId: audienceGroup.id,
            businessId: businessId
          }
        });

        if (existing) {
          // Update existing member with latest data
          await prisma.audienceMember.update({
            where: { id: existing.id },
            data: {
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
        } else {
          // Create new member
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
        }

        imported++;
      } catch (error) {
        console.error(`Error importing business ${business.id}:`, error);
        skipped++;
      }
    }

    console.log(`\n✅ Import complete:`);
    console.log(`   📧 Imported: ${imported} verified businesses from LeadMine`);
    console.log(`   ⏭️  Skipped: ${skipped} businesses (missing data)`);

    // Show final status
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: audienceGroup.id }
    });

    console.log(`\n📊 Final audience size: ${finalCount} members`);

    // Show some examples
    const sampleMembers = await prisma.audienceMember.findMany({
      where: { groupId: audienceGroup.id },
      take: 5,
      select: {
        businessName: true,
        primaryEmail: true,
        meta: true
      }
    });

    console.log('\n📋 Sample businesses:');
    sampleMembers.forEach(member => {
      const meta = member.meta as any;
      console.log(`   - ${member.businessName}: ${member.primaryEmail} (${meta?.address || 'No address'})`);
    });

  } catch (error) {
    console.error('❌ Error fetching from LeadMine:', error);
    console.log('\n💡 Make sure your LeadMine environment variables are set:');
    console.log('   - LEADMINE_API_BASE');
    console.log('   - LEADMINE_API_KEY');
  }
}

restoreFromLeadMine()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
