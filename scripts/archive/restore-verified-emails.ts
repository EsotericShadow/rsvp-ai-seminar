#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function restoreVerifiedEmails() {
  console.log('📧 Restoring verified business emails...\n');

  try {
    // Read the Excel file
    const filePath = '/Users/main/Desktop/evergreen/RSVP/rsvp-app/lead-mine/Active-Business-Licences-with-email - June 18, 2025.xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${jsonData.length} rows in spreadsheet`);

    // Get the clean audience group
    const audienceGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Verified Business Emails' }
    });

    if (!audienceGroup) {
      console.error('❌ Audience group not found!');
      return;
    }

    let imported = 0;
    let skipped = 0;

    // Import each row
    for (const row of jsonData) {
      try {
        const typedRow = row as Record<string, any>;
        const businessName = typedRow['Entity Name'] || '';
        const primaryEmail = typedRow['Contact Email'] || '';
        const businessId = typedRow['License Number'] || typedRow['ID'] || typedRow['Business ID'] || '';
        
        if (!businessName || !primaryEmail) {
          skipped++;
          continue;
        }

        const address = `${typedRow['Mailing Address Street'] || ''} ${typedRow['Mailing Address City'] || ''} ${typedRow['Province / State'] || ''} ${typedRow['Mailing Address Postal Code'] || ''}`.trim();
        const city = typedRow['Mailing Address City'] || 'Terrace';
        const province = typedRow['Province / State'] || 'BC';
        const postalCode = typedRow['Mailing Address Postal Code'] || '';

        await prisma.audienceMember.create({
          data: {
            groupId: audienceGroup.id,
            businessId: businessId || `business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            businessName: businessName,
            primaryEmail: primaryEmail,
            secondaryEmail: null,
            tagsSnapshot: [],
            inviteToken: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            meta: {
              address: address,
              city: city,
              province: province,
              postalCode: postalCode,
              source: 'verified-spreadsheet'
            },
            unsubscribed: false
          }
        });

        imported++;
      } catch (error) {
        console.error(`Error importing row:`, error);
        skipped++;
      }
    }

    console.log(`\n✅ Import complete:`);
    console.log(`   📧 Imported: ${imported} verified business emails`);
    console.log(`   ⏭️  Skipped: ${skipped} rows (missing data)`);

    // Show final status
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: audienceGroup.id }
    });

    console.log(`\n📊 Final audience size: ${finalCount} members`);

  } catch (error) {
    console.error('❌ Error reading Excel file:', error);
    console.log('\n💡 Make sure the Excel file exists at:');
    console.log('   /Users/main/Desktop/evergreen/RSVP/rsvp-app/lead-mine/Active-Business-Licences-with-email - June 18, 2025.xlsx');
  }
}

restoreVerifiedEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
