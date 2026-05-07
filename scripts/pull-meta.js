/**
 * pull-meta.js — Pull Meta (Facebook) organic social data
 * Returns: page reach, engagements, followers, top posts
 *
 * Requires env: META_SYSTEM_TOKEN
 */

const BASE = 'https://graph.facebook.com/v21.0';

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}access_token=${process.env.META_SYSTEM_TOKEN}`);
  return res.json();
}

async function getWithPageToken(path, pageToken) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}access_token=${pageToken}`);
  return res.json();
}

async function getPageToken(pageId) {
  const accounts = await get('/me/accounts?fields=id,access_token&limit=100');
  const page = (accounts.data || []).find(p => p.id === pageId);
  return page?.access_token;
}

const HISTORY_START = '2026-01-01'; // pull YTD from this date

function getHistoricalRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const fmt = d => d.toISOString().split('T')[0];
  return {
    since:        Math.floor(new Date(HISTORY_START).getTime() / 1000),
    until:        Math.floor(firstOfThisMonth.getTime() / 1000),
    startDateStr: HISTORY_START,
    endDateStr:   fmt(lastMonthEnd)
  };
}

function getInsightsPeriod() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  const fmt = d => d.toISOString().split('T')[0];
  return {
    since: Math.floor(lastMonthStart.getTime() / 1000),
    until: Math.floor(firstOfThisMonth.getTime() / 1000),
    startDateStr: fmt(lastMonthStart),
    endDateStr:   fmt(new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth() + 1, 0))
  };
}

async function pullMeta(pageId, client) {
  if (!pageId || pageId === 'FILL_IN') {
    console.log('[Meta] No page ID configured — skipping');
    return null;
  }
  if (!process.env.META_SYSTEM_TOKEN) {
    console.log('[Meta] No system token — skipping');
    return null;
  }

  const pageToken = await getPageToken(pageId);
  if (!pageToken) {
    console.log(`[Meta] Page ${pageId} not accessible via system token`);
    return null;
  }

  const { since, until, startDateStr, endDateStr } = getInsightsPeriod();

  // Page insights
  const metrics = [
    'page_impressions_unique',   // unique reach
    'page_post_engagements',
    'page_views_total'
  ].join(',');

  const insights = await getWithPageToken(
    `/${pageId}/insights?metric=${metrics}&period=month&since=${since}&until=${until}`,
    pageToken
  );

  let reach = 0, engagements = 0, pageViews = 0;
  for (const m of insights.data || []) {
    const val = m.values?.[0]?.value || 0;
    if (m.name === 'page_impressions_unique') reach = val;
    if (m.name === 'page_post_engagements')  engagements = val;
    if (m.name === 'page_views_total')        pageViews = val;
  }

  // Follower count (direct field)
  const pageInfo = await get(`/${pageId}?fields=fan_count&access_token=${pageToken}`);
  const followers = pageInfo.fan_count || 0;

  // Top posts this month
  const posts = await getWithPageToken(
    `/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&limit=5&since=${since}&until=${until}`,
    pageToken
  );

  const topPosts = (posts.data || []).map(p => ({
    message:   (p.message || '').substring(0, 100),
    date:      p.created_time,
    likes:     p.likes?.summary?.total_count || 0,
    comments:  p.comments?.summary?.total_count || 0,
    shares:    p.shares?.count || 0
  }));

  // === Meta Ads ===
  let adSpend = null, adClicks = null, adImpressions = null, adLeads = null;
  if (process.env.META_AD_ACCOUNT_ID || client?.metaAdAccountId) {
    const adAcct = process.env.META_AD_ACCOUNT_ID || client.metaAdAccountId;
    const timeRange = JSON.stringify({ since: startDateStr, until: endDateStr });
    const adsUrl = `${BASE}/${adAcct}/insights?fields=spend,actions,clicks,impressions,reach&time_range=${encodeURIComponent(timeRange)}&access_token=${process.env.META_SYSTEM_TOKEN}`;
    const adsRes = await fetch(adsUrl);
    const adsData = await adsRes.json();
    const row = (adsData.data || [])[0] || {};
    adSpend       = row.spend       ? parseFloat(row.spend)       : null;
    adClicks      = row.clicks      ? parseInt(row.clicks)        : null;
    adImpressions = row.impressions ? parseInt(row.impressions)   : null;
    const leadsAction = (row.actions || []).find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.lead');
    adLeads = leadsAction ? parseInt(leadsAction.value) : null;
    if (adSpend != null) console.log(`[Meta Ads] spend=$${adSpend} clicks=${adClicks} impressions=${adImpressions} leads=${adLeads}`);
  }

  console.log(`[Meta Organic] reach=${reach} engagements=${engagements} followers=${followers} posts=${topPosts.length}`);

  // ── Historical monthly data since Jan 1 ──────────────────────────────
  const hist = getHistoricalRange();

    // Pull one month at a time (API limit: 93 days per request)
  const monthlyOrganic = [];
  let cur = new Date(HISTORY_START + 'T00:00:00Z');
  const endCur = new Date(hist.endDateStr + 'T00:00:00Z');
  while (cur <= endCur) {
    const monthStart = Math.floor(cur.getTime() / 1000);
    const nextMonth  = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const monthEnd   = Math.floor(nextMonth.getTime() / 1000);
    const key = cur.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

    const mInsights = await getWithPageToken(
      `/${pageId}/insights?metric=page_impressions_unique,page_post_engagements&period=month&since=${monthStart}&until=${monthEnd}&limit=100`,
      pageToken
    );

    let mReach = null, mEng = null;
    for (const m of mInsights.data || []) {
      const lastVal = m.values && m.values.length ? m.values[m.values.length - 1].value : null;
      if (m.name === 'page_impressions_unique') mReach = lastVal;
      if (m.name === 'page_post_engagements')  mEng   = lastVal;
    }
    monthlyOrganic.push({ month: key, reach: mReach, engagements: mEng });
    cur = nextMonth;
  }
    console.log(`[Meta Historical] ${monthlyOrganic.length} months pulled`);

  // Ads monthly breakdown
  let monthlyAds = [];
  if (process.env.META_AD_ACCOUNT_ID || client?.metaAdAccountId) {
    const adAcctId = process.env.META_AD_ACCOUNT_ID || client.metaAdAccountId;
    const timeRange = encodeURIComponent(JSON.stringify({ since: hist.startDateStr, until: hist.endDateStr }));
    const adsHistUrl = `${BASE}/${adAcctId}/insights?fields=spend,actions,clicks,impressions&time_range=${timeRange}&time_increment=monthly&access_token=${process.env.META_SYSTEM_TOKEN}`;
    const adsHistRes = await fetch(adsHistUrl);
    const adsHistData = await adsHistRes.json();
    monthlyAds = (adsHistData.data || []).map(row => {
      const d = new Date(row.date_start);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      const leadsAct = (row.actions || []).find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.lead');
      return {
        month:         key,
        adSpend:       row.spend       ? parseFloat(row.spend)     : 0,
        adClicks:      row.clicks      ? parseInt(row.clicks)      : 0,
        adImpressions: row.impressions ? parseInt(row.impressions) : 0,
        adLeads:       leadsAct        ? parseInt(leadsAct.value)  : 0
      };
    });
    console.log(`[Meta Ads Historical] ${monthlyAds.length} months pulled`);
  }

  // Merge organic + ads into unified monthly history
  const monthlyHistory = monthlyOrganic.map(m => {
    const ads = monthlyAds.find(a => a.month === m.month) || {};
    return {
      month:         m.month,
      reach:         m.reach,
      engagements:   m.engagements,
      adSpend:       ads.adSpend       ?? null,
      adClicks:      ads.adClicks      ?? null,
      adLeads:       ads.adLeads       ?? null
    };
  });

  return { reach, engagements, pageViews, followers, topPosts, adSpend, adClicks, adImpressions, adLeads, monthlyHistory };
}

module.exports = { pullMeta };
