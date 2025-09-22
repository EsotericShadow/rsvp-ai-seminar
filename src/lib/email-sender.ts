import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { inviteLinkFromToken } from './campaigns';
import { postLeadMineEvent } from './leadMine';
import { generateEmailHTML, generateEmailText } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get campaign and schedule info
    const campaign = await prisma.campaign.findUnique({
      where: { id: job.campaignId },
      include: {
        schedules: {
          include: {
            template: true,
            group: {
              include: {
                members: {
                  where: { businessId: job.recipientId },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${job.campaignId} not found`);
    }

    // Find the schedule for this email
    const schedule = (campaign.schedules || []).find(s => 
      s.group.members.some(m => m.businessId === job.recipientId)
    );

    if (!schedule) {
      throw new Error(`No schedule found for job ${jobId}`);
    }

    const member = schedule.group.members[0];
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
    const templateContent = schedule.template.htmlBody;
    
    // Replace placeholders in content
    const processedContent = templateContent
      .replace(/\{\{\s*business_name\s*\}\}/g, context.business_name)
      .replace(/\{\{\s*business_id\s*\}\}/g, context.business_id)
      .replace(/\{\{\s*invite_link\s*\}\}/g, context.invite_link);

    // Generate HTML and text using global template
    const html = await generateEmailHTML({
      subject: schedule.template.subject,
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
      body: schedule.template.textBody || processedContent.replace(/<[^>]*>/g, ''),
      ctaText: 'View details & RSVP',
      ctaLink: context.invite_link,
    });

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
      to: [job.recipientEmail],
      subject: schedule.template.subject.replace(/\{\{\s*business_name\s*\}\}/g, context.business_name),
      html: html,
      text: text,
    });

    if (emailResponse.error) {
      throw new Error(`Resend error: ${emailResponse.error.message}`);
    }

    // Create CampaignSend record
    await prisma.campaignSend.create({
      data: {
        scheduleId: schedule.id,
        groupId: schedule.groupId,
        templateId: schedule.templateId,
        businessId: member.businessId,
        businessName: member.businessName,
        email: job.recipientEmail,
        inviteToken: member.inviteToken,
        inviteLink: context.invite_link,
        resendMessageId: emailResponse.data?.id,
        status: 'SENT',
        sentAt: new Date(),
        meta: {
          template: {
            subject: schedule.template.subject,
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
        providerMessageId: emailResponse.data?.id,
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
          providerMessageId: emailResponse.data?.id,
          resendId: emailResponse.data?.id,
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
          scheduleId: schedule.id,
          templateId: schedule.templateId,
          email: job.recipientEmail,
          subject: schedule.template.subject,
          messageId: emailResponse.data?.id,
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
      messageId: emailResponse.data?.id,
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
