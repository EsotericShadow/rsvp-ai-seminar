import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resubscribeForTesting() {
  try {
    console.log('🔄 Re-subscribing greenalderson@gmail.com for testing...');
    
    const result = await prisma.audienceMember.updateMany({
      where: { primaryEmail: 'greenalderson@gmail.com' },
      data: { unsubscribed: false }
    });
    
    if (result.count > 0) {
      console.log('✅ Successfully re-subscribed greenalderson@gmail.com');
      console.log('📧 You can now test emails to this address');
      console.log('');
      console.log('🧪 Test sending an email:');
      console.log('curl -X POST http://localhost:3000/api/test-sendgrid \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"email": "greenalderson@gmail.com", "name": "Green Test"}\'');
    } else {
      console.log('❌ No member found with email: greenalderson@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error re-subscribing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resubscribeForTesting();
