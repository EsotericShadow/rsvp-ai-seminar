#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testSingleEmail() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Testing Single Email Generation ===');
    
    // Find greenalderson
    const member = await prisma.audienceMember.findFirst({
      where: {
        primaryEmail: 'greenalderson@gmail.com'
      }
    });
    
    if (!member) {
      console.log('Member not found!');
      return;
    }
    
    console.log('Found member:', member.primaryEmail);
    
    // Get the first template
    const template = await prisma.campaignTemplate.findFirst({
      where: {
        name: 'AI Event - Email 1 - Variant A'
      }
    });
    
    if (!template) {
      console.log('Template not found!');
      return;
    }
    
    console.log('Found template:', template.name);
    console.log('Template subject:', template.subject);
    
    // Get the group
    const group = await prisma.audienceGroup.findUnique({
      where: { id: member.groupId },
      include: {
        members: {
          where: { businessId: member.businessId }
        }
      }
    });
    
    console.log('Found group with members:', group.members.length);
    
    // Create a single EmailJob
    const emailJob = await prisma.emailJob.create({
      data: {
        templateId: template.id,
        groupId: group.id,
        campaignId: 'test-campaign',
        recipientEmail: member.primaryEmail,
        recipientId: member.businessId, // This is crucial!
        status: 'scheduled',
        sendAt: new Date(Date.now() + 60000), // 1 minute from now
        meta: {
          recipientName: member.businessName || 'Green Alderson',
          businessId: member.businessId,
          inviteToken: member.inviteToken
        }
      }
    });
    
    console.log('Created EmailJob:', emailJob.id);
    console.log('Recipient ID:', emailJob.recipientId);
    
    // Now test the email sender
    console.log('\n=== Testing Email Sender ===');
    const { sendCampaignEmail } = require('./src/lib/email-sender');
    
    try {
      await sendCampaignEmail(emailJob.id);
      console.log('✅ Email sent successfully!');
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      console.error('Full error:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSingleEmail();
