async function testSimpleProductionEmail() {
  console.log('🔍 Testing simple email send in production...');
  
  const cronSecret = 'REDACTED_CREDENTIAL';
  const mainAppUrl = 'https://rsvp.evergreenwebsolutions.ca';
  
  try {
    // First, let's test sending a simple email with minimal data
    console.log('📧 Testing simple email send...');
    
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret
      },
      body: JSON.stringify({
        templateId: 'cmfztbs290006ruo2b2nwoycu', // Use a known template ID
        groupId: 'cmfztbs290005ruo2b2nwoycu', // Use a known group ID
        limit: 1,
        previewOnly: true // Start with preview to avoid actual sending
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Simple email response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Simple email failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
    // Now test with actual sending
    console.log('\n📤 Testing actual email send...');
    
    const sendResponse = await fetch(`${mainAppUrl}/api/admin/campaign/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret
      },
      body: JSON.stringify({
        templateId: 'cmfztbs290006ruo2b2nwoycu',
        groupId: 'cmfztbs290005ruo2b2nwoycu',
        limit: 1,
        previewOnly: false
      })
    });
    
    if (sendResponse.ok) {
      const sendResult = await sendResponse.json();
      console.log('✅ Actual send response:', JSON.stringify(sendResult, null, 2));
    } else {
      console.log('❌ Actual send failed:', sendResponse.status);
      const errorText = await sendResponse.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Error testing production email:', error.message);
  }
}

testSimpleProductionEmail()
  .catch(console.error);

