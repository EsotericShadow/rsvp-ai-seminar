require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAllSentEmails() {
  try {
    console.log('📧 Getting all sent emails from database...');
    
    // Get all campaign sends with more details
    const campaignSends = await prisma.campaignSend.findMany({
      include: {
        schedule: {
          include: {
            template: {
              select: {
                subject: true,
                name: true
              }
            },
            group: {
              include: {
                members: {
                  select: {
                    primaryEmail: true,
                    businessName: true,
                    businessId: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });
    
    console.log(`📊 Total campaign sends: ${campaignSends.length}`);
    
    if (campaignSends.length > 0) {
      console.log('\n📋 All Campaign Email Sends:');
      console.log('='.repeat(100));
      
      const sentEmails = [];
      
      campaignSends.forEach((send, index) => {
        // Find the member that was sent to
        const member = send.schedule?.group?.members?.find(m => m.businessId === send.businessId);
        const email = member?.primaryEmail || 'Unknown';
        const businessName = member?.businessName || 'Unknown';
        
        sentEmails.push({
          email,
          businessName,
          businessId: send.businessId,
          subject: send.schedule?.template?.subject || 'N/A',
          templateName: send.schedule?.template?.name || 'N/A',
          status: send.status,
          sentAt: send.sentAt?.toISOString() || 'N/A',
          sendId: send.id
        });
        
        console.log(`${index + 1}. ${email}`);
        console.log(`   Business: ${businessName} (${send.businessId})`);
        console.log(`   Subject: ${send.schedule?.template?.subject || 'N/A'}`);
        console.log(`   Template: ${send.schedule?.template?.name || 'N/A'}`);
        console.log(`   Status: ${send.status}`);
        console.log(`   Sent: ${send.sentAt?.toISOString() || 'N/A'}`);
        console.log('');
      });
      
      // Get unique emails
      const uniqueEmails = [...new Set(sentEmails.map(send => send.email).filter(email => email !== 'Unknown'))];
      
      console.log(`\n📊 Summary:`);
      console.log(`- Total campaign sends: ${campaignSends.length}`);
      console.log(`- Unique email addresses: ${uniqueEmails.length}`);
      
      // Save to files
      const fs = require('fs');
      
      // JSON file
      const outputData = {
        timestamp: new Date().toISOString(),
        totalSends: campaignSends.length,
        uniqueEmails: uniqueEmails.length,
        sends: sentEmails,
        uniqueEmailList: uniqueEmails
      };
      
      fs.writeFileSync('all-sent-emails.json', JSON.stringify(outputData, null, 2));
      console.log('\n💾 Data saved to all-sent-emails.json');
      
      // CSV file
      const csvContent = [
        'Email,Business Name,Business ID,Subject,Template,Status,Sent At,Send ID',
        ...sentEmails.map(send => `"${send.email}","${send.businessName}","${send.businessId}","${send.subject}","${send.templateName}","${send.status}","${send.sentAt}","${send.sendId}"`)
      ].join('\n');
      
      fs.writeFileSync('all-sent-emails.csv', csvContent);
      console.log('💾 CSV saved to all-sent-emails.csv');
      
      // Simple email list
      const emailList = uniqueEmails.join('\n');
      fs.writeFileSync('all-email-list.txt', emailList);
      console.log('💾 Email list saved to all-email-list.txt');
      
      // Show unique emails
      console.log('\n📧 Unique Email Addresses:');
      uniqueEmails.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
      });
      
    } else {
      console.log('❌ No campaign sends found');
    }
    
    // Also get RSVPs
    console.log('\n📧 RSVP Confirmation Emails:');
    const rsvps = await prisma.rSVP.findMany({
      select: {
        email: true,
        fullName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total RSVPs: ${rsvps.length}`);
    rsvps.forEach((rsvp, index) => {
      console.log(`${index + 1}. ${rsvp.email} (${rsvp.fullName}) - ${rsvp.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error getting all sent emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllSentEmails();

