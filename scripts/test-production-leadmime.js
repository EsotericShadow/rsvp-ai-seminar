async function testProductionLeadMine() {
  console.log('🔍 Testing production LeadMine connection...');
  
  // Try to get the environment variables from the production RSVP app
  console.log('📡 Checking production RSVP app environment...');
  
  try {
    // Check if we can access the production app's environment
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/ping');
    console.log('📡 RSVP app ping status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ RSVP app response:', data);
    }
  } catch (error) {
    console.log('❌ RSVP app ping failed:', error.message);
  }
  
  // Try different possible LeadMine URLs
  const possibleUrls = [
    'https://lead-mine.vercel.app',
    'https://leadmine.vercel.app', 
    'https://lead-mine-git-main-gabriellacroixs-projects.vercel.app',
    'https://leadmine.evergreenwebsolutions.ca'
  ];
  
  for (const url of possibleUrls) {
    console.log(`\n🔍 Testing LeadMine at: ${url}`);
    
    try {
      const response = await fetch(`${url}/api/integration/businesses?limit=1`, {
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('   ✅ Endpoint exists (401 Unauthorized - expected)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found');
      } else {
        console.log('   ❓ Unexpected status');
      }
      
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  // Try to find the LeadMine URL from the RSVP app's environment
  console.log('\n🔍 Checking RSVP app for LeadMine configuration...');
  
  try {
    // This might not work, but let's try to see if there are any clues
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/admin/campaign/dashboard');
    console.log('📡 Dashboard status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Dashboard exists (401 - expected without auth)');
    }
  } catch (error) {
    console.log('❌ Dashboard check failed:', error.message);
  }
}

testProductionLeadMine().catch(console.error);
