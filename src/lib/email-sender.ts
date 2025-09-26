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

    // Get global template settings directly from database
    let globalSettings: any = {};
    try {
      const settings = await prisma.globalTemplateSettings.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      if (settings) {
        globalSettings = settings;
      }
    } catch (error) {
      console.error('Failed to fetch global template settings:', error);
    }

    // Generate HTML using individual template fields + global template + global settings
    const html = await generateEmailHTML({
      subject: template.subject,
      // Individual template variables from the database
      greeting_title: template.greeting_title || '',
      greeting_message: template.greeting_message || '',
      signature_name: template.signature_name || 'Gabriel Lacroix',
      signature_title: template.signature_title || 'AI Solutions Specialist',
      signature_company: template.signature_company || 'Evergreen Web Solutions',
      signature_location: template.signature_location || 'Terrace, BC',
      main_content_title: template.main_content_title || '',
      ctaText: template.button_text || 'View details & RSVP',
      additional_info_title: template.additional_info_title || '',
      additional_info_body: template.additional_info_body || '',
      closing_title: template.closing_title || '',
      closing_message: template.closing_message || '',
      // Use main_content_body from template, not processedContent
      body: template.main_content_body || processedContent,
      ctaLink: context.invite_link,
      inviteToken: member.inviteToken,
      businessName: context.business_name,
      businessId: context.business_id,
      // Global template variables from settings
      global_hero_title: globalSettings.global_hero_title || 'Welcome to Evergreen AI',
      global_hero_message: globalSettings.global_hero_message || 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
      global_signature_name: globalSettings.global_signature_name || 'Gabriel Lacroix',
      global_signature_title: globalSettings.global_signature_title || 'AI Solutions Specialist',
      global_signature_company: globalSettings.global_signature_company || 'Evergreen Web Solutions',
      global_signature_location: globalSettings.global_signature_location || 'Terrace, BC',
      global_event_title: globalSettings.global_event_title || 'Event Details',
      global_event_date: globalSettings.global_event_date || 'October 23rd, 2025',
      global_event_time: globalSettings.global_event_time || '6:00 PM - 8:00 PM',
      global_event_location: globalSettings.global_event_location || 'Terrace, BC',
      global_event_cost: globalSettings.global_event_cost || 'Free',
      global_event_includes: globalSettings.global_event_includes || 'Coffee, refreshments, networking, and actionable AI insights',
    });

    const text = generateEmailText({
      greeting: template.greeting_message || 'Hello!',
      body: template.textBody || processedContent.replace(/<[^>]*>/g, ''),
      ctaText: template.button_text || 'View details & RSVP',
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
        scheduleId: job.scheduleId || null,
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
