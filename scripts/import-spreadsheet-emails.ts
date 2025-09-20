import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function importSpreadsheetEmails() {
  try {
    console.log('📊 Importing verified emails from spreadsheet...');

    // 1. Read the Excel file
    const excelPath = path.join(process.cwd(), 'lead-mine', 'Active-Business-Licences-with-email  - June 18, 2025.xlsx');
    console.log(`Reading Excel file: ${excelPath}`);
    
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${jsonData.length} rows in spreadsheet`);

    // 2. Create or find the verified emails audience group
    console.log('📋 Creating verified emails audience group...');
    let verifiedGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Verified Business Emails - Spreadsheet' }
    });

    if (!verifiedGroup) {
      verifiedGroup = await prisma.audienceGroup.create({
        data: {
          name: 'Verified Business Emails - Spreadsheet',
          description: 'Business emails verified from Active Business Licenses spreadsheet - June 18, 2025',
          criteria: {
            source: 'spreadsheet',
            verified: true,
            dateImported: new Date().toISOString()
          }
        }
      });
    }

    // 3. Process each row and create audience members
    console.log('👥 Processing businesses and creating audience members...');
    
    const businesses = [];
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of jsonData) {
      try {
        // Extract data from row - using actual column names from spreadsheet
        const businessName = row['Entity Name'] || '';
        const primaryEmail = row['Contact Email'] || '';
        const businessId = row['License Number'] || row['ID'] || row['Business ID'] || '';
        const address = `${row['Mailing Address Street'] || ''} ${row['Mailing Address City'] || ''} ${row['Province / State'] || ''} ${row['Mailing Address Postal Code'] || ''}`.trim();
        const city = row['Mailing Address City'] || 'Terrace';
        const province = row['Province / State'] || 'BC';
        const postalCode = row['Mailing Address Postal Code'] || '';

        // Skip if no email or business name
        if (!primaryEmail || !businessName) {
          skipped++;
          console.log(`⚠️  Skipping row: Missing email or business name`);
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(primaryEmail)) {
          skipped++;
          console.log(`⚠️  Skipping invalid email: ${primaryEmail}`);
          continue;
        }

        // Create business ID if not provided
        const finalBusinessId = businessId || `spreadsheet_${primaryEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

        // Check if member already exists
        const existingMember = await prisma.audienceMember.findFirst({
          where: {
            groupId: verifiedGroup.id,
            OR: [
              { businessId: finalBusinessId },
              { primaryEmail: primaryEmail }
            ]
          }
        });

        if (existingMember) {
          console.log(`⏭️  Member already exists: ${businessName} (${primaryEmail})`);
          skipped++;
          continue;
        }

        businesses.push({
          groupId: verifiedGroup.id,
          businessId: finalBusinessId,
          businessName: businessName,
          primaryEmail: primaryEmail,
          tagsSnapshot: ['verified', 'spreadsheet', 'terrace-bc'],
          meta: {
            source: 'spreadsheet',
            verified: true,
            importDate: new Date().toISOString(),
            originalData: {
              address: address,
              city: city,
              province: province,
              postalCode: postalCode,
              licenseNumber: businessId
            }
          }
        });

        processed++;
        
        // Log progress every 50 records
        if (processed % 50 === 0) {
          console.log(`📊 Processed ${processed} businesses...`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error processing row:`, error);
      }
    }

    // 4. Batch insert all businesses
    console.log(`💾 Inserting ${businesses.length} businesses into database...`);
    
    if (businesses.length > 0) {
      // Insert in batches of 100 to avoid database limits
      const batchSize = 100;
      for (let i = 0; i < businesses.length; i += batchSize) {
        const batch = businesses.slice(i, i + batchSize);
        
        await prisma.audienceMember.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}`);
      }
    }

    // 5. Generate invite tokens for all members
    console.log('🔑 Generating invite tokens...');
    const members = await prisma.audienceMember.findMany({
      where: { 
        groupId: verifiedGroup.id,
        inviteToken: null
      }
    });

    for (const member of members) {
      const token = `verified_${member.businessId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await prisma.audienceMember.update({
        where: { id: member.id },
        data: { inviteToken: token }
      });
    }

    console.log('✅ Import completed successfully!');
    console.log('');
    console.log('📊 Import Summary:');
    console.log(`   Total rows processed: ${jsonData.length}`);
    console.log(`   Businesses imported: ${processed}`);
    console.log(`   Skipped (duplicates/invalid): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Group ID: ${verifiedGroup.id}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Go to admin dashboard: http://localhost:3000/admin/campaign');
    console.log('2. Create a test campaign using the "Verified Business Emails - Spreadsheet" group');
    console.log('3. Test email sending with the verified emails');
    console.log('');
    console.log('🗑️  You can now safely delete the Excel file:');
    console.log(`   rm "${excelPath}"`);

  } catch (error) {
    console.error('❌ Error importing spreadsheet emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importSpreadsheetEmails();
