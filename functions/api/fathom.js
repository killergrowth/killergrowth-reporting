/**
 * Cloudflare Pages Function — /api/fathom
 *
 * Returns Fathom Analytics data for a given client slug + period.
 * Used by the live date picker.
 *
 * Query params:
 *   slug    - client slug (e.g. "sunflower")
 *   period  - last30 | lastMonth | last3months | ytd
 *
 * Secrets required (CF Pages → Settings → Environment variables):
 *   FATHOM_API_TOKEN  - Fathom bearer token
 */

const FATHOM_BASE = 'https://api.usefathom.com/v1';

// Per-client Fathom site IDs — matches clients.json fathomSiteId
const CLIENT_MAP = {
  'walnut-valley':    'SWIWEOSC',
  'alex-miller':      'IAVAKIOA',
  'cogans-woodshop':  'DYSWZSVJ',
  'iserve-facilities':'ANNMTVXC',
  'killergrowth':     'NNTNPDOW',
  'good-to-be-clean': 'MTRAPVNX',
  'sunflower':        'XNFHYGMT',
  'timnath':          'YNVVPFQV',
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmt(d) { return d.toISOString().split('T')[0]; }

function getDateRange(period) {
  const now = new Date();
  switch (period) {
    case 'last30': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - 29);
      return { dateFrom: fmt(start), dateTo: fmt(end) };
    }
    case 'last3months': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setMonth(start.getMonth() - 3);
      return { dateFrom: fmt(start), dateTo: fmt(end) };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now); end.setDate(end.getDate() - 1);
      return { dateFrom: fmt(start), dateTo: fmt(end) };
    }
    default: { // lastMonth
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateFrom: fmt(first), dateTo: fmt(last) };
    }
  }
}

// Fathom uses day grouping for ≤31 days, month grouping for longer ranges
function getGrouping(period) {
  return (period === 'last30' || period === 'lastMonth') ? 'day' : 'month';
}

// ── Fathom API helper ─────────────────────────────────────────────────────────

async function fathomGet(token, path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${FATHOM_BASE}${path}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fathom ${res.status}: ${body}`);
  }
  return res.json();
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

  const siteId = CLIENT_MAP[slug];
  if (!siteId) return Response.json({ skipped: true, reason: 'No Fathom site ID for slug' });

  const token = env.FATHOM_API_TOKEN;
  if (!token) return Response.json({ error: 'FATHOM_API_TOKEN not configured' }, { status: 500 });

  try {
    const { dateFrom, dateTo } = getDateRange(period);
    const grouping = getGrouping(period);

    // 1. Aggregate stats for the period
    const agg = await fathomGet(token, '/aggregations', {
      entity:       'site',
      entity_id:    siteId,
      aggregates:   'visits,uniques,pageviews,avg_duration,bounce_rate',
      date_grouping:'day',  // we sum ourselves for accurate period totals
      date_from:    dateFrom,
      date_to:      dateTo,
    });

    // Sum daily rows for period totals
    let visits = 0, uniques = 0, pageviews = 0, durationSum = 0, bounceSum = 0, dayCount = 0;
    (Array.isArray(agg) ? agg : [agg]).forEach(row => {
      visits    += parseInt(row.visits    || 0);
      uniques   += parseInt(row.uniques   || 0);
      pageviews += parseInt(row.pageviews || 0);
      if (row.avg_duration != null) { durationSum += parseFloat(row.avg_duration); dayCount++; }
      if (row.bounce_rate  != null) bounceSum += parseFloat(row.bounce_rate);
    });
    const avgDuration = dayCount > 0 ? Math.round(durationSum / dayCount) : null;
    const bounceRate  = dayCount > 0 ? parseFloat((bounceSum / dayCount).toFixed(1)) : null;

    // 2. Timeseries (grouped by day or month depending on range)
    const tsAgg = await fathomGet(token, '/aggregations', {
      entity:       'site',
      entity_id:    siteId,
      aggregates:   'visits,uniques',
      date_grouping: grouping,
      date_from:    dateFrom,
      date_to:      dateTo,
    });
    const timeseries = (Array.isArray(tsAgg) ? tsAgg : [tsAgg]).map(row => ({
      date:    row.date,
      visits:  parseInt(row.visits  || 0),
      uniques: parseInt(row.uniques || 0),
    }));

    // 3. Top pages
    const pagesAgg = await fathomGet(token, '/aggregations', {
      entity:       'pageview',
      entity_id:    siteId,
      aggregates:   'pageviews',
      groupby:      'pathname',
      sort_by:      'pageviews:desc',
      limit:        5,
      date_from:    dateFrom,
      date_to:      dateTo,
    });
    const topPages = (Array.isArray(pagesAgg) ? pagesAgg : []).map(r => ({
      page:      r.pathname,
      pageviews: parseInt(r.pageviews || 0),
    }));

    // 4. Referrers
    const refAgg = await fathomGet(token, '/aggregations', {
      entity:    'pageview',
      entity_id: siteId,
      aggregates:'visits',
      groupby:   'referrer_hostname',
      sort_by:   'visits:desc',
      limit:     5,
      date_from: dateFrom,
      date_to:   dateTo,
    });
    const referrers = (Array.isArray(refAgg) ? refAgg : []).map(r => ({
      source: r.referrer_hostname || '(direct)',
      visits: parseInt(r.visits || 0),
    }));

    return Response.json({
      period,
      startDate:       dateFrom,
      endDate:         dateTo,
      fetchedAt:       new Date().toISOString(),
      analyticsSource: 'fathom',
      website: {
        analyticsSource: 'fathom',
        fathomSiteId:    siteId,
        visits,
        uniques,
        pageviews,
        avgDuration,
        bounceRate,
        timeseries,   // day or month grouping depending on range
        topPages,
        referrers,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
