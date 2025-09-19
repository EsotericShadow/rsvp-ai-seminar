import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { fetchLeadMineBusinesses, postLeadMineEvent } from '@/lib/leadMine';
import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fromAddress = process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <team@evergreen.ai>';
const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp-ai-seminar.vercel.app/rsvp';
const cronSecret = process.env.CAMPAIGN_CRON_SECRET?.trim();
const resendKey = process.env.RESEND_API_KEY?.trim();

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function hasValidAdminSession() {
  const adminConfig = getAdminConfig();
  if (!adminConfig) return false;

  const token = cookies().get(getSessionCookieName())?.value;
  if (!token) return false;

  const session = verifySessionToken(token, adminConfig.sessionSecret);
  return Boolean(session);
}

function authorizeRequest(req: NextRequest) {
  if (hasValidAdminSession()) {
    return null;
  }

  if (!cronSecret) {
    console.warn('CAMPAIGN_CRON_SECRET not configured');
    return NextResponse.json({ error: 'Campaign cron secret not configured' }, { status: 500 });
  }

  const header = req.headers.get('authorization') || req.headers.get('x-cron-secret');
  if (!header) return unauthorized();
  const provided = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (provided.trim() !== cronSecret) return unauthorized();
  return null;
}

type CampaignOverrides = {
  batchSize?: number;
  minHoursBetween?: number;
  previewOnly?: boolean;
  createMissingInvites?: boolean;
};

function pickRecipient(business: Awaited<ReturnType<typeof fetchLeadMineBusinesses>>['data'][number]) {
  const email = business.contact.primaryEmail || business.contact.alternateEmail;
  if (!email) return null;
  return {
    email,
    name: business.contact.contactPerson || business.name || undefined,
  };
}

function buildInviteLink(token: string) {
  const url = new URL(linkBase);
  url.searchParams.set('eid', `biz_${token}`);
  return url.toString();
}

function shouldSend(invite: NonNullable<Awaited<ReturnType<typeof fetchLeadMineBusinesses>>['data'][number]['invite']>, minIntervalMs: number) {
  if (!invite) return false;
  if (!invite.lastEmailSent) return true;
  const lastSent = new Date(invite.lastEmailSent).getTime();
  if (Number.isNaN(lastSent)) return true;
  return Date.now() - lastSent >= minIntervalMs;
}

function buildEmailContent(business: Awaited<ReturnType<typeof fetchLeadMineBusinesses>>['data'][number], link: string) {
  const preview = 'Join Evergreen for an invite-only AI seminar — reserve your spot.';
  const greeting = business.contact.contactPerson ? `Hi ${business.contact.contactPerson},` : 'Hello,';

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:auto; background:#111827; border-radius:16px; overflow:hidden;">
          <tr><td style="padding:32px;">
            <p style="font-size:15px; line-height:1.6;">${greeting}</p>
            <p style="font-size:15px; line-height:1.6;">
              We’re curating a cohort of forward-looking businesses across the Pacific Northwest for a private Evergreen AI seminar. It’s a focused session on applied AI workflows—what’s working, what’s hype, and where firms like ${business.name ?? 'yours'} can capture immediate wins.
            </p>
            <p style="font-size:15px; line-height:1.6;">
              We have room for a small group and wanted to extend a personal invitation. Use the secure link below to preview the agenda and RSVP:
            </p>
            <p style="margin:28px 0;">
              <a href="${link}" style="display:inline-block; background:#22c55e; color:#0f172a; font-weight:600; padding:14px 26px; border-radius:999px; text-decoration:none;">View details & RSVP</a>
            </p>
            <p style="font-size:15px; line-height:1.6;">
              Confirming gets you a seat, priority briefing materials, and first access to the partnership program we’re unveiling at the event.
            </p>
            <p style="font-size:15px; line-height:1.6;">Looking forward to meeting the team.</p>
            <p style="margin-top:32px; font-size:15px;">
              — Evergreen AI Partnerships Team
            </p>
          </td></tr>
        </table>
      </body>
    </html>
  `;

  const text = `${greeting}

We’re curating a cohort of forward-looking businesses across the Pacific Northwest for a private Evergreen AI seminar. It’s a focused session on applied AI workflows—what’s working, what’s hype, and where firms like ${business.name ?? 'yours'} can capture immediate wins.

Use this secure link to preview the agenda and RSVP: ${link}

Confirming gets you a seat, briefing materials, and first access to the partnership program we’re unveiling at the event.

Looking forward to meeting the team,
Evergreen AI Partnerships Team`;

  return { html, text, preview }; 
}

export async function POST(req: NextRequest) {
  const authCheck = authorizeRequest(req);
  if (authCheck) return authCheck;

  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  if (!process.env.LEADMINE_API_BASE || !process.env.LEADMINE_API_KEY) {
    return NextResponse.json({ error: 'LeadMine integration not configured' }, { status: 500 });
  }

  let overrides: CampaignOverrides | null = null;
  if (req.headers.get('content-type')?.includes('application/json')) {
    overrides = await req.json().catch(() => null);
  }

  const defaultBatchSize = Number.parseInt(process.env.CAMPAIGN_EMAIL_BATCH_SIZE || '50', 10) || 50;
  const defaultMinHoursBetween = Number.parseInt(process.env.CAMPAIGN_MIN_HOURS_BETWEEN_EMAILS || '72', 10) || 72;

  const batchSize = overrides?.batchSize && overrides.batchSize > 0
    ? Math.min(overrides.batchSize, 200)
    : defaultBatchSize;
  const minHoursBetween = overrides?.minHoursBetween != null && overrides.minHoursBetween >= 0
    ? overrides.minHoursBetween
    : defaultMinHoursBetween;
  const previewOnly = Boolean(overrides?.previewOnly);
  const createMissing = overrides?.createMissingInvites ?? true;

  const minIntervalMs = minHoursBetween * 60 * 60 * 1000;

  const resend = previewOnly ? null : new Resend(resendKey);

  const businesses = await fetchLeadMineBusinesses({ limit: batchSize * 2, createMissing, hasEmail: true });

  const candidates = businesses.data
    .filter((biz) => biz.invite && pickRecipient(biz))
    .filter((biz) => shouldSend(biz.invite!, minIntervalMs))
    .slice(0, batchSize);

  const results: Array<{ businessId: string; email: string; status: 'sent' | 'skipped'; reason?: string }> = [];

  for (const biz of candidates) {
    const recipient = pickRecipient(biz);
    if (!recipient) {
      results.push({ businessId: biz.id, email: '', status: 'skipped', reason: 'No email' });
      continue;
    }
    if (!biz.invite) {
      results.push({ businessId: biz.id, email: recipient.email, status: 'skipped', reason: 'Missing invite token' });
      continue;
    }

    const inviteLink = buildInviteLink(biz.invite.token);
    const content = buildEmailContent(biz, inviteLink);

    try {
      if (previewOnly || !resend) {
        results.push({ businessId: biz.id, email: recipient.email, status: 'skipped', reason: previewOnly ? 'preview_only' : 'resend_missing' });
        continue;
      }

      await resend.emails.send({
        from: fromAddress,
        to: recipient.email,
        subject: 'Invitation: Evergreen AI Seminar',
        html: content.html,
        text: content.text,
        headers: {
          'X-Entity-Ref-ID': biz.invite.token,
        },
      });

      await postLeadMineEvent({ token: biz.invite.token, type: 'email_sent' });

      results.push({ businessId: biz.id, email: recipient.email, status: 'sent' });
    } catch (error) {
      console.error('Campaign send error', { businessId: biz.id, error });
      results.push({ businessId: biz.id, email: recipient.email, status: 'skipped', reason: 'send_failed' });
    }
  }

  return NextResponse.json({
    attempted: candidates.length,
    sent: results.filter((r) => r.status === 'sent').length,
    results,
    previewOnly,
    batchSize,
    minHoursBetween,
    remaining: Math.max(0, (businesses.data.length || 0) - candidates.length),
  });
}
