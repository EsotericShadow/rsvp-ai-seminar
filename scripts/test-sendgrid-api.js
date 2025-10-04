require('dotenv').config({ path: '.env.local' });

async function testSendGridAPI() {
  try {
    console.log('🧪 Testing SendGrid API endpoints...');
    
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not found in environment variables');
      return;
    }

    console.log('🔑 Using API Key:', SENDGRID_API_KEY.substring(0, 10) + '...');

    // Test different endpoints
    const endpoints = [
      {
        name: 'Messages API',
        url: 'https://api.sendgrid.com/v3/messages',
        params: '?query=status="delivered"&limit=10'
      },
      {
        name: 'Activity API',
        url: 'https://api.sendgrid.com/v3/activity',
        params: '?limit=10'
      },
      {
        name: 'Stats API',
        url: 'https://api.sendgrid.com/v3/stats',
        params: '?start_date=2025-09-01&end_date=2025-09-26'
      },
      {
        name: 'Suppression API',
        url: 'https://api.sendgrid.com/v3/suppression/bounces',
        params: ''
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing ${endpoint.name}...`);
      console.log(`URL: ${endpoint.url}${endpoint.params}`);
      
      try {
        const response = await fetch(`${endpoint.url}${endpoint.params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Success! Response keys:`, Object.keys(data));
          if (data.messages) {
            console.log(`📧 Found ${data.messages.length} messages`);
          }
          if (data.stats) {
            console.log(`📊 Found ${data.stats.length} stats entries`);
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing SendGrid API:', error);
  }
}

testSendGridAPI();

