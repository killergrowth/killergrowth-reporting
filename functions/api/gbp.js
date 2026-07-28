/**
 * Cloudflare Pages Function — /api/gbp
 *
 * Returns Google Business Profile performance data (calls, directions, views)
 * for a given client slug + period. Uses Service Account + DWD (no OAuth refresh token).
 *
 * Query params:
 *   slug    - client slug (e.g. "sunflower")
 *   period  - last30 | lastMonth | last3months | ytd
 *
 * Secrets required:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  - full SA key JSON string
 */

// Per-client GBP account + location IDs — matches clients.json
const CLIENT_MAP = {
  'sunflower': {
    accountId:  'accounts/106616885756454251599',
    locationId: 'locations/15983736476187035394',
  },
  'timnath': {
    accountId:  null, // no GBP configured yet
    locationId: null,
  },
  'good-to-be-clean': {
    accountId:  null,
    locationId: null,
  },
  // Add others as needed
};

// ── JWT / Auth (SA + DWD, impersonating brickley@killergrowth.com) ────────────

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
      sub: 'brickley@killergrowth.com', // DWD impersonation
      scope: 'https://www.googleapis.com/auth/business.manage',
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

  const clientCfg = CLIENT_MAP[slug];
  if (!clientCfg || !clientCfg.accountId || !clientCfg.locationId) {
    return Response.json({ skipped: true, reason: 'No GBP config for slug' });
  }

  const saJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return Response.json({ error: 'Service account not configured' }, { status: 500 });

  try {
    const token = await getAccessToken(saJson);
    const { startDate, endDate } = getDateRange(period);

    const { accountId, locationId } = clientCfg;
    const locPath = `${accountId}/${locationId}`;

    // Business Profile Performance API — daily metrics timeseries
    const metricNames = [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'CALL_CLICKS',
      'WEBSITE_CLICKS',
      'BUSINESS_DIRECTION_REQUESTS',
    ];

    const perfRes = await fetch(
      `https://businessprofileperformance.googleapis.com/v1/${locationId}:fetchMultiDailyMetricsTimeSeries?` +
      metricNames.map(m => `dailyMetric=${encodeURIComponent(m)}`).join('&') +
      `&dailyRange.start_date.year=${startDate.split('-')[0]}` +
      `&dailyRange.start_date.month=${parseInt(startDate.split('-')[1])}` +
      `&dailyRange.start_date.day=${parseInt(startDate.split('-')[2])}` +
      `&dailyRange.end_date.year=${endDate.split('-')[0]}` +
      `&dailyRange.end_date.month=${parseInt(endDate.split('-')[1])}` +
      `&dailyRange.end_date.day=${parseInt(endDate.split('-')[2])}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const perfData = await perfRes.json();
    if (perfData.error) throw new Error(`GBP perf error: ${perfData.error.message}`);

    // Aggregate totals from timeseries
    let totalViews = 0, calls = 0, websiteClicks = 0, directions = 0;
    const viewsOverTime = {};

    (perfData.multiDailyMetricTimeSeries || []).forEach(series => {
      (series.dailyMetricTimeSeries || []).forEach(metSeries => {
        const metric = metSeries.dailyMetric;
        (metSeries.timeSeries?.datedValues || []).forEach(dv => {
          const d = dv.date;
          const dateKey = `${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;
          const val = parseInt(dv.value || 0);
          if (!viewsOverTime[dateKey]) viewsOverTime[dateKey] = { date: dateKey, views: 0, calls: 0, websiteClicks: 0, directions: 0 };
          if (metric.includes('IMPRESSIONS')) { viewsOverTime[dateKey].views += val; totalViews += val; }
          if (metric === 'CALL_CLICKS')                { viewsOverTime[dateKey].calls += val;          calls += val; }
          if (metric === 'WEBSITE_CLICKS')             { viewsOverTime[dateKey].websiteClicks += val;  websiteClicks += val; }
          if (metric === 'BUSINESS_DIRECTION_REQUESTS'){ viewsOverTime[dateKey].directions += val;     directions += val; }
        });
      });
    });

    const viewsOverTimeArr = Object.values(viewsOverTime).sort((a, b) => a.date.localeCompare(b.date));

    return Response.json({
      period,
      startDate,
      endDate,
      fetchedAt: new Date().toISOString(),
      gbp: {
        totalViews,
        calls,
        websiteClicks,
        directions,
        viewsOverTime: viewsOverTimeArr,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
