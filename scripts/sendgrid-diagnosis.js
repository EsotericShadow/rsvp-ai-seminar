require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not found in environment variables');
  process.exit(1);
}

async function makeSendGridRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function diagnoseSendGridDamage() {
  try {
    console.log('🔍 SENDGRID DAMAGE DIAGNOSIS - COMPREHENSIVE ANALYSIS');
    console.log('='.repeat(70));
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      apiKey: SENDGRID_API_KEY.substring(0, 10) + '...',
      tests: {}
    };

    // 1. Test API Key Validity
    console.log('\n🔑 STEP 1: Testing API Key Validity...');
    try {
      const userResponse = await makeSendGridRequest('/v3/user/account');
      if (userResponse.statusCode === 200) {
        console.log('✅ API Key is valid');
        diagnosis.tests.apiKey = { status: 'valid', data: userResponse.data };
      } else {
        console.log(`❌ API Key issue: ${userResponse.statusCode}`);
        diagnosis.tests.apiKey = { status: 'invalid', statusCode: userResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ API Key test failed: ${error.message}`);
      diagnosis.tests.apiKey = { status: 'error', error: error.message };
    }

    // 2. Check Account Information
    console.log('\n👤 STEP 2: Checking Account Information...');
    try {
      const accountResponse = await makeSendGridRequest('/v3/user/account');
      if (accountResponse.statusCode === 200) {
        console.log('✅ Account information retrieved');
        console.log(`📊 Account Type: ${accountResponse.data.type || 'Unknown'}`);
        console.log(`📊 Reputation: ${accountResponse.data.reputation || 'Unknown'}`);
        diagnosis.tests.account = { status: 'success', data: accountResponse.data };
      } else {
        console.log(`❌ Account info failed: ${accountResponse.statusCode}`);
        diagnosis.tests.account = { status: 'failed', statusCode: accountResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Account check failed: ${error.message}`);
      diagnosis.tests.account = { status: 'error', error: error.message };
    }

    // 3. Check IP Addresses
    console.log('\n🌐 STEP 3: Checking IP Addresses...');
    try {
      const ipResponse = await makeSendGridRequest('/v3/ips');
      if (ipResponse.statusCode === 200) {
        console.log('✅ IP addresses retrieved');
        const ips = ipResponse.data.result || [];
        console.log(`📊 Total IPs: ${ips.length}`);
        
        ips.forEach((ip, index) => {
          console.log(`${index + 1}. ${ip.ip} - ${ip.pool_name || 'No pool'} - ${ip.warmup || 'Not warming up'}`);
        });
        
        diagnosis.tests.ips = { status: 'success', data: ipResponse.data };
      } else {
        console.log(`❌ IP check failed: ${ipResponse.statusCode}`);
        diagnosis.tests.ips = { status: 'failed', statusCode: ipResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ IP check failed: ${error.message}`);
      diagnosis.tests.ips = { status: 'error', error: error.message };
    }

    // 4. Check IP Warmup Status
    console.log('\n🔥 STEP 4: Checking IP Warmup Status...');
    try {
      const warmupResponse = await makeSendGridRequest('/v3/ips/warmup');
      if (warmupResponse.statusCode === 200) {
        console.log('✅ Warmup status retrieved');
        const warmupIps = warmupResponse.data || [];
        console.log(`📊 IPs in warmup: ${warmupIps.length}`);
        
        warmupIps.forEach((ip, index) => {
          console.log(`${index + 1}. ${ip.ip} - ${ip.start_date} - ${ip.status}`);
        });
        
        diagnosis.tests.warmup = { status: 'success', data: warmupResponse.data };
      } else {
        console.log(`❌ Warmup check failed: ${warmupResponse.statusCode}`);
        diagnosis.tests.warmup = { status: 'failed', statusCode: warmupResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Warmup check failed: ${error.message}`);
      diagnosis.tests.warmup = { status: 'error', error: error.message };
    }

    // 5. Check Sender Authentication
    console.log('\n🔐 STEP 5: Checking Sender Authentication...');
    try {
      const authResponse = await makeSendGridRequest('/v3/whitelabel/domains');
      if (authResponse.statusCode === 200) {
        console.log('✅ Domain authentication retrieved');
        const domains = authResponse.data || [];
        console.log(`📊 Authenticated domains: ${domains.length}`);
        
        domains.forEach((domain, index) => {
          console.log(`${index + 1}. ${domain.domain} - ${domain.valid ? 'Valid' : 'Invalid'}`);
        });
        
        diagnosis.tests.authentication = { status: 'success', data: authResponse.data };
      } else {
        console.log(`❌ Authentication check failed: ${authResponse.statusCode}`);
        diagnosis.tests.authentication = { status: 'failed', statusCode: authResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Authentication check failed: ${error.message}`);
      diagnosis.tests.authentication = { status: 'error', error: error.message };
    }

    // 6. Check Suppressions
    console.log('\n🚫 STEP 6: Checking Suppressions...');
    try {
      const suppressionsResponse = await makeSendGridRequest('/v3/suppression/bounces');
      if (suppressionsResponse.statusCode === 200) {
        console.log('✅ Bounces retrieved');
        const bounces = suppressionsResponse.data || [];
        console.log(`📊 Total bounces: ${bounces.length}`);
        
        if (bounces.length > 0) {
          console.log('Recent bounces:');
          bounces.slice(0, 5).forEach((bounce, index) => {
            console.log(`${index + 1}. ${bounce.email} - ${bounce.reason} - ${bounce.created}`);
          });
        }
        
        diagnosis.tests.suppressions = { status: 'success', data: suppressionsResponse.data };
      } else {
        console.log(`❌ Suppressions check failed: ${suppressionsResponse.statusCode}`);
        diagnosis.tests.suppressions = { status: 'failed', statusCode: suppressionsResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Suppressions check failed: ${error.message}`);
      diagnosis.tests.suppressions = { status: 'error', error: error.message };
    }

    // 7. Check Recent Activity
    console.log('\n📊 STEP 7: Checking Recent Activity...');
    try {
      const activityResponse = await makeSendGridRequest('/v3/messages');
      if (activityResponse.statusCode === 200) {
        console.log('✅ Recent activity retrieved');
        const messages = activityResponse.data.messages || [];
        console.log(`📊 Recent messages: ${messages.length}`);
        
        if (messages.length > 0) {
          console.log('Recent messages:');
          messages.slice(0, 5).forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.to_email} - ${msg.status} - ${msg.last_event_time}`);
          });
        }
        
        diagnosis.tests.activity = { status: 'success', data: activityResponse.data };
      } else {
        console.log(`❌ Activity check failed: ${activityResponse.statusCode}`);
        diagnosis.tests.activity = { status: 'failed', statusCode: activityResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Activity check failed: ${error.message}`);
      diagnosis.tests.activity = { status: 'error', error: error.message };
    }

    // 8. Check Stats
    console.log('\n📈 STEP 8: Checking Statistics...');
    try {
      const statsResponse = await makeSendGridRequest('/v3/stats?start_date=2025-09-20&end_date=2025-09-26');
      if (statsResponse.statusCode === 200) {
        console.log('✅ Statistics retrieved');
        const stats = statsResponse.data || [];
        console.log(`📊 Stats entries: ${stats.length}`);
        
        if (stats.length > 0) {
          const latest = stats[stats.length - 1];
          console.log(`📊 Latest stats: ${latest.date}`);
          console.log(`📊 Delivered: ${latest.stats[0]?.delivered || 0}`);
          console.log(`📊 Bounces: ${latest.stats[0]?.bounces || 0}`);
          console.log(`📊 Blocks: ${latest.stats[0]?.blocks || 0}`);
          console.log(`📊 Spam Reports: ${latest.stats[0]?.spam_reports || 0}`);
        }
        
        diagnosis.tests.stats = { status: 'success', data: statsResponse.data };
      } else {
        console.log(`❌ Stats check failed: ${statsResponse.statusCode}`);
        diagnosis.tests.stats = { status: 'failed', statusCode: statsResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Stats check failed: ${error.message}`);
      diagnosis.tests.stats = { status: 'error', error: error.message };
    }

    // Save diagnosis results
    const fs = require('fs');
    fs.writeFileSync('sendgrid-diagnosis.json', JSON.stringify(diagnosis, null, 2));
    console.log('\n💾 Diagnosis results saved to sendgrid-diagnosis.json');

    // Summary
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('='.repeat(50));
    
    const successfulTests = Object.values(diagnosis.tests).filter(test => test.status === 'success').length;
    const totalTests = Object.keys(diagnosis.tests).length;
    
    console.log(`✅ Successful tests: ${successfulTests}/${totalTests}`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 All SendGrid API tests passed!');
    } else {
      console.log('⚠️  Some tests failed - check the detailed results above');
    }

    console.log('\n📁 Files created:');
    console.log('- sendgrid-diagnosis.json (complete diagnosis)');
    
    return diagnosis;

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    throw error;
  }
}

// Run the diagnosis
diagnoseSendGridDamage()
  .then(result => {
    console.log('\n✅ SendGrid diagnosis completed!');
    console.log('Check sendgrid-diagnosis.json for detailed results.');
  })
  .catch(error => {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  });

