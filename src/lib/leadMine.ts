// src/lib/leadMine.ts

export type LeadMineBusiness = {
  id: string;
  name: string | null;
  address: string | null;
  website: string | null;
  createdAt: string;
  contact: {
    primaryEmail: string | null;
    alternateEmail: string | null;
    contactPerson: string | null;
    tags: string[];
  };
  lead: {
    status: string | null;
    priority: string | null;
    assignedTo: string | null;
    nextFollowUpDate: string | null;
  };
  invite: {
    token: string;
    emailsSent: number;
    lastEmailSent: string | null;
    visitsCount: number;
    lastVisitedAt: string | null;
    rsvpsCount: number;
    lastRsvpAt: string | null;
    lastEmailMeta?: Record<string, unknown> | null;
    lastVisitMeta?: Record<string, unknown> | null;
    lastRsvpMeta?: Record<string, unknown> | null;
  } | null;
};

export type LeadMineBusinessesResponse = {
  data: LeadMineBusiness[];
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
};

async function leadMineFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.LEADMINE_API_BASE?.replace(/\/$/, '') ?? '';
  const apiKey = process.env.LEADMINE_API_KEY?.trim();
  
  if (!baseUrl || !apiKey) {
    throw new Error('LeadMine integration not configured');
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LeadMine request failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

// The only supported way to fetch/create is this GET with ids + createMissing
export async function fetchLeadMineBusinesses(params: {
  limit?: number;
  cursor?: string;
  hasEmail?: boolean;
  createMissing?: boolean;
  ids?: string[];
  search?: string;
} = {}): Promise<LeadMineBusinessesResponse> {
  const search = new URLSearchParams();
  if (params.limit) search.set('limit', String(params.limit));
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.hasEmail) search.set('hasEmail', '1');
  if (params.createMissing) search.set('createMissing', '1');
  if (params.ids?.length) search.set('ids', params.ids.join(','));
  if (params.search) search.set('search', params.search);

  const path = `/api/integration/businesses${search.toString() ? `?${search.toString()}` : ''}`;
  return leadMineFetch<LeadMineBusinessesResponse>(path);
}

export async function postLeadMineEvent(payload: {
  token?: string;
  businessId?: string;
  type: 'email_sent' | 'visit' | 'rsvp';
  meta?: Record<string, unknown>;
}): Promise<void> {
  await leadMineFetch('/api/integration/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
