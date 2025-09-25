const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testTemplates = [
  {
    name: 'Test Welcome Email',
    subject: 'Welcome to Our Test Campaign!',
    content: `
      <h1>Welcome to Our Test Campaign!</h1>
      <p>Hello {{businessName}},</p>
      <p>This is a test email to verify our campaign system is working correctly.</p>
      <p>If you're receiving this, our email automation is functioning properly!</p>
      <p>Best regards,<br>The Test Team</p>
    `,
    type: 'welcome'
  },
  {
    name: 'Test Follow-up Email',
    subject: 'Follow-up: How is everything going?',
    content: `
      <h1>Follow-up Test Email</h1>
      <p>Hi {{businessName}},</p>
      <p>This is our second test email in the automated sequence.</p>
      <p>We're testing the timing and delivery of our campaign system.</p>
      <p>Thank you for helping us test!</p>
      <p>Best regards,<br>The Test Team</p>
    `,
    type: 'followup'
  },
  {
    name: 'Test Final Email',
    subject: 'Final Test Email - Campaign Complete!',
    content: `
      <h1>Final Test Email</h1>
      <p>Hello {{businessName}},</p>
      <p>This is our final test email in the automated sequence.</p>
      <p>If you received all three emails at the correct intervals, our campaign system is working perfectly!</p>
      <p>Thank you for participating in our test.</p>
      <p>Best regards,<br>The Test Team</p>
    `,
    type: 'final'
  }
];

async function createTestTemplates() {
  try {
    console.log('🚀 Creating test email templates...');
    
    for (const template of testTemplates) {
      // Check if already exists
      const existing = await prisma.campaignTemplate.findFirst({
        where: { name: template.name }
      });
      
      if (existing) {
        console.log(`⚠️  Template "${template.name}" already exists, skipping...`);
        continue;
      }
      
      // Create template
      const newTemplate = await prisma.campaignTemplate.create({
        data: {
          name: template.name,
          subject: template.subject,
          htmlBody: template.content,
          textBody: template.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          meta: {
            testTemplate: true,
            createdFor: 'campaign-testing',
            type: template.type
          }
        }
      });
      
      console.log(`✅ Created template: "${template.name}"`);
    }
    
    console.log('🎉 Test templates created successfully!');
    
    // Show current count
    const totalTemplates = await prisma.campaignTemplate.count();
    console.log(`📊 Total templates: ${totalTemplates}`);
    
  } catch (error) {
    console.error('❌ Error creating test templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTemplates();
