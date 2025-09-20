import { useState } from "react";

export default function TopActions({
  campaignId,
  pausedInitial = false,
  onChanged,
}: {
  campaignId: string;
  pausedInitial?: boolean;
  onChanged?: () => void;
}) {
  const [paused, setPaused] = useState(!!pausedInitial);
  const [busy, setBusy] = useState(false);

  async function togglePause() {
    setBusy(true);
    const url = paused ? `/api/admin/campaign/${campaignId}/resume` : `/api/admin/campaign/${campaignId}/pause`;
    const r = await fetch(url, { method: "POST" });
    setBusy(false);
    if (r.ok) {
      setPaused(!paused);
      onChanged?.();
    } else {
      alert("Action failed");
    }
  }

  async function sendNextBatch() {
    setBusy(true);
    const r = await fetch(`/api/admin/campaign/${campaignId}/send-next-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 50 }),
    });
    setBusy(false);
    if (!r.ok) return alert("Failed to dispatch batch");
    onChanged?.();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePause}
        disabled={busy}
        className="px-3 py-1.5 rounded border text-sm"
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <button
        onClick={sendNextBatch}
        disabled={busy || paused}
        className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm disabled:opacity-60"
        title={paused ? "Resume campaign to send" : "Trigger next batch now"}
      >
        Send next batch
      </button>
    </div>
  );
}