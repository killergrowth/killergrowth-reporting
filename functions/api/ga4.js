/**
 * Cloudflare Pages Function — /api/ga4
 *
 * Returns GA4 sessions, conversions, traffic channels, and organic sessions
 * for a given client slug + period. Used by the live date picker.
 *
 * Query params:
 *   slug    - client slug (e.g. "sunflower")
 *   period  - last30 | lastMonth | last3months | ytd
 *
 * Secrets required (CF Pages → Settings → Environment variables):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  - full SA key JSON string
 */

// Per-client GA4 property IDs — matches scripts/clients.json
const CLIENT_MAP = {
  'goff':             'properties/377100972',
  'el-dorado':        'properties/418652879',
  'dons-heating':     'properties/418872471',
  'good-to-be-clean': 'properties/435007589',
  'sunflower':        'properties/504550092',
  'timnath':          'properties/532776446',
  'killergrowth':     'properties/536364697',
};

// ── JWT / Auth helpers (identical pattern to gsc.js) ──────────────────────────

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signJWT(header, payload, pemKey) {
  const enc = new TextEncoder();
  const h = base64url(enc.encode(JSON.stringify(header)));
  const p = base64url(enc.encode(JSON.stringify(payload)));
  const sigInput = `${h}.${p}`;
  const pem = pemKey.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(sigInput));
  return `${sigInput}.${base64url(sig)}`;
}

async function getAccessToken(saJson) {
  const sa = typeof saJson === 'string' ? JSON.parse(saJson) : saJson;
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJWT(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    },
    sa.private_key
  );
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ── Date range helpers ─────────────────────────────────────────────────────────

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

// ── GA4 Data API helper ────────────────────────────────────────────────────────

async function ga4Report(token, propertyId, startDate, endDate, dimensions, metrics) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions.map(n => ({ name: n })),
        metrics: metrics.map(n => ({ name: n })),
        limit: 25,
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(`GA4 error: ${data.error.message}`);
  return data;
}

function rowVal(row, idx) {
  return row.metricValues?.[idx]?.value ?? null;
}
function rowDim(row, idx) {
  return row.dimensionValues?.[idx]?.value ?? null;
}

// ── Main handler ───────────────────────────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  const slug   = url.searchParams.get('slug');
  const period = url.searchParams.get('period') || 'lastMonth';

  if (!slug) return Response.json({ error: 'Missing slug param' }, { status: 400 });

  const propertyId = CLIENT_MAP[slug];
  if (!propertyId) return Response.json({ skipped: true, reason: 'No GA4 property for slug' });

  const saJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return Response.json({ error: 'Service account not configured' }, { status: 500 });

  try {
    const token = await getAccessToken(saJson);
    const { startDate, endDate } = getDateRange(period);

    // 1. Sessions + conversions overview
    const overviewReport = await ga4Report(token, propertyId, startDate, endDate,
      [],
      ['sessions', 'conversions', 'engagedSessions', 'engagementRate']
    );
    const overviewRow = overviewReport.rows?.[0];
    const totalSessions    = parseInt(rowVal(overviewRow, 0) || '0');
    const totalConversions = parseInt(rowVal(overviewRow, 1) || '0');
    const engagedSessions  = parseInt(rowVal(overviewRow, 2) || '0');
    const engagementRate   = parseFloat(rowVal(overviewRow, 3) || '0');

    // 2. Traffic channels
    const channelReport = await ga4Report(token, propertyId, startDate, endDate,
      ['sessionDefaultChannelGroup'],
      ['sessions']
    );
    const trafficChannels = (channelReport.rows || []).map(r => ({
      channel:  rowDim(r, 0),
      sessions: parseInt(rowVal(r, 0) || '0'),
    })).sort((a, b) => b.sessions - a.sessions);

    // 3. Organic sessions by week (date dimension, organic channel filter)
    const organicReport = await ga4Report(token, propertyId, startDate, endDate,
      ['week', 'date'],
      ['sessions', 'conversions']
    );
    // Group by week
    const weekMap = {};
    (organicReport.rows || []).forEach(r => {
      const week = rowDim(r, 0);
      const date = rowDim(r, 1);
      if (!weekMap[week]) weekMap[week] = { week, date, sessions: 0, conversions: 0 };
      weekMap[week].sessions    += parseInt(rowVal(r, 0) || '0');
      weekMap[week].conversions += parseInt(rowVal(r, 1) || '0');
    });
    const organicSessions = Object.values(weekMap)
      .sort((a, b) => a.week.localeCompare(b.week));

    // 4. Conversion events (phone_click, generate_lead)
    const convReport = await ga4Report(token, propertyId, startDate, endDate,
      ['eventName', 'sessionDefaultChannelGroup'],
      ['eventCount']
    );
    const byChannel = {};
    let phoneCalls = 0, formSubmissions = 0, emailClicks = 0, formStarts = 0, ctaClicks = 0;
    (convReport.rows || []).forEach(r => {
      const evt = rowDim(r, 0);
      const ch  = rowDim(r, 1);
      const cnt = parseInt(rowVal(r, 0) || '0');
      if (!byChannel[evt]) byChannel[evt] = {};
      byChannel[evt][ch] = (byChannel[evt][ch] || 0) + cnt;
      if (evt === 'phone_click')    phoneCalls      += cnt;
      if (evt === 'generate_lead')  formSubmissions += cnt;
      if (evt === 'email_click')    emailClicks     += cnt;
      if (evt === 'form_start')     formStarts      += cnt;
      if (evt === 'cta_click')      ctaClicks       += cnt;
    });

    return Response.json({
      period,
      startDate,
      endDate,
      fetchedAt: new Date().toISOString(),
      seo: {
        organicSessions,
        trafficChannels,
        leadSignals: {
          organicSessions: totalSessions,
          phoneCalls,
          formSubmissions,
          emailClicks,
          formStarts,
          ctaClicks,
          byChannel,
        },
      },
      overview: {
        sessions:       totalSessions,
        conversions:    totalConversions,
        engagedSessions,
        engagementRate: parseFloat((engagementRate * 100).toFixed(1)),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
