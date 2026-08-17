/**
 * Cloudflare Pages Function — /api/ghl
 *
 * Returns GHL contact + conversation counts for a given client slug + period.
 * Used by the live date picker.
 *
 * Query params:
 *   slug    - client slug (e.g. "sunflower")
 *   period  - last30 | lastMonth | last3months | ytd
 *
 * Secrets required:
 *   GHL_API_KEY  - GHL Private Integration Token
 */

// Per-client GHL location IDs — matches clients.json ghlLocationId
// GHL is NOT a dashboard data source — this endpoint is disabled.
const CLIENT_MAP = {};

const GHL_BASE = 'https://services.leadconnectorhq.com';

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmt(d) { return d.toISOString().split('T')[0]; }

function getDateRange(period) {
  const now = new Date();
  switch (period) {
    case 'last30': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - 29);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'last3months': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setMonth(start.getMonth() - 3);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now); end.setDate(end.getDate() - 1);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    default: { // lastMonth
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: fmt(first), endDate: fmt(last) };
    }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  const slug   = url.searchParams.get('slug');
  const period = url.searchParams.get('period') || 'lastMonth';

  if (!slug) return Response.json({ error: 'Missing slug param' }, { status: 400 });

  const locationId = CLIENT_MAP[slug];
  if (!locationId) return Response.json({ skipped: true, reason: 'No GHL location for slug' });

  const apiKey = env.GHL_API_KEY;
  if (!apiKey) return Response.json({ error: 'GHL_API_KEY not configured' }, { status: 500 });

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Version':     '2021-07-28',
    Accept:        'application/json',
  };

  try {
    const { startDate, endDate } = getDateRange(period);
    const startTs = new Date(startDate + 'T00:00:00Z').getTime();
    const endTs   = new Date(endDate   + 'T23:59:59Z').getTime();

    // 1. New contacts in period
    const contactsRes = await fetch(
      `${GHL_BASE}/contacts/?locationId=${locationId}&startAfter=${startTs}&startAfterId=&limit=100`,
      { headers }
    );
    const contactsData = await contactsRes.json();
    const newContacts = (contactsData.contacts || []).filter(c => {
      const ts = c.dateAdded ? new Date(c.dateAdded).getTime() : 0;
      return ts >= startTs && ts <= endTs;
    }).length;

    // 2. Conversations in period (inbound = leads)
    const convsRes = await fetch(
      `${GHL_BASE}/conversations/search?locationId=${locationId}&startAfterDate=${startDate}&endDate=${endDate}&limit=100`,
      { headers }
    );
    const convsData = await convsRes.json();
    const conversations = (convsData.conversations || []).length;

    return Response.json({
      period,
      startDate,
      endDate,
      fetchedAt: new Date().toISOString(),
      ghl: {
        newContacts,
        conversations,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
