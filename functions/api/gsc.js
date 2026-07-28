/**
 * Cloudflare Pages Function — /api/gsc
 *
 * Proxies Google Search Console keyword data server-side.
 * Runs on the same domain as the dashboard (no CORS issues).
 *
 * Query params:
 *   site    — GSC site URL  e.g. sc-domain:timnathpainting.com
 *   rows    — max rows (default 50, max 100)
 *   period  — last28 (default) | last7 | lastMonth | last3months
 *   sort    — impressions (default) | clicks | position
 *
 * Secret required (set in CF Pages → Settings → Environment variables):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — full SA key JSON string
 */

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
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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

function fmtDate(d) { return d.toISOString().split('T')[0]; }

function getDateRange(period) {
  const now = new Date();
  switch (period) {
    case 'last7': {
      const end = new Date(now); end.setDate(end.getDate() - 3);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      return { startDate: fmtDate(start), endDate: fmtDate(end) };
    }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: fmtDate(first), endDate: fmtDate(last) };
    }
    case 'last3months': {
      const end = new Date(now); end.setDate(end.getDate() - 3);
      const start = new Date(end); start.setMonth(start.getMonth() - 3);
      return { startDate: fmtDate(start), endDate: fmtDate(end) };
    }
    default: { // last28
      const end = new Date(now); end.setDate(end.getDate() - 3);
      const start = new Date(end); start.setDate(start.getDate() - 27);
      return { startDate: fmtDate(start), endDate: fmtDate(end) };
    }
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const site   = url.searchParams.get('site');
  const rows   = Math.min(parseInt(url.searchParams.get('rows') || '50'), 100);
  const period = url.searchParams.get('period') || 'last28';
  const sort   = url.searchParams.get('sort') || 'impressions';

  if (!site) {
    return Response.json({ error: 'Missing site param' }, { status: 400 });
  }

  const saJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    return Response.json({ error: 'Service account not configured' }, { status: 500 });
  }

  try {
    const token = await getAccessToken(saJson);
    const { startDate, endDate } = getDateRange(period);

    const body = {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: rows,
      orderBy: [{ field: sort, sortOrder: 'DESCENDING' }],
    };

    const gscRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const gscData = await gscRes.json();
    if (gscData.error) {
      return Response.json({ error: gscData.error.message }, { status: 502 });
    }

    const keywords = (gscData.rows || []).map(r => ({
      keyword:     r.keys[0],
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         parseFloat((r.ctr * 100).toFixed(1)),
      position:    parseFloat(r.position.toFixed(1)),
    }));

    const top10 = keywords.filter(k => k.position <= 10).length;
    const top3  = keywords.filter(k => k.position <= 3).length;

    return Response.json({
      site,
      period,
      startDate,
      endDate,
      fetchedAt: new Date().toISOString(),
      keywords,
      stats: {
        total:            keywords.length,
        top3,
        top10,
        totalClicks:      keywords.reduce((s, k) => s + k.clicks, 0),
        totalImpressions: keywords.reduce((s, k) => s + k.impressions, 0),
      },
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
