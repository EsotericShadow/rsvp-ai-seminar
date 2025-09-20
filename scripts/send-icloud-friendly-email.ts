import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendiCloudFriendlyEmail() {
  try {
    console.log('📧 Sending iCloud-friendly test email...');

    // Send a very simple, personal email that's less likely to trigger spam filters
    const response = await fetch('http://localhost:3000/api/test-sendgrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'gabriel.lacroix94@icloud.com',
        name: 'Gabriel'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ iCloud-friendly email sent successfully');
      console.log(`📧 Message ID: ${result.messageId}`);
      
      console.log('\n🎯 Next Steps for iCloud:');
      console.log('1. Check your iCloud email inbox');
      console.log('2. If it\'s still in junk:');
      console.log('   - Move it to inbox');
      console.log('   - Mark as "Not Junk"');
      console.log('   - Add gabriel@evergreenwebsolutions.ca to your contacts');
      console.log('3. Wait 10-15 minutes for reputation to improve');
      console.log('4. Test sending another email');
      
      console.log('\n💡 iCloud Spam Filter Tips:');
      console.log('- iCloud is very strict with new domains');
      console.log('- Adding the sender to contacts helps significantly');
      console.log('- Consistent sending builds reputation over time');
      console.log('- Personal, simple emails work better than marketing emails');
      
    } else {
      console.log('❌ Failed to send email:', result.error);
    }

  } catch (error) {
    console.error('❌ Error sending iCloud-friendly email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
sendiCloudFriendlyEmail();
