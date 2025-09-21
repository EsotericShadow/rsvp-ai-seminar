import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminConfig, getSessionCookieName, verifySessionToken } from "@/lib/admin-auth";
import CampaignControls from "@/components/admin/campaign/CampaignControls";
import AdminLayout from "@/components/admin/AdminLayout";
import { listCampaignData } from "@/lib/campaigns";

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

  const initialData = await listCampaignData();

  return (
    <AdminLayout
      title="Campaign Control Center"
      subtitle="Configure outreach settings, preview invite batches, and trigger Resend deliveries for Lead Mine businesses."
      badge="Evergreen Admin"
    >
      <CampaignControls defaults={defaults} initialData={initialData} />
    </AdminLayout>
  );
}
