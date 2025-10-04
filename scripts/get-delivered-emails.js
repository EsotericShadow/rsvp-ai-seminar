require('dotenv').config({ path: '.env.local' });

async function getDeliveredEmails() {
  try {
    console.log('📧 Fetching delivered emails from SendGrid...');
    
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not found in environment variables');
      return;
    }

    // Try different SendGrid endpoints
    const endpoints = [
      'https://api.sendgrid.com/v3/messages',
      'https://api.sendgrid.com/v3/activity',
      'https://api.sendgrid.com/v3/stats'
    ];
    
    console.log('🔑 Using API Key:', SENDGRID_API_KEY.substring(0, 10) + '...');
    
    // Try the messages endpoint first
    const url = 'https://api.sendgrid.com/v3/messages';
    
    // Query parameters for delivered emails
    const params = new URLSearchParams({
      query: 'status="delivered"',
      limit: '1000'
    });
    
    console.log('🔗 Trying API URL:', `${url}?${params}`);

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SendGrid API error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('📊 Total delivered emails found:', data.messages?.length || 0);
    
    if (data.messages && data.messages.length > 0) {
      console.log('\n📋 Delivered Emails:');
      console.log('='.repeat(80));
      
      const deliveredEmails = [];
      
      data.messages.forEach((message, index) => {
        const email = message.to_email;
        const subject = message.subject;
        const deliveredAt = message.last_event_time;
        const messageId = message.msg_id;
        
        deliveredEmails.push({
          email,
          subject,
          deliveredAt,
          messageId
        });
        
        console.log(`${index + 1}. ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Delivered: ${deliveredAt}`);
        console.log(`   Message ID: ${messageId}`);
        console.log('');
      });
      
      // Create a unique list of email addresses
      const uniqueEmails = [...new Set(deliveredEmails.map(msg => msg.email))];
      console.log(`\n📊 Summary:`);
      console.log(`- Total delivered messages: ${deliveredEmails.length}`);
      console.log(`- Unique email addresses: ${uniqueEmails.length}`);
      
      // Save to file
      const fs = require('fs');
      const outputData = {
        timestamp: new Date().toISOString(),
        totalMessages: deliveredEmails.length,
        uniqueEmails: uniqueEmails.length,
        emails: deliveredEmails,
        uniqueEmailList: uniqueEmails
      };
      
      fs.writeFileSync('delivered-emails.json', JSON.stringify(outputData, null, 2));
      console.log('\n💾 Data saved to delivered-emails.json');
      
      // Also create a simple CSV
      const csvContent = [
        'Email,Subject,Delivered At,Message ID',
        ...deliveredEmails.map(msg => `"${msg.email}","${msg.subject}","${msg.deliveredAt}","${msg.messageId}"`)
      ].join('\n');
      
      fs.writeFileSync('delivered-emails.csv', csvContent);
      console.log('💾 CSV saved to delivered-emails.csv');
      
    } else {
      console.log('❌ No delivered emails found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching delivered emails:', error);
  }
}

getDeliveredEmails();
