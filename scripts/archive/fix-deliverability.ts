import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

async function fixDeliverability() {
  try {
    console.log('🔧 Fixing email deliverability issues...');

    // 1. Send a simple, clean email to test deliverability
    console.log('📧 Sending clean test email...');
    
    const msg = {
      to: 'gabriel.lacroix94@icloud.com',
      from: {
        email: 'gabriel@evergreenwebsolutions.ca',
        name: 'Gabriel Lacroix'
      },
      subject: 'Test Email - Please Move to Inbox',
      text: `Hi Gabriel,

This is a clean test email to check deliverability.

Please move this email to your inbox and mark it as "Not Spam" if it appears in your junk folder.

This will help improve the sender reputation for evergreenwebsolutions.ca.

Best regards,
Gabriel Lacroix
Evergreen Web Solutions`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email - Please Move to Inbox</h2>
          
          <p>Hi Gabriel,</p>
          
          <p>This is a clean test email to check deliverability.</p>
          
          <p><strong>Important:</strong> Please move this email to your inbox and mark it as "Not Spam" if it appears in your junk folder.</p>
          
          <p>This will help improve the sender reputation for <strong>evergreenwebsolutions.ca</strong>.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Gabriel Lacroix<br>
            Evergreen Web Solutions
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('✅ Clean test email sent successfully');

    // 2. Create a resubscribe script for testing
    console.log('🔄 Creating resubscribe script for testing...');
    
    const resubscribeScript = `import { PrismaClient } from '@prisma/client';

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
    } else {
      console.log('❌ No member found with email: greenalderson@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error re-subscribing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resubscribeForTesting();`;

    require('fs').writeFileSync('scripts/resubscribe-for-testing.ts', resubscribeScript);
    console.log('✅ Resubscribe script created');

    console.log('\\n🎯 Next Steps:');
    console.log('1. Check your email inbox for the clean test email');
    console.log('2. If it\'s in junk, move it to inbox and mark as "Not Spam"');
    console.log('3. Wait 10-15 minutes for reputation to improve');
    console.log('4. Test sending another email');
    console.log('5. To re-subscribe greenalderson@gmail.com for testing:');
    console.log('   npx tsx scripts/resubscribe-for-testing.ts');

  } catch (error) {
    console.error('❌ Error fixing deliverability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDeliverability();
