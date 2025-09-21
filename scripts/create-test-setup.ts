#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestSetup() {
  console.log('🧪 Creating simple test setup...\n');

  // Get the clean audience group
  const audienceGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Verified Business Emails' }
  });

  if (!audienceGroup) {
    console.error('❌ Audience group not found!');
    return;
  }

  // Create test business emails
  const testEmails = [
    {
      businessName: 'Terrace Logging Co.',
      primaryEmail: 'gabriel.lacroix94@icloud.com',
      businessId: 'test-001'
    },
    {
      businessName: 'Kitimat Construction Ltd.',
      primaryEmail: 'greenalderson@gmail.com', 
      businessId: 'test-002'
    },
    {
      businessName: 'Prince Rupert Tourism',
      primaryEmail: 'test@evergreenwebsolutions.ca',
      businessId: 'test-003'
    },
    {
      businessName: 'Terrace Mining Supply',
      primaryEmail: 'info@terracemining.com',
      businessId: 'test-004'
    },
    {
      businessName: 'Northern BC Forestry',
      primaryEmail: 'contact@northernforestry.ca',
      businessId: 'test-005'
    }
  ];

  console.log(`📧 Adding ${testEmails.length} test business emails...`);

  for (const email of testEmails) {
    await prisma.audienceMember.create({
      data: {
        groupId: audienceGroup.id,
        businessId: email.businessId,
        businessName: email.businessName,
        primaryEmail: email.primaryEmail,
        secondaryEmail: null,
        tagsSnapshot: ['test', 'verified'],
        inviteToken: `invite-${email.businessId}-${Date.now()}`,
        meta: {
          source: 'test-setup',
          city: 'Terrace',
          province: 'BC'
        },
        unsubscribed: false
      }
    });
    console.log(`   ✅ Added ${email.businessName} (${email.primaryEmail})`);
  }

  // Show final status
  const finalCount = await prisma.audienceMember.count({
    where: { groupId: audienceGroup.id }
  });

  console.log(`\n📊 Final audience size: ${finalCount} members`);
  
  console.log('\n✅ TEST SETUP COMPLETE!');
  console.log('\n🎯 READY TO TEST:');
  console.log('1. Go to: http://localhost:3003/admin/campaign');
  console.log('2. Click on "AI Event 2025 - Simple Campaign"');
  console.log('3. Change status from DRAFT to ACTIVE');
  console.log('4. Watch it send to your test emails');
  console.log('5. Check your inboxes for the emails!');
  
  console.log('\n📧 Test emails that will receive:');
  testEmails.forEach(email => {
    console.log(`   - ${email.businessName}: ${email.primaryEmail}`);
  });
}

createTestSetup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
