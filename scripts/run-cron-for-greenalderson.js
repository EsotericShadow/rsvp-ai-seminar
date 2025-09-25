#!/usr/bin/env node

const fetch = require('node-fetch');

async function runCronJob() {
  try {
    console.log('=== Running Cron Job for greenalderson@gmail.com ===');
    
    // Call the cron endpoint
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/admin/campaign/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need the actual cron secret
        // For now, let's try without it to see what happens
      }
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Cron job executed successfully!');
    } else {
      console.log('❌ Cron job failed');
    }
    
  } catch (error) {
    console.error('Error running cron job:', error);
  }
}

runCronJob();
