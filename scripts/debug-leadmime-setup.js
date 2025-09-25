async function debugLeadMineSetup() {
  console.log('🔍 Debugging LeadMine setup...');
  
  console.log('📋 Environment variables:');
  console.log('LEADMINE_API_BASE:', process.env.LEADMINE_API_BASE);
  console.log('LEADMINE_API_KEY:', process.env.LEADMINE_API_KEY ? 'SET (length: ' + process.env.LEADMINE_API_KEY.length + ')' : 'NOT SET');
  
  const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
  const apiKey = process.env.LEADMINE_API_KEY?.trim();
  
  if (!baseUrl || !apiKey) {
    console.log('❌ LeadMine not configured');
    return;
  }
  
  // Test basic connectivity
  console.log('\n🌐 Testing basic connectivity...');
  
  try {
    // Try to get businesses without any filters
    const response = await fetch(`${baseUrl}/api/integration/businesses?limit=5`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Basic request status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Basic response:', {
        dataCount: data.data?.length || 0,
        pagination: data.pagination
      });
      
      if (data.data && data.data.length > 0) {
        console.log('📋 Sample business:', {
          id: data.data[0].id,
          name: data.data[0].name,
          email: data.data[0].contact?.primaryEmail
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Basic request error:', errorText);
    }
  } catch (error) {
    console.log('❌ Basic request failed:', error.message);
  }
  
  // Test with a known business ID
  console.log('\n🔍 Testing with known business ID...');
  
  try {
    const response = await fetch(`${baseUrl}/api/integration/businesses?ids=test-availability-live&limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Known ID request status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Known ID response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Known ID request error:', errorText);
    }
  } catch (error) {
    console.log('❌ Known ID request failed:', error.message);
  }
  
  // Test with createMissing
  console.log('\n🔍 Testing with createMissing...');
  
  try {
    const response = await fetch(`${baseUrl}/api/integration/businesses?ids=test-availability-live&createMissing=1&limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 CreateMissing request status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CreateMissing response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ CreateMissing request error:', errorText);
    }
  } catch (error) {
    console.log('❌ CreateMissing request failed:', error.message);
  }
}

debugLeadMineSetup().catch(console.error);
