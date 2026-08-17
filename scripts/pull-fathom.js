/**
 * pull-fathom.js
 * Pulls web analytics data from Fathom Analytics API for PKG001/PKG002 clients.
 * Replaces pull-cf-analytics.js for clients with fathomSiteId set in clients.json.
 *
 * KPIs pulled:
 *   - uniques      (unique visitors — deduplicated daily hash)
 *   - visits       (sessions)
 *   - pageviews    (total page views)
 *   - avg_duration (avg session duration in seconds)
 *   - bounce_rate  (bounce rate %)
 *   - top pages    (pathname breakdown, top 5)
 *   - referrer sources (top 5)
 *   - daily timeseries (last 30 days)
 *   - monthly history (last 6 months)
 *
 * Auth: Bearer token from FATHOM_API_TOKEN env var.
 * API base: https://api.usefathom.com/v1
 */

const FATHOM_API_BASE = 'https://api.usefathom.com/v1';

function getToken() {
  const token = process.env.FATHOM_API_TOKEN;
  if (!token) throw new Error('FATHOM_API_TOKEN env var is not set');
  return `Bearer ${token}`;
}

async function fathomGet(path, params = {}) {
  const url = `${FATHOM_API_BASE}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, {
    headers: { Authorization: getToken(), Accept: 'application/json' }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fathom API error ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Format a Date as YYYY-MM-DD
 */
function fmt(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for "last N days" ending today
 */
function lastNDays(n) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - n);
  return { date_from: fmt(from), date_to: fmt(to) };
}

/**
 * Get start of month N months ago
 */
function monthStart(monthsAgo) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return fmt(d);
}

/**
 * Pull all Fathom analytics for a given site ID.
 * Returns the `website` block for data/<slug>.json
 *
 * @param {string} siteId  - Fathom site ID
 * @param {Date}   [refDate] - Reference date for the report month (defaults to today).
 *                             Pass the first day of the desired month to pull a specific month.
 *                             e.g. new Date(2026, 6, 1) for July 2026.
 */
async function pullFathom(siteId, refDate) {
  const now = refDate ? new Date(refDate) : new Date();

  // --- Report month range (always full calendar month) ---
  const monthFrom = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
  // If reporting on the current month, cap at today; otherwise use last day of month
  const isCurrentMonth = (() => { const t = new Date(); return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth(); })();
  const monthTo = isCurrentMonth ? fmt(new Date()) : fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  // 1. Top-level KPIs for current month
  const [kpiResult] = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
    date_from: monthFrom,
    date_to: monthTo
  });

  const uniques = parseInt(kpiResult?.uniques || 0, 10);
  const visits = parseInt(kpiResult?.visits || 0, 10);
  const pageviews = parseInt(kpiResult?.pageviews || 0, 10);
  const avgDuration = kpiResult?.avg_duration ? Math.round(parseFloat(kpiResult.avg_duration)) : null;
  const bounceRate = kpiResult?.bounce_rate ? parseFloat(kpiResult.bounce_rate) : null;

  // 2. Prior month KPIs for deltas
  const prevMonthFrom = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevMonthTo = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
  const [prevKpi] = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'visits,uniques,pageviews',
    date_from: prevMonthFrom,
    date_to: prevMonthTo
  });

  const prevUniques = parseInt(prevKpi?.uniques || 0, 10);
  const prevVisits = parseInt(prevKpi?.visits || 0, 10);
  const prevPageviews = parseInt(prevKpi?.pageviews || 0, 10);

  function delta(current, previous) {
    if (!previous || previous === 0) return null;
    // Suppress extreme deltas caused by first month of tracking (no real baseline)
    const pct = parseFloat(((current - previous) / previous * 100).toFixed(1));
    if (Math.abs(pct) >= 95) return null; // not meaningful — likely first month of data
    return pct;
  }

  // 3. Daily timeseries — scoped to report month (not a rolling 30-day window)
  const dailyRaw = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'visits,uniques,pageviews',
    date_from: monthFrom,
    date_to: monthTo,
    date_grouping: 'day'
  });

  const dailyTimeseries = (dailyRaw || []).map(row => ({
    date: row.date,
    visits: parseInt(row.visits || 0, 10),
    uniques: parseInt(row.uniques || 0, 10),
    pageviews: parseInt(row.pageviews || 0, 10)
  }));

  // 4. Monthly history — last 6 months
  const sixMonthsAgo = monthStart(5); // start of 5 months ago
  const monthlyRaw = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'visits,uniques,pageviews',
    date_from: sixMonthsAgo,
    date_to: monthTo,
    date_grouping: 'month'
  });

  const monthlyHistory = (monthlyRaw || []).map(row => {
    const d = new Date(row.date + 'T00:00:00Z');
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    return {
      month: label,
      date: row.date,
      visits: parseInt(row.visits || 0, 10),
      uniques: parseInt(row.uniques || 0, 10),
      pageviews: parseInt(row.pageviews || 0, 10)
    };
  });

  // 5. Top pages — current month
  const topPagesRaw = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'pageviews,uniques',
    date_from: monthFrom,
    date_to: monthTo,
    field_grouping: 'pathname',
    sort_by: 'pageviews:desc',
    limit: 5
  });

  const topPages = (topPagesRaw || []).map(row => ({
    path: row.pathname,
    pageviews: parseInt(row.pageviews || 0, 10),
    uniques: parseInt(row.uniques || 0, 10)
  }));

  // 6. Referrer sources — current month
  const referrersRaw = await fathomGet('/aggregations', {
    entity: 'pageview',
    entity_id: siteId,
    aggregates: 'visits,uniques',
    date_from: monthFrom,
    date_to: monthTo,
    field_grouping: 'referrer_source',
    sort_by: 'visits:desc',
    limit: 5
  });

  const referrers = (referrersRaw || []).map(row => ({
    source: row.referrer_source || 'Direct',
    visits: parseInt(row.visits || 0, 10),
    uniques: parseInt(row.uniques || 0, 10)
  }));

  return {
    // Source flag — used by dashboard to know which analytics system to render
    analyticsSource: 'fathom',
    fathomSiteId: siteId,

    // Current month top-level KPIs
    uniques,
    visits,
    pageviews,
    avgDuration,
    bounceRate,

    // MoM deltas (%)
    uniquesDelta: delta(uniques, prevUniques),
    visitsDelta: delta(visits, prevVisits),
    pageviewsDelta: delta(pageviews, prevPageviews),

    // Timeseries
    dailyTimeseries,   // last 30 days, daily
    monthlyHistory,    // last 6 months, monthly

    // Breakdowns
    topPages,
    referrers,

    // Legacy CF fields — null to signal migration complete
    cfPageViews: null,
    cfUniques: null,
    cfPageViewsDelta: null,
    cfUniquesDelta: null,
    cfDailyPageViews: null,
    cfMonthlyHistory: null,

    // PageSpeed vitals carried through unchanged
    vitals: null
  };
}

module.exports = { pullFathom };
