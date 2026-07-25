#!/usr/bin/env node
/**
 * pull-cf-analytics.js
 * Pull traffic data from Cloudflare Zone Analytics GraphQL API.
 * Uses the same CF API token already in use — no new scope required.
 *
 * Returns:
 *   pageViewsThisMonth    - total page views in the reporting period
 *   uniqueVisitorsThisMonth - unique IPs in the reporting period
 *   pageViewsDelta        - % change vs prior period
 *   uniquesDelta          - % change vs prior period
 *   dailyPageViews        - array of { date, pageViews, uniques } for the last 30 days
 *   topMonths             - array of { month, pageViews, uniques } last 6 months
 */

'use strict';

const CF_GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';

/**
 * @param {string} zoneTag   - Cloudflare Zone ID for the site
 * @returns {Object|null}
 */
async function pullCFAnalytics(zoneTag) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) { console.log('  CF Analytics: SKIPPED (no CLOUDFLARE_API_TOKEN)'); return null; }
  if (!zoneTag || zoneTag === 'FILL_IN' || zoneTag === 'FILL_IN_AT_GOLIVE') { console.log('  CF Analytics: SKIPPED (no zoneTag)'); return null; }

  try {
    const now = new Date();

    // Current period: first of last month → last day of last month
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

    // Prior period (same duration, month before)
    const priorStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const priorEnd   = new Date(now.getFullYear(), now.getMonth() - 1, 0);

    // Also pull last 30 days for sparkline
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const fmt = d => d.toISOString().split('T')[0];

    // Query 1: daily data (current month, prior month, last 30 days)
    const query1 = `{
      viewer {
        zones(filter: { zoneTag: "${zoneTag}" }) {
          current: httpRequests1dGroups(
            limit: 31
            filter: { date_geq: "${fmt(periodStart)}", date_leq: "${fmt(periodEnd)}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { pageViews }
            uniq { uniques }
          }
          prior: httpRequests1dGroups(
            limit: 31
            filter: { date_geq: "${fmt(priorStart)}", date_leq: "${fmt(priorEnd)}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { pageViews }
            uniq { uniques }
          }
          recent: httpRequests1dGroups(
            limit: 30
            filter: { date_geq: "${fmt(thirtyDaysAgo)}", date_leq: "${fmt(now)}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { pageViews }
            uniq { uniques }
          }
        }
      }
    }`;

    // Query 2: monthly rollup via 1d data (6 months back)
    // Note: httpRequests1mGroups requires paid plan — we aggregate daily rows instead
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const query2 = `{
      viewer {
        zones(filter: { zoneTag: "${zoneTag}" }) {
          httpRequests1dGroups(
            limit: 185
            filter: { date_geq: "${fmt(sixMonthsAgo)}", date_leq: "${fmt(now)}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { pageViews }
            uniq { uniques }
          }
        }
      }
    }`;

    const cfFetch = async (q) => {
      const r = await fetch(CF_GRAPHQL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (!r.ok) throw new Error(`CF GraphQL HTTP ${r.status}`);
      const j = await r.json();
      if (j.errors) throw new Error(j.errors[0].message);
      return j.data?.viewer?.zones?.[0];
    };

    const [zone1, zone2] = await Promise.all([cfFetch(query1), cfFetch(query2)]);
    if (!zone1) throw new Error('No zone data returned');

    // Aggregate current month
    const currentRows  = zone1.current  || [];
    const priorRows    = zone1.prior    || [];
    const recentRows   = zone1.recent   || [];
    // Aggregate daily rows into monthly buckets
    const dailyHistoryRows = (zone2 && zone2.httpRequests1dGroups) || [];
    const monthMap = {};
    for (const row of dailyHistoryRows) {
      const dt = new Date(row.dimensions.date + 'T12:00:00Z');
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { pageViews: 0, uniques: 0 };
      monthMap[key].pageViews += row.sum?.pageViews || 0;
      monthMap[key].uniques  += row.uniq?.uniques  || 0;
    }
    const monthlyRows = Object.entries(monthMap).sort(([a],[b])=>a.localeCompare(b));

    const sumPageViews  = rows => rows.reduce((s, r) => s + (r.sum?.pageViews || 0), 0);
    const sumUniques    = rows => rows.reduce((s, r) => s + (r.uniq?.uniques  || 0), 0);

    const curPV  = sumPageViews(currentRows);
    const curUni = sumUniques(currentRows);
    const prPV   = sumPageViews(priorRows);
    const prUni  = sumUniques(priorRows);

    const delta = (cur, prev) => {
      if (!prev) return null;
      return parseFloat(((cur - prev) / prev * 100).toFixed(1));
    };

    // Format month label e.g. "Jul 2026"
    const monthLabel = d => {
      const dt = new Date(d + 'T12:00:00Z');
      return dt.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

    return {
      pageViewsThisMonth:      curPV,
      uniqueVisitorsThisMonth: curUni,
      pageViewsDelta:          delta(curPV, prPV),
      uniquesDelta:            delta(curUni, prUni),
      dailyPageViews: recentRows.map(r => ({
        date:      r.dimensions.date,
        pageViews: r.sum?.pageViews || 0,
        uniques:   r.uniq?.uniques  || 0
      })),
      monthlyHistory: monthlyRows.map(([key, vals]) => ({
        month:     monthLabel(key + '-01'),
        pageViews: vals.pageViews,
        uniques:   vals.uniques
      }))
    };

  } catch (err) {
    console.log('  CF Analytics: ERROR —', err.message);
    return null;
  }
}

module.exports = { pullCFAnalytics };
