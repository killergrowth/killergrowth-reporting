/**
 * pull-google-ads.js — Pull Google Ads campaign performance data
 *
 * Requires env vars:
 *   GOOGLE_ADS_CLIENT_ID
 *   GOOGLE_ADS_CLIENT_SECRET
 *   GOOGLE_ADS_REFRESH_TOKEN
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID  (MCC/manager account ID, no dashes)
 *
 * Client config needs: googleAdsCustomerId (no dashes)
 */

const API_VERSION = 'v19';
const BASE = `https://googleads.googleapis.com/${API_VERSION}`;

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id:     process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type:    'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Could not get Google Ads access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function gaqlSearch(customerId, query, accessToken) {
  const headers = {
    'Authorization':    `Bearer ${accessToken}`,
    'developer-token':  process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    'Content-Type':     'application/json',
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  }
  const res = await fetch(`${BASE}/customers/${customerId}/googleAds:search`, {
    method:  'POST',
    headers,
    body:    JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Ads API ${res.status}: ${errText.substring(0, 300)}`);
  }
  return res.json();
}

function getDateRange() {
  const now    = new Date();
  const start  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end    = new Date(now.getFullYear(), now.getMonth(), 0);
  const fmt    = d => d.toISOString().split('T')[0];
  return { since: fmt(start), until: fmt(end) };
}

function getMonthlyDateRanges() {
  const ranges = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i, 0);
    ranges.push({
      label: start.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      since: start.toISOString().split('T')[0],
      until: end.toISOString().split('T')[0],
    });
  }
  return ranges;
}

async function pullGoogleAds(customerId) {
  if (!customerId || customerId === 'FILL_IN') {
    console.log('[Google Ads] No customer ID — skipping');
    return null;
  }
  const requiredEnv = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.log(`[Google Ads] Missing env: ${key} — skipping`);
      return null;
    }
  }

  try {
    const accessToken = await getAccessToken();
    const { since, until } = getDateRange();
    const cid = customerId.replace(/-/g, '');

    // Campaign-level metrics for the last full month
    const campaignQuery = `
      SELECT
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions,
        metrics.all_conversions
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND campaign.status = 'ENABLED'
      ORDER BY metrics.cost_micros DESC
    `;

    const campaignData = await gaqlSearch(cid, campaignQuery, accessToken);
    const rows = campaignData.results || [];

    let totalSpend = 0, totalClicks = 0, totalLeads = 0;
    const campaigns = rows.map(r => {
      const spend   = (r.metrics?.costMicros || 0) / 1_000_000;
      const clicks  = r.metrics?.clicks || 0;
      const leads   = Math.round(r.metrics?.conversions || r.metrics?.allConversions || 0);
      totalSpend  += spend;
      totalClicks += clicks;
      totalLeads  += leads;
      return {
        name:   r.campaign?.name || 'Unknown',
        spend:  Math.round(spend * 100) / 100,
        clicks,
        leads,
      };
    }).filter(c => c.spend > 0 || c.clicks > 0);

    // Monthly breakdown
    const monthlyBreakdown = [];
    for (const range of getMonthlyDateRanges()) {
      const mQuery = `
        SELECT metrics.cost_micros, metrics.clicks, metrics.conversions
        FROM customer
        WHERE segments.date BETWEEN '${range.since}' AND '${range.until}'
      `;
      try {
        const mData = await gaqlSearch(cid, mQuery, accessToken);
        const mRows = mData.results || [];
        let mSpend = 0, mClicks = 0, mLeads = 0;
        for (const r of mRows) {
          mSpend  += (r.metrics?.costMicros || 0) / 1_000_000;
          mClicks += r.metrics?.clicks || 0;
          mLeads  += Math.round(r.metrics?.conversions || 0);
        }
        monthlyBreakdown.push({
          month:   range.label,
          adSpend: Math.round(mSpend * 100) / 100,
          adClicks: mClicks,
          adLeads:  mLeads,
        });
      } catch (e) {
        monthlyBreakdown.push({ month: range.label, adSpend: 0, adClicks: 0, adLeads: 0 });
      }
    }

    const costPerLead = totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 100) / 100 : null;

    console.log(`[Google Ads] spend=$${totalSpend.toFixed(2)} clicks=${totalClicks} leads=${totalLeads} cpl=${costPerLead}`);

    return {
      spend:        Math.round(totalSpend * 100) / 100,
      clicks:       totalClicks,
      leads:        totalLeads,
      costPerLead,
      campaigns,
      monthlyBreakdown,
    };
  } catch (e) {
    console.warn('[Google Ads] Error:', e.message);
    return null;
  }
}

module.exports = { pullGoogleAds };
