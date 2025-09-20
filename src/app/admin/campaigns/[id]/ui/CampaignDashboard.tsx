// src/app/admin/campaigns/[id]/ui/CampaignDashboard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import QueueTable from "./QueueTable";

type Overview = {
  totals: { total: number; sent: number; failed: number; scheduled: number; processing: number };
  nextSendAt: string | null;
  lastSentAt: string | null;
  avgThroughputPerMin: number;
  eta: string | null;
  calendar: { planned: Record<string, number>; sent: Record<string, number> };
  paused: boolean; // NEW
};

function useOverview(campaignId: string, initial?: Overview | null) {
  const [data, setData] = useState<Overview | null>(initial ?? null);
  useEffect(() => {
    const i = setInterval(async () => {
      const r = await fetch(`/api/admin/campaign/${campaignId}/overview`, { cache: "no-store" });
      if (r.ok) setData(await r.json());
    }, 10000);
    return () => clearInterval(i);
  }, [campaignId]);
  return data;
}

function Countdown({ to }: { to: string | null }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!to) return <span>—</span>;
  const target = new Date(to);
  const secs = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return <span>{h}h {m}m {s}s</span>;
}

function Progress({ sent, total }: { sent: number; total: number }) {
  const pct = total ? Math.round((sent / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{sent} / {total}</div>
      <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded">
        <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type Window = { start: string; end: string };
type Settings = {
  campaignId: string;
  windows: Window[];
  throttlePerMinute: number;
  maxConcurrent: number;
  perDomain?: Record<string, any> | null;
  quietHours?: Window[] | null;
};

function SmartWindowEditor({ campaignId }: { campaignId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/admin/campaign/${campaignId}/schedule`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        setSettings(j.settings);
      }
    })();
  }, [campaignId]);

  function updateWindow(i: number, key: "start" | "end", val: string) {
    if (!settings) return;
    const copy = { ...settings, windows: settings.windows.map((w, idx) => idx === i ? { ...w, [key]: val } : w) };
    setSettings(copy);
  }

  async function addWindow() {
    if (!settings) return;
    setSettings({ ...settings, windows: [...settings.windows, { start: "09:00", end: "10:00" }] });
  }

  async function removeWindow(i: number) {
    if (!settings) return;
    setSettings({ ...settings, windows: settings.windows.filter((_, idx) => idx !== i) });
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    const r = await fetch(`/api/admin/campaign/${campaignId}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        windows: settings.windows,
        throttlePerMinute: settings.throttlePerMinute,
        maxConcurrent: settings.maxConcurrent,
        perDomain: settings.perDomain ?? undefined,
        quietHours: settings.quietHours ?? undefined,
      }),
    });
    setSaving(false);
    if (!r.ok) alert("Failed to save schedule");
  }

  if (!settings) return <div className="text-sm">Loading schedule…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Smart Window</h3>
        <button onClick={addWindow} className="text-sm underline">Add window</button>
      </div>

      <div className="space-y-2">
        {settings.windows.map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <label className="text-sm w-10">Start</label>
            <input type="time" value={w.start} onChange={(e) => updateWindow(i, "start", e.target.value)} className="border rounded px-2 py-1" />
            <label className="text-sm w-10">End</label>
            <input type="time" value={w.end} onChange={(e) => updateWindow(i, "end", e.target.value)} className="border rounded px-2 py-1" />
            <button onClick={() => removeWindow(i)} className="text-xs text-red-600 underline">Remove</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Throttle per minute</label>
          <input
            type="number"
            min={1}
            value={settings.throttlePerMinute}
            onChange={(e) => setSettings({ ...settings, throttlePerMinute: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Max concurrent</label>
          <input
            type="number"
            min={1}
            value={settings.maxConcurrent}
            onChange={(e) => setSettings({ ...settings, maxConcurrent: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
      </div>

      <div>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save & Rebuild Schedule"}
        </button>
      </div>
    </div>
  );
}

import TopActions from "./TopActions";

// ... (rest of the file content)

export default function CampaignDashboard({
  campaignId,
  initialOverview,
}: {
  campaignId: string;
  initialOverview: Overview | null;
}) {
  const data = useOverview(campaignId, initialOverview);
  const sent = data?.totals.sent ?? 0;
  const total = data?.totals.total ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Next send in</div>
          <div className="text-xl font-semibold">
            <Countdown to={data?.nextSendAt ?? null} />
          </div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="mt-2">
            <Progress sent={sent} total={total} />
          </div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Avg throughput (per min)</div>
          <div className="text-xl font-semibold">{(data?.avgThroughputPerMin ?? 0).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ETA: {data?.eta ? new Date(data.eta).toLocaleString() : "—"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Status: {data?.paused ? "Paused" : "Running"}
        </div>
        <TopActions
          campaignId={campaignId}
          pausedInitial={!!data?.paused}
          onChanged={() => {
            // soft refresh overview quickly after an action
            fetch(`/api/admin/campaign/${campaignId}/overview`, { cache: "no-store" })
              .then(r => r.ok ? r.json() : null)
              .then(j => j && (/* minimal state update if you want */ null));
          }}
        />
      </div>

      <SmartWindowEditor campaignId={campaignId} />

      <div className="p-4 rounded-lg border">
        <div className="mb-3 text-sm text-muted-foreground">Queue</div>
        <QueueTable campaignId={campaignId} />
      </div>
    </div>
  );
}