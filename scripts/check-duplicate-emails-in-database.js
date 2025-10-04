require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicateEmailsInDatabase() {
  try {
    console.log('🔍 Checking for duplicate emails in the database...');
    
    // Get all audience members
    const audienceMembers = await prisma.audienceMember.findMany({
      select: {
        id: true,
        primaryEmail: true,
        businessName: true,
        businessId: true,
        createdAt: true
      },
      orderBy: { primaryEmail: 'asc' }
    });
    
    console.log(`📊 Total audience members in database: ${audienceMembers.length}`);
    
    // Group by email address
    const emailGroups = {};
    
    audienceMembers.forEach(member => {
      const email = member.primaryEmail;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(member);
    });
    
    // Find duplicates
    const duplicates = {};
    const uniqueEmails = {};
    
    Object.keys(emailGroups).forEach(email => {
      if (emailGroups[email].length > 1) {
        duplicates[email] = emailGroups[email];
      } else {
        uniqueEmails[email] = emailGroups[email][0];
      }
    });
    
    console.log(`\n📊 Database Analysis Results:`);
    console.log(`- Total unique email addresses: ${Object.keys(emailGroups).length}`);
    console.log(`- Emails with only one record: ${Object.keys(uniqueEmails).length}`);
    console.log(`- Emails with duplicate records: ${Object.keys(duplicates).length}`);
    
    if (Object.keys(duplicates).length > 0) {
      console.log(`\n🔄 Duplicate Email Records in Database (${Object.keys(duplicates).length} emails):`);
      console.log('='.repeat(100));
      
      let totalDuplicateRecords = 0;
      
      Object.keys(duplicates).forEach((email, index) => {
        const members = duplicates[email];
        totalDuplicateRecords += members.length;
        
        console.log(`${index + 1}. ${email} (${members.length} records)`);
        members.forEach((member, memberIndex) => {
          console.log(`   ${memberIndex + 1}. ID: ${member.id}`);
          console.log(`      Business Name: ${member.businessName || 'N/A'}`);
          console.log(`      Business ID: ${member.businessId || 'N/A'}`);
          console.log(`      Created: ${member.createdAt.toISOString()}`);
          console.log('');
        });
      });
      
      console.log(`\n📊 Duplicate Database Records Summary:`);
      console.log(`- Emails with duplicate records: ${Object.keys(duplicates).length}`);
      console.log(`- Total duplicate records: ${totalDuplicateRecords}`);
      console.log(`- Extra records (beyond first): ${totalDuplicateRecords - Object.keys(duplicates).length}`);
      
      // Save duplicate data
      const fs = require('fs');
      
      const duplicateData = {
        timestamp: new Date().toISOString(),
        totalAudienceMembers: audienceMembers.length,
        uniqueEmails: Object.keys(emailGroups).length,
        singleRecords: Object.keys(uniqueEmails).length,
        duplicateEmails: Object.keys(duplicates).length,
        totalDuplicateRecords: totalDuplicateRecords,
        extraRecords: totalDuplicateRecords - Object.keys(duplicates).length,
        duplicates: duplicates
      };
      
      fs.writeFileSync('database-duplicate-emails.json', JSON.stringify(duplicateData, null, 2));
      console.log('\n💾 Duplicate database analysis saved to database-duplicate-emails.json');
      
      // Create CSV of duplicates
      const csvRows = ['Email', 'Total Records', 'Business Names', 'Business IDs', 'Created Dates', 'Member IDs'];
      Object.keys(duplicates).forEach(email => {
        const members = duplicates[email];
        const businessNames = members.map(m => m.businessName || 'N/A').join('; ');
        const businessIds = members.map(m => m.businessId || 'N/A').join('; ');
        const createdDates = members.map(m => m.createdAt.toISOString()).join('; ');
        const memberIds = members.map(m => m.id).join('; ');
        csvRows.push(`"${email}","${members.length}","${businessNames}","${businessIds}","${createdDates}","${memberIds}"`);
      });
      
      fs.writeFileSync('database-duplicate-emails.csv', csvRows.join('\n'));
      console.log('💾 Duplicate database records CSV saved to database-duplicate-emails.csv');
      
      // Check if the 6-email businesses are in the duplicates
      console.log('\n🎯 Checking if the 6-email businesses have duplicate database records:');
      const sixEmailBusinesses = ['anita@coppersidefoods.com', 'amin.sunderji@gmail.com', 'manager@parkavemedical.ca'];
      
      sixEmailBusinesses.forEach(email => {
        if (duplicates[email]) {
          console.log(`✅ ${email}: ${duplicates[email].length} database records (explains ${duplicates[email].length} emails sent)`);
        } else {
          console.log(`❌ ${email}: No duplicate database records found (mystery!)`);
        }
      });
      
    } else {
      console.log('\n✅ No duplicate email records found in database!');
      console.log('The duplicate emails must be caused by something else in the email job creation process.');
    }
    
  } catch (error) {
    console.error('❌ Error checking duplicate emails in database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicateEmailsInDatabase();

