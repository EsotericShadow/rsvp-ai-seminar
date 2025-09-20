// src/app/admin/campaigns/[id]/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import CampaignDashboard from "./ui/CampaignDashboard";

export default async function Page({ params }: { params: { id: string } }) {
  // Server-side fetch overview to hydrate quickly
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/campaign/${params.id}/overview`, { cache: "no-store" });
  const overview = res.ok ? await res.json() : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaign Control Center</h1>
        <Link href="/admin" className="text-sm underline">Back to Admin</Link>
      </div>

      <Suspense fallback={<div>Loading…</div>}>
        <CampaignDashboard campaignId={params.id} initialOverview={overview} />
      </Suspense>
    </div>
  );
}