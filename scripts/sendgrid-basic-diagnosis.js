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

async function basicSendGridDiagnosis() {
  try {
    console.log('🔍 SENDGRID BASIC DIAGNOSIS - TRIAL ACCOUNT COMPATIBLE');
    console.log('='.repeat(70));
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      apiKey: SENDGRID_API_KEY.substring(0, 10) + '...',
      tests: {}
    };

    // 1. Test API Key with Basic Endpoint
    console.log('\n🔑 STEP 1: Testing API Key with Basic Endpoint...');
    try {
      const userResponse = await makeSendGridRequest('/v3/user/account');
      if (userResponse.statusCode === 200) {
        console.log('✅ API Key is valid');
        console.log(`📊 Account Type: ${userResponse.data.type || 'Unknown'}`);
        console.log(`📊 Reputation: ${userResponse.data.reputation || 'Unknown'}`);
        diagnosis.tests.apiKey = { status: 'valid', data: userResponse.data };
      } else if (userResponse.statusCode === 403) {
        console.log('⚠️  API Key valid but limited permissions (Trial account)');
        diagnosis.tests.apiKey = { status: 'limited', statusCode: userResponse.statusCode };
      } else {
        console.log(`❌ API Key issue: ${userResponse.statusCode}`);
        diagnosis.tests.apiKey = { status: 'invalid', statusCode: userResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ API Key test failed: ${error.message}`);
      diagnosis.tests.apiKey = { status: 'error', error: error.message };
    }

    // 2. Try to Send a Test Email (if permissions allow)
    console.log('\n📧 STEP 2: Testing Email Sending Capability...');
    try {
      const testEmail = {
        personalizations: [{
          to: [{ email: 'test@example.com' }],
          subject: 'SendGrid Test'
        }],
        from: { email: 'test@evergreenwebsolutions.ca' },
        content: [{
          type: 'text/plain',
          value: 'This is a test email to verify SendGrid functionality.'
        }]
      };

      const sendResponse = await makeSendGridRequest('/v3/mail/send', 'POST');
      if (sendResponse.statusCode === 202) {
        console.log('✅ Email sending capability confirmed');
        diagnosis.tests.emailSending = { status: 'success', statusCode: sendResponse.statusCode };
      } else if (sendResponse.statusCode === 403) {
        console.log('⚠️  Email sending blocked (likely trial limitations)');
        diagnosis.tests.emailSending = { status: 'blocked', statusCode: sendResponse.statusCode };
      } else {
        console.log(`❌ Email sending issue: ${sendResponse.statusCode}`);
        diagnosis.tests.emailSending = { status: 'failed', statusCode: sendResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Email sending test failed: ${error.message}`);
      diagnosis.tests.emailSending = { status: 'error', error: error.message };
    }

    // 3. Check Webhook Events (if accessible)
    console.log('\n🔗 STEP 3: Checking Webhook Configuration...');
    try {
      const webhookResponse = await makeSendGridRequest('/v3/user/webhooks/event/settings');
      if (webhookResponse.statusCode === 200) {
        console.log('✅ Webhook settings accessible');
        console.log(`📊 Webhook enabled: ${webhookResponse.data.enabled || 'Unknown'}`);
        diagnosis.tests.webhooks = { status: 'success', data: webhookResponse.data };
      } else if (webhookResponse.statusCode === 403) {
        console.log('⚠️  Webhook settings not accessible (Trial account)');
        diagnosis.tests.webhooks = { status: 'limited', statusCode: webhookResponse.statusCode };
      } else {
        console.log(`❌ Webhook check failed: ${webhookResponse.statusCode}`);
        diagnosis.tests.webhooks = { status: 'failed', statusCode: webhookResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Webhook check failed: ${error.message}`);
      diagnosis.tests.webhooks = { status: 'error', error: error.message };
    }

    // 4. Check Mail Settings (if accessible)
    console.log('\n⚙️  STEP 4: Checking Mail Settings...');
    try {
      const mailSettingsResponse = await makeSendGridRequest('/v3/mail_settings');
      if (mailSettingsResponse.statusCode === 200) {
        console.log('✅ Mail settings accessible');
        const settings = mailSettingsResponse.data.result || [];
        console.log(`📊 Mail settings configured: ${settings.length}`);
        diagnosis.tests.mailSettings = { status: 'success', data: mailSettingsResponse.data };
      } else if (mailSettingsResponse.statusCode === 403) {
        console.log('⚠️  Mail settings not accessible (Trial account)');
        diagnosis.tests.mailSettings = { status: 'limited', statusCode: mailSettingsResponse.statusCode };
      } else {
        console.log(`❌ Mail settings check failed: ${mailSettingsResponse.statusCode}`);
        diagnosis.tests.mailSettings = { status: 'failed', statusCode: mailSettingsResponse.statusCode };
      }
    } catch (error) {
      console.log(`❌ Mail settings check failed: ${error.message}`);
      diagnosis.tests.mailSettings = { status: 'error', error: error.message };
    }

    // 5. Analyze the 403 Errors
    console.log('\n🔍 STEP 5: Analyzing Permission Limitations...');
    const limitedTestsCount = Object.values(diagnosis.tests).filter(test => test.status === 'limited').length;
    const totalTests = Object.keys(diagnosis.tests).length;
    
    if (limitedTestsCount > 0) {
      console.log(`⚠️  ${limitedTestsCount}/${totalTests} tests show limited permissions`);
      console.log('📊 This indicates you are on a Trial account with restricted API access');
      console.log('📊 Trial accounts typically cannot access:');
      console.log('   - IP management endpoints');
      console.log('   - Advanced statistics');
      console.log('   - Suppression management');
      console.log('   - Detailed account information');
    }

    // 6. Recommendations based on findings
    console.log('\n💡 RECOMMENDATIONS BASED ON DIAGNOSIS:');
    console.log('='.repeat(50));
    
    if (limitedTestsCount > 0) {
      console.log('🚨 CRITICAL FINDINGS:');
      console.log('1. You are on a SendGrid Trial account');
      console.log('2. Trial accounts have severe limitations for deliverability management');
      console.log('3. You cannot access IP management or reputation tools');
      console.log('4. This explains the deliverability issues you are experiencing');
      
      console.log('\n🎯 IMMEDIATE ACTIONS REQUIRED:');
      console.log('1. UPGRADE TO PRO PLAN IMMEDIATELY');
      console.log('   - Trial accounts share IP pools with other users');
      console.log('   - No control over IP reputation');
      console.log('   - Limited deliverability tools');
      
      console.log('2. GET DEDICATED IP ADDRESSES');
      console.log('   - Only available on Pro plan and above');
      console.log('   - Full control over IP reputation');
      console.log('   - Better deliverability');
      
      console.log('3. SET UP PROPER AUTHENTICATION');
      console.log('   - SPF, DKIM, DMARC records');
      console.log('   - Domain authentication');
      console.log('   - Sender reputation protection');
    }

    // Save diagnosis results
    const fs = require('fs');
    fs.writeFileSync('sendgrid-basic-diagnosis.json', JSON.stringify(diagnosis, null, 2));
    console.log('\n💾 Basic diagnosis results saved to sendgrid-basic-diagnosis.json');

    // Summary
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('='.repeat(50));
    
    const successfulTests = Object.values(diagnosis.tests).filter(test => test.status === 'success').length;
    const limitedTestsCount2 = Object.values(diagnosis.tests).filter(test => test.status === 'limited').length;
    
    console.log(`✅ Successful tests: ${successfulTests}`);
    console.log(`⚠️  Limited tests: ${limitedTestsCount2}`);
    console.log(`❌ Failed tests: ${totalTests - successfulTests - limitedTestsCount2}`);
    
    if (limitedTestsCount2 > 0) {
      console.log('\n🚨 ROOT CAUSE IDENTIFIED:');
      console.log('You are on a SendGrid Trial account with severe limitations!');
      console.log('This is the primary cause of your deliverability issues.');
    }

    console.log('\n📁 Files created:');
    console.log('- sendgrid-basic-diagnosis.json (basic diagnosis)');
    
    return diagnosis;

  } catch (error) {
    console.error('❌ Basic diagnosis failed:', error);
    throw error;
  }
}

// Run the basic diagnosis
basicSendGridDiagnosis()
  .then(result => {
    console.log('\n✅ SendGrid basic diagnosis completed!');
    console.log('Check sendgrid-basic-diagnosis.json for detailed results.');
  })
  .catch(error => {
    console.error('❌ Basic diagnosis failed:', error);
    process.exit(1);
  });
