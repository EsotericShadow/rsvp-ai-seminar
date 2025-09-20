import { useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  recipientEmail: string;
  sendAt: string;
  status: "scheduled" | "processing" | "sent" | "failed";
  attempts: number;
  error: string | null;
  sentAt: string | null;
  processingStartedAt: string | null;
  providerMessageId: string | null;
  createdAt: string;
};

type Page = {
  items: Job[];
  nextCursor: string | null;
};

export default function QueueTable({ campaignId }: { campaignId: string }) {
  const [status, setStatus] = useState<"scheduled"|"processing"|"sent"|"failed"|"all">("scheduled");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Job[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveStatus = status === "all" ? undefined : status;

  async function fetchPage(reset = false) {
    setLoading(true);
    const q = new URLSearchParams();
    if (effectiveStatus) q.set("status", effectiveStatus);
    if (cursor && !reset) q.set("cursor", cursor);
    if (search.trim()) q.set("search", search.trim());
    const r = await fetch(`/api/admin/campaign/${campaignId}/queue?${q.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!r.ok) return;
    const data: Page = await r.json();
    if (reset) {
      setRows(data.items);
    } else {
      setRows(prev => [...prev, ...data.items]);
    }
    setCursor(data.nextCursor);
  }

  useEffect(() => {
    // initial load
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  function applyFilter() {
    setCursor(null);
    fetchPage(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="scheduled">Scheduled</option>
          <option value="processing">Processing</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="all">All</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email…"
          className="border rounded px-2 py-1 text-sm"
        />
        <button onClick={applyFilter} className="px-3 py-1.5 rounded bg-neutral-800 text-white text-sm">
          Apply
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Recipient</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Send At</th>
              <th className="py-2 pr-3">Attempts</th>
              <th className="py-2 pr-3">Error</th>
              <th className="py-2 pr-3">Provider ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{r.recipientEmail}</td>
                <td className="py-2 pr-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    r.status === "sent" ? "bg-green-100 text-green-800"
                    : r.status === "failed" ? "bg-red-100 text-red-800"
                    : r.status === "processing" ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-2 pr-3">{new Date(r.sendAt).toLocaleString()}</td>
                <td className="py-2 pr-3">{r.attempts}</td>
                <td className="py-2 pr-3 truncate max-w-[24ch]" title={r.error ?? ""}>{r.error ?? ""}</td>
                <td className="py-2 pr-3 truncate max-w-[24ch]" title={r.providerMessageId ?? ""}>{r.providerMessageId ?? ""}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="py-4 text-muted-foreground" colSpan={6}>No rows.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={!cursor || loading}
          onClick={() => fetchPage(false)}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-60"
        >
          {loading ? "Loading…" : (cursor ? "Load more" : "No more")}
        </button>
        <button
          onClick={() => { setCursor(null); fetchPage(true); }}
          className="px-3 py-1.5 rounded border text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}