'use client';

import { useState } from "react";

const statusStyles: Record<string, string> = {
  sent: 'text-emerald-300',
  skipped: 'text-amber-300',
};

type CampaignDefaults = {
  batchSize: number;
  minHoursBetween: number;
  linkBase: string;
  fromEmail: string;
  cronSecretConfigured: boolean;
  resendConfigured: boolean;
  leadMineConfigured: boolean;
};

type CampaignResult = {
  attempted: number;
  sent: number;
  previewOnly: boolean;
  batchSize: number;
  minHoursBetween: number;
  remaining: number;
  results: Array<{
    businessId: string;
    email: string;
    status: 'sent' | 'skipped';
    reason?: string;
  }>;
};

function formatStatus(status: string, reason?: string) {
  if (status === 'sent') return 'Sent';
  if (reason === 'preview_only') return 'Preview';
  if (reason === 'send_failed') return 'Failed';
  if (reason === 'resend_missing') return 'Skipped (no Resend key)';
  if (reason === 'No email') return 'Skipped (no email)';
  return 'Skipped';
}

type Props = {
  defaults: CampaignDefaults;
};

export default function CampaignControls({ defaults }: Props) {
  const [batchSize, setBatchSize] = useState<number>(defaults.batchSize);
  const [minHoursBetween, setMinHoursBetween] = useState<number>(defaults.minHoursBetween);
  const [createMissing, setCreateMissing] = useState<boolean>(true);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const disabled = isRunning || !defaults.leadMineConfigured || !defaults.resendConfigured;

  const integrationAlerts: string[] = [];
  if (!defaults.leadMineConfigured) {
    integrationAlerts.push('Lead Mine API base/key missing. Set LEADMINE_API_BASE and LEADMINE_API_KEY.');
  }
  if (!defaults.resendConfigured) {
    integrationAlerts.push('Resend API key missing. Set RESEND_API_KEY to send emails.');
  }
  if (!defaults.cronSecretConfigured) {
    integrationAlerts.push('Campaign cron secret missing. Set CAMPAIGN_CRON_SECRET to allow external triggers.');
  }

  async function runCampaign(preview: boolean) {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/campaign/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize,
          minHoursBetween,
          previewOnly: preview,
          createMissingInvites: createMissing,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Campaign run failed');
      }
      setResult(json as CampaignResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold text-white">Send configuration</h2>
          <p className="text-sm text-neutral-400">
            Defaults come from environment variables. Adjust overrides to test or throttle a batch before sending.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-neutral-400">
          Link base: <span className="text-neutral-200">{defaults.linkBase}</span>
          <br />
          From email: <span className="text-neutral-200">{defaults.fromEmail}</span>
        </div>
      </div>

      {integrationAlerts.length ? (
        <div className="space-y-2">
          {integrationAlerts.map((msg) => (
            <div key={msg} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {msg}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          Batch size
          <input
            type="number"
            min={1}
            max={200}
            value={batchSize}
            onChange={(event) => setBatchSize(Number(event.target.value) || defaults.batchSize)}
            className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          />
          <span className="text-xs text-neutral-500">Default {defaults.batchSize}. Hard limit 200 per run.</span>
        </label>
        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          Minimum hours between emails
          <input
            type="number"
            min={0}
            value={minHoursBetween}
            onChange={(event) => setMinHoursBetween(Number(event.target.value) || defaults.minHoursBetween)}
            className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          />
          <span className="text-xs text-neutral-500">Default {defaults.minHoursBetween} hours.</span>
        </label>
        <label className="flex items-center gap-3 text-sm text-neutral-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={createMissing}
            onChange={(event) => setCreateMissing(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black/60 text-emerald-400"
          />
          Auto-create missing invite tokens for new businesses
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => runCampaign(true)}
          disabled={isRunning}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? 'Running preview…' : 'Preview next batch'}
        </button>
        <button
          type="button"
          onClick={() => runCampaign(false)}
          disabled={disabled}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? 'Sending…' : 'Send emails'}
        </button>
        {!defaults.resendConfigured || !defaults.leadMineConfigured ? (
          <span className="text-xs text-amber-300">
            Configure all integrations to enable sending.
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-300">
            <span className="font-medium text-white">Run summary</span>
            <span>
              Attempted <strong className="text-white">{result.attempted}</strong> — sent{' '}
              <strong className="text-white">{result.sent}</strong>
            </span>
            <span>Batch size {result.batchSize}</span>
            <span>Guard interval {result.minHoursBetween}h</span>
            <span>Remaining candidates {result.remaining}</span>
            {result.previewOnly ? <span className="text-amber-300">Preview only (no emails sent)</span> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="text-neutral-300">
                <tr>
                  <th className="py-2 pr-4">Business ID</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.results.map((item) => (
                  <tr key={`${item.businessId}-${item.email}`}>
                    <td className="py-2 pr-4 font-mono text-xs text-neutral-300">{item.businessId}</td>
                    <td className="py-2 pr-4 text-neutral-100">{item.email || '—'}</td>
                    <td className={`py-2 pr-4 font-medium ${statusStyles[item.status] ?? 'text-neutral-300'}`}>
                      {formatStatus(item.status, item.reason)}
                    </td>
                    <td className="py-2 pr-4 text-neutral-400">{item.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
