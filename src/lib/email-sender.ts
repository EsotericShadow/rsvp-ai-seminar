import sgMail from '@sendgrid/mail';
import prisma from '@/lib/prisma';
import { inviteLinkFromToken } from './campaigns';
import { postLeadMineEvent } from './leadMine';
import { generateEmailHTML, generateEmailText } from './email-template';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendCampaignEmail(jobId: string) {
  try {
    // Get the email job with related data
    const job = await prisma.emailJob.findUnique({
      where: { id: jobId },
      include: {
        events: true,
      },
    });

    if (!job) {
      throw new Error(`Email job ${jobId} not found`);
    }

    if (!job.recipientId) {
      throw new Error(`Email job ${jobId} missing recipientId`);
    }

    // Get template and group info directly from EmailJob
    const template = await prisma.campaignTemplate.findUnique({
      where: { id: job.templateId }
    });

    if (!template) {
      throw new Error(`Template ${job.templateId} not found`);
    }

    const group = await prisma.audienceGroup.findUnique({
      where: { id: job.groupId },
      include: {
        members: {
          where: { businessId: job.recipientId },
        },
      },
    });

    if (!group) {
      throw new Error(`Group ${job.groupId} not found`);
    }

    const member = group.members[0];
    if (!member || !member.inviteToken) {
      throw new Error(`Member or invite token not found for job ${jobId}`);
    }

    // Prepare template context
    const context = {
      business_name: member.businessName || 'Valued Customer',
      business_id: member.businessId,
      invite_link: inviteLinkFromToken(member.inviteToken),
      inviteToken: member.inviteToken,
    };

    // Extract content from template (assume it's stored as plain content, not full HTML)
    const templateContent = template.htmlBody;
    
    // Replace placeholders in content
    const processedContent = templateContent
      .replace(/\{\{\s*business_name\s*\}\}/g, context.business_name)
      .replace(/\{\{\s*business_id\s*\}\}/g, context.business_id)
      .replace(/\{\{\s*invite_link\s*\}\}/g, context.invite_link);

    // Generate HTML and text using global template
    const html = await generateEmailHTML({
      subject: template.subject,
      greeting: 'Hello!',
      body: processedContent,
      ctaText: 'View details & RSVP',
      ctaLink: context.invite_link,
      inviteToken: member.inviteToken,
      businessName: context.business_name,
      businessId: context.business_id,
    });

    const text = generateEmailText({
      greeting: 'Hello!',
      body: template.textBody || processedContent.replace(/<[^>]*>/g, ''),
      ctaText: 'View details & RSVP',
      ctaLink: context.invite_link,
    });

    // Send email via SendGrid
    const emailResponse = await sgMail.send({
      from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
      to: job.recipientEmail,
      subject: template.subject.replace(/\{\{\s*business_name\s*\}\}/g, context.business_name),
      html: html,
      text: text,
    });

    if (!emailResponse) {
      throw new Error('SendGrid error: No response received');
    }

    // Create CampaignSend record
    await prisma.campaignSend.create({
      data: {
        scheduleId: job.scheduleId,
        groupId: job.groupId,
        templateId: job.templateId,
        businessId: member.businessId,
        businessName: member.businessName,
        email: job.recipientEmail,
        inviteToken: member.inviteToken,
        inviteLink: context.invite_link,
        resendMessageId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
        status: 'SENT',
        sentAt: new Date(),
        meta: {
          template: {
            subject: template.subject,
            html: html,
            text: text,
            content: processedContent,
          },
          context,
        },
      },
    });

    // Update EmailJob
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        providerMessageId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
        attempts: { increment: 1 },
        error: null,
      },
    });

    // Create success event
    await prisma.emailEvent.create({
      data: {
        jobId,
        type: 'sent',
        meta: {
          providerMessageId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
          sendgridId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
        },
      },
    });

    // Send event to LeadMine
    try {
      await postLeadMineEvent({
        token: member.inviteToken,
        businessId: member.businessId,
        type: 'email_sent',
        meta: {
          campaignId: job.campaignId,
          scheduleId: job.scheduleId,
          templateId: job.templateId,
          email: job.recipientEmail,
          subject: template.subject,
          messageId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
          sentAt: new Date().toISOString(),
          inviteToken: member.inviteToken,
        },
      });
    } catch (leadMineError) {
      console.error('LeadMine email_sent event failed:', leadMineError);
      // Don't fail the email send if LeadMine fails
    }

    return {
      success: true,
      messageId: (emailResponse as any)?.[0]?.headers?.['x-message-id'] || (emailResponse as any)?.[0]?.messageId || 'sendgrid-sent',
      businessId: member.businessId,
      businessName: member.businessName,
    };

  } catch (error) {
    console.error(`Failed to send email for job ${jobId}:`, error);

    // Update EmailJob with error
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        attempts: { increment: 1 },
        error: error instanceof Error ? error.message : String(error),
      },
    });

    // Create failure event
    await prisma.emailEvent.create({
      data: {
        jobId,
        type: 'failed',
        meta: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      },
    });

    throw error;
  }
}
