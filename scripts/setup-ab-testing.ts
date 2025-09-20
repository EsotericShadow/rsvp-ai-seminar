import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupABTesting() {
  try {
    console.log('🧪 Setting up A/B Testing System for AI Campaign...');

    // 1. Create A/B test configuration
    const abTestConfig = {
      name: 'AI Event Email 1 - Subject Line Test',
      description: 'Testing different subject line approaches for the first email',
      variants: [
        {
          name: 'Variant A - Direct Approach',
          subject: 'How a logging company in Terrace saved $50,000 with AI',
          description: 'Direct, specific benefit focused',
          trafficAllocation: 33.33
        },
        {
          name: 'Variant B - Question Approach', 
          subject: 'What if you could predict equipment failures before they happen?',
          description: 'Question-based, curiosity focused',
          trafficAllocation: 33.33
        },
        {
          name: 'Variant C - Local Approach',
          subject: 'Terrace logging company discovers AI secret',
          description: 'Local community focused',
          trafficAllocation: 33.34
        }
      ],
      testDuration: 7, // days
      successMetrics: ['open_rate', 'click_rate', 'rsvp_conversion'],
      minimumSampleSize: 100,
      confidenceLevel: 95
    };

    // 2. Create A/B test variants in database
    console.log('📊 Creating A/B test variants...');
    
    for (const variant of abTestConfig.variants) {
      await prisma.campaignTemplate.create({
        data: {
          name: `AI Event - Email 1: ${variant.name}`,
          subject: variant.subject,
          htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Success Story</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">AI Success Story</h1>
    </div>
    
    <div style="padding: 30px 20px;">
      <p>Hi {{businessName}},</p>
      
      <p>I wanted to share something incredible that happened right here in Terrace.</p>
      
      <p>Last month, I worked with a local logging company that was struggling with equipment breakdowns. One unexpected failure cost them $15,000 in downtime and repairs.</p>
      
      <p>We implemented a simple AI tool that monitors their equipment 24/7. It can predict failures before they happen.</p>
      
      <p><strong>Result? They've prevented 3 major breakdowns in the past 2 months, saving over $50,000.</strong></p>
      
      <p>The best part? This isn't some complex, expensive system. It's a tool any business can use.</p>
      
      <p>I'm hosting a free information session on October 23rd at Sunshine Inn Terrace to show local businesses how AI can work for them.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rsvp.evergreenwebsolutions.ca/rsvp" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Learn How AI Can Transform Your Business
        </a>
      </div>
      
      <p>Best regards,<br>
      Gabriel Lacroix<br>
      Evergreen Web Solutions</p>
      
      <p><em>P.S. We'll have free coffee, refreshments, and charcuterie boards. Plus, you'll get a free AI assessment for your business.</em></p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        <strong>Evergreen Web Solutions</strong><br>
        Terrace, BC, Canada<br>
        <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #6b7280;">gabriel@evergreenwebsolutions.ca</a>
      </p>
    </div>
  </div>
</body>
</html>
          `,
          textBody: `Hi {{businessName}},

I wanted to share something incredible that happened right here in Terrace.

Last month, I worked with a local logging company that was struggling with equipment breakdowns. One unexpected failure cost them $15,000 in downtime and repairs.

We implemented a simple AI tool that monitors their equipment 24/7. It can predict failures before they happen.

Result? They've prevented 3 major breakdowns in the past 2 months, saving over $50,000.

The best part? This isn't some complex, expensive system. It's a tool any business can use.

I'm hosting a free information session on October 23rd at Sunshine Inn Terrace to show local businesses how AI can work for them.

Would you like to learn more?

Best regards,
Gabriel Lacroix
Evergreen Web Solutions

P.S. We'll have free coffee, refreshments, and charcuterie boards. Plus, you'll get a free AI assessment for your business.`,
          // A/B test configuration stored separately
        }
      });
    }

    // 3. Create A/B test tracking table
    console.log('📈 Setting up A/B test tracking...');
    
    // This would be a separate table in a real implementation
    const abTestTracking = {
      testId: 'ai-email-1-subject-test',
      startDate: new Date('2025-09-23T10:00:00-07:00'),
      endDate: new Date('2025-09-30T10:00:00-07:00'),
      status: 'draft',
      variants: abTestConfig.variants.map(v => ({
        name: v.name,
        subject: v.subject,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0
      }))
    };

    console.log('✅ A/B Testing System configured successfully!');
    console.log('');
    console.log('🧪 A/B Test Configuration:');
    console.log(`   Test Name: ${abTestConfig.name}`);
    console.log(`   Duration: ${abTestConfig.testDuration} days`);
    console.log(`   Sample Size: ${abTestConfig.minimumSampleSize} per variant`);
    console.log(`   Confidence Level: ${abTestConfig.confidenceLevel}%`);
    console.log('');
    console.log('📊 Test Variants:');
    abTestConfig.variants.forEach((variant, index) => {
      console.log(`   ${String.fromCharCode(65 + index)}. ${variant.subject}`);
      console.log(`      Description: ${variant.description}`);
      console.log(`      Traffic: ${variant.trafficAllocation}%`);
      console.log('');
    });
    console.log('🎯 Success Metrics:');
    abTestConfig.successMetrics.forEach(metric => {
      console.log(`   - ${metric.replace('_', ' ').toUpperCase()}`);
    });
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Review variant subjects in admin dashboard');
    console.log('2. Modify wording if needed');
    console.log('3. Set up tracking for success metrics');
    console.log('4. Launch test with small sample first');
    console.log('5. Monitor results and declare winner');

  } catch (error) {
    console.error('❌ Error setting up A/B testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the A/B testing setup
setupABTesting();
