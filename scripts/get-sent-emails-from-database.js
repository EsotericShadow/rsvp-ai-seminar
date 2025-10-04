require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getSentEmailsFromDatabase() {
  try {
    console.log('📧 Getting sent emails from database...');
    
    // Get all RSVPs (these should have confirmation emails sent)
    const rsvps = await prisma.rSVP.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        attendanceStatus: true,
        createdAt: true,
        organization: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total RSVPs in database: ${rsvps.length}`);
    
    if (rsvps.length > 0) {
      console.log('\n📋 RSVP Confirmation Emails Sent:');
      console.log('='.repeat(80));
      
      rsvps.forEach((rsvp, index) => {
        console.log(`${index + 1}. ${rsvp.email}`);
        console.log(`   Name: ${rsvp.fullName}`);
        console.log(`   Organization: ${rsvp.organization || 'N/A'}`);
        console.log(`   Attendance: ${rsvp.attendanceStatus}`);
        console.log(`   RSVP Date: ${rsvp.createdAt.toISOString()}`);
        console.log(`   RSVP ID: ${rsvp.id}`);
        console.log('');
      });
      
      // Create unique email list
      const uniqueEmails = [...new Set(rsvps.map(rsvp => rsvp.email))];
      
      console.log(`\n📊 Summary:`);
      console.log(`- Total RSVPs: ${rsvps.length}`);
      console.log(`- Unique email addresses: ${uniqueEmails.length}`);
      
      // Save to files
      const fs = require('fs');
      
      // JSON file
      const outputData = {
        timestamp: new Date().toISOString(),
        totalRSVPs: rsvps.length,
        uniqueEmails: uniqueEmails.length,
        rsvps: rsvps,
        uniqueEmailList: uniqueEmails
      };
      
      fs.writeFileSync('rsvp-emails.json', JSON.stringify(outputData, null, 2));
      console.log('\n💾 Data saved to rsvp-emails.json');
      
      // CSV file
      const csvContent = [
        'Email,Name,Organization,Attendance Status,RSVP Date,RSVP ID',
        ...rsvps.map(rsvp => `"${rsvp.email}","${rsvp.fullName}","${rsvp.organization || ''}","${rsvp.attendanceStatus}","${rsvp.createdAt.toISOString()}","${rsvp.id}"`)
      ].join('\n');
      
      fs.writeFileSync('rsvp-emails.csv', csvContent);
      console.log('💾 CSV saved to rsvp-emails.csv');
      
      // Simple email list
      const emailList = uniqueEmails.join('\n');
      fs.writeFileSync('email-list.txt', emailList);
      console.log('💾 Email list saved to email-list.txt');
      
    } else {
      console.log('❌ No RSVPs found in database');
    }
    
    // Also check for any campaign sends
    console.log('\n📧 Checking campaign email sends...');
    const campaignSends = await prisma.campaignSend.findMany({
      select: {
        id: true,
        businessId: true,
        sentAt: true,
        status: true,
        schedule: {
          select: {
            template: {
              select: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 100
    });
    
    console.log(`📊 Total campaign sends: ${campaignSends.length}`);
    
    if (campaignSends.length > 0) {
      console.log('\n📋 Recent Campaign Sends:');
      campaignSends.slice(0, 10).forEach((send, index) => {
        console.log(`${index + 1}. Business ID: ${send.businessId}`);
        console.log(`   Subject: ${send.schedule?.template?.subject || 'N/A'}`);
        console.log(`   Status: ${send.status}`);
        console.log(`   Sent: ${send.sentAt?.toISOString() || 'N/A'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting sent emails from database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getSentEmailsFromDatabase();

