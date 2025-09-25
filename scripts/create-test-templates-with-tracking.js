const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTestTemplatesWithTracking() {
  console.log('🔍 Creating test email templates with RSVP tracking links...');
  
  // Clean up existing test templates and schedules
  await prisma.campaignSchedule.deleteMany({
    where: {
      template: {
        meta: {
          path: ['testTemplate'],
          equals: true
        }
      }
    }
  });
  
  await prisma.campaignTemplate.deleteMany({
    where: {
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    }
  });
  
  console.log('🧹 Cleaned up existing test templates');
  
  const templates = [
    {
      name: 'Test Welcome Email',
      subject: 'Welcome to Our Test Campaign!',
      content: `
        <h1>Welcome to Our Test Campaign!</h1>
        <p>Hello {{businessName}},</p>
        <p>This is a test email to verify our campaign system is working correctly.</p>
        <p>If you're receiving this, our email automation is functioning properly!</p>
        <p>Click the link below to RSVP:</p>
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Now</a></p>
        <p>Best regards,<br>The Test Team</p>
      `,
      type: 'welcome',
      description: 'Initial welcome email with RSVP tracking link'
    },
    {
      name: 'Test Follow-up Email',
      subject: 'Following Up - Test Campaign',
      content: `
        <h1>Following Up on Our Test Campaign</h1>
        <p>Hello {{businessName}},</p>
        <p>This is a follow-up email in our test campaign sequence.</p>
        <p>We're testing automated email sending over time intervals.</p>
        <p>Please click below to RSVP if you haven't already:</p>
        <p><a href="{{invite_link}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Here</a></p>
        <p>Thank you for participating in our test!</p>
      `,
      type: 'follow-up',
      description: 'Follow-up email with RSVP tracking link'
    },
    {
      name: 'Test Final Email',
      subject: 'Final Test Campaign Email',
      content: `
        <h1>Final Test Campaign Email</h1>
        <p>Hello {{businessName}},</p>
        <p>This is the final email in our test campaign sequence.</p>
        <p>We've successfully tested sending emails over 15 minutes!</p>
        <p>Last chance to RSVP:</p>
        <p><a href="{{invite_link}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Final RSVP</a></p>
        <p>Thank you for helping us test our email automation system!</p>
      `,
      type: 'final',
      description: 'Final email in test sequence with RSVP tracking link'
    }
  ];
  
  console.log('📧 Creating test email templates...');
  
  for (const template of templates) {
    const newTemplate = await prisma.campaignTemplate.create({
      data: {
        name: template.name,
        subject: template.subject,
        htmlBody: template.content,
        textBody: template.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        meta: {
          testTemplate: true,
          createdFor: 'campaign-testing',
          type: template.type,
          description: template.description,
          hasTrackingLink: true
        }
      }
    });
    
    console.log(`✅ Created template: ${newTemplate.name}`);
    console.log(`   Subject: ${newTemplate.subject}`);
    console.log(`   Type: ${template.type}`);
  }
  
  console.log('\n🎉 Test email templates created successfully!');
  console.log('🔗 All templates include RSVP tracking links using {{invite_link}}');
  
  // Show created templates
  const createdTemplates = await prisma.campaignTemplate.findMany({
    where: {
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    },
    select: {
      id: true,
      name: true,
      subject: true
    }
  });
  
  console.log('\n📋 Created templates:');
  createdTemplates.forEach((template, index) => {
    console.log(`   ${index + 1}. ${template.name} (ID: ${template.id})`);
    console.log(`      Subject: ${template.subject}`);
  });
}

createTestTemplatesWithTracking()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
