import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { fetchLeadMineBusinesses } from "@/lib/leadMine";
import { getAdminConfig, getSessionCookieName, verifySessionToken } from "@/lib/admin-auth";
import CampaignControls from "@/components/admin/campaign/CampaignControls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminCampaignPage() {
  const adminConfig = getAdminConfig();
  if (!adminConfig) {
    redirect('/admin/login?error=config');
  }

  const token = cookies().get(getSessionCookieName())?.value;
  const session = token ? verifySessionToken(token, adminConfig.sessionSecret) : null;

  if (!session) {
    redirect(`/admin/login?next=${encodeURIComponent('/admin/campaign')}`);
  }

  const defaults = {
    batchSize: Number.parseInt(process.env.CAMPAIGN_EMAIL_BATCH_SIZE || '50', 10) || 50,
    minHoursBetween: Number.parseInt(process.env.CAMPAIGN_MIN_HOURS_BETWEEN_EMAILS || '72', 10) || 72,
    linkBase: process.env.CAMPAIGN_LINK_BASE || 'https://rsvp-ai-seminar.vercel.app/rsvp',
    fromEmail: process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <team@evergreen.ai>',
    cronSecretConfigured: Boolean(process.env.CAMPAIGN_CRON_SECRET?.trim()),
    resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    leadMineConfigured:
      Boolean(process.env.LEADMINE_API_BASE?.trim()) && Boolean(process.env.LEADMINE_API_KEY?.trim()),
  };

  let invitees: Awaited<ReturnType<typeof fetchLeadMineBusinesses>>['data'] = [];
  let inviteesError: string | null = null;

  if (defaults.leadMineConfigured) {
    try {
      const response = await fetchLeadMineBusinesses({ limit: 25, hasEmail: true, createMissing: false });
      invitees = response.data;
    } catch (error) {
      console.error('Failed to load Lead Mine businesses', error);
      inviteesError = 'Could not load Lead Mine businesses. Check integration credentials.';
    }
  } else {
    inviteesError = 'Lead Mine integration environment variables are missing.';
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Evergreen Admin</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Campaign Control Center</h1>
          <p className="text-sm text-neutral-400 sm:text-base">
            Configure outreach settings, preview invite batches, and trigger Resend deliveries for Lead Mine businesses.
          </p>
        </header>

        <CampaignControls defaults={defaults} />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent invite-ready businesses</h2>
              <p className="text-sm text-neutral-400">
                Showing up to 25 businesses with email contacts. Adjust targeting in Lead Mine to influence this list.
              </p>
            </div>
          </div>

          {inviteesError ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {inviteesError}
            </div>
          ) : invitees.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead>
                  <tr className="text-neutral-300">
                    <th className="py-3 pr-4">Business</th>
                    <th className="py-3 pr-4">Primary Email</th>
                    <th className="py-3 pr-4">Invite Token</th>
                    <th className="py-3 pr-4">Emails Sent</th>
                    <th className="py-3 pr-4">Visits</th>
                    <th className="py-3 pr-4">RSVPs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invitees.map((biz) => (
                    <tr key={biz.id} className="align-top">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{biz.name ?? 'Unknown business'}</div>
                        <div className="text-xs text-neutral-400">{biz.address ?? 'Address unavailable'}</div>
                      </td>
                      <td className="py-3 pr-4 text-neutral-200">
                        {biz.contact.primaryEmail ?? biz.contact.alternateEmail ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-neutral-300">
                        {biz.invite?.token ? `biz_${biz.invite.token}` : 'Pending'}
                      </td>
                      <td className="py-3 pr-4 text-neutral-300">{biz.invite?.emailsSent ?? 0}</td>
                      <td className="py-3 pr-4 text-neutral-300">{biz.invite?.visitsCount ?? 0}</td>
                      <td className="py-3 pr-4 text-neutral-300">{biz.invite?.rsvpsCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-neutral-400">No businesses returned. Confirm Lead Mine data is synced.</div>
          )}
        </section>
      </div>
    </div>
  );
}
