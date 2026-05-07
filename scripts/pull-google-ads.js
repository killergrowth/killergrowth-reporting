/**
 * pull-google-ads.js — Pull Google Ads campaign performance data
 *
 * PRIMARY PATH (when GOOGLE_ADS_SHEET_ID is set):
 *   Reads from the "all_clients" tab of the KG Google Ads Data Sheet.
 *   Sheet is populated daily by Google Ads Scripts running inside each client account.
 *   Requires env: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_ADS_SHEET_ID
 *
 * FALLBACK PATH (direct API — blocked until developer token is approved):
 *   Requires env: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET,
 *                 GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN,
 *                 GOOGLE_ADS_LOGIN_CUSTOMER_ID
 *
 * Sheet tab: all_clients
 * Columns:   client_id | date | campaign_name | impressions | clicks | cost_usd | conversions
 */

const { GoogleAuth } = require('google-auth-library');

// ---------------------------------------------------------------------------
// Sheet-based path (primary)
// ---------------------------------------------------------------------------

async function getSheetToken() {
  const raw         = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const credentials = raw ? JSON.parse(raw) : require('./service-account.json');
  const auth        = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client      = await auth.getClient();
  const { token }   = await client.getAccessToken();
  return token;
}

async function readSheetRange(spreadsheetId, range, token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API ${res.status}: ${err.substring(0, 200)}`);
  }
  return res.json();
}

// Normalize dates from Google Sheets — handles both '2026-01-01' and '1/1/2026' formats
function normalizeDate(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already ISO
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return s;
}

async function pullGoogleAdsFromSheet(slug) {
  const sheetId = process.env.GOOGLE_ADS_SHEET_ID;
  if (!sheetId) return null;

  const token = await getSheetToken();

  // Read all_clients tab (skip header row)
  const data = await readSheetRange(sheetId, 'all_clients!A2:G', token);
  const rows = data.values || [];

  if (rows.length === 0) {
    console.log('[Google Ads] all_clients tab is empty');
    return null;
  }

  // Filter to this client
  // Columns: [client_id, date, campaign_name, impressions, clicks, cost_usd, conversions]
  const clientRows = rows
    .filter(r => r[0] === slug && r[1])
    .map(r => ({
      date:         normalizeDate(r[1]),
      campaignName: r[2] || '',
      impressions:  parseInt(r[3])   || 0,
      clicks:       parseInt(r[4])   || 0,
      cost:         parseFloat(r[5]) || 0,
      conversions:  parseFloat(r[6]) || 0,
    }));

  if (clientRows.length === 0) {
    console.log(`[Google Ads] No sheet data for client: ${slug}`);
    return null;
  }

  const fmtDate = d => d.toISOString().split('T')[0];
  const now     = new Date();

  // --- Last full month totals ---
  const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lmEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
  const lmRows  = clientRows.filter(r => r.date >= fmtDate(lmStart) && r.date <= fmtDate(lmEnd));

  let totalSpend = 0, totalClicks = 0, totalLeads = 0;
  const campaignMap = {};

  for (const r of lmRows) {
    totalSpend  += r.cost;
    totalClicks += r.clicks;
    totalLeads  += r.conversions;

    if (!campaignMap[r.campaignName]) {
      campaignMap[r.campaignName] = { name: r.campaignName, spend: 0, clicks: 0, leads: 0 };
    }
    campaignMap[r.campaignName].spend  += r.cost;
    campaignMap[r.campaignName].clicks += r.clicks;
    campaignMap[r.campaignName].leads  += r.conversions;
  }

  const campaigns = Object.values(campaignMap)
    .map(c => ({
      name:   c.name,
      spend:  Math.round(c.spend  * 100) / 100,
      clicks: c.clicks,
      leads:  Math.round(c.leads),
    }))
    .filter(c => c.spend > 0 || c.clicks > 0)
    .sort((a, b) => b.spend - a.spend);

  // --- Monthly breakdown (last 5 months) ---
  const monthlyBreakdown = [];
  for (let i = 4; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i, 0);
    const label = start.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    const mRows = clientRows.filter(r => r.date >= fmtDate(start) && r.date <= fmtDate(end));
    let mSpend = 0, mClicks = 0, mLeads = 0;
    for (const r of mRows) {
      mSpend  += r.cost;
      mClicks += r.clicks;
      mLeads  += r.conversions;
    }
    monthlyBreakdown.push({
      month:    label,
      adSpend:  Math.round(mSpend  * 100) / 100,
      adClicks: mClicks,
      adLeads:  Math.round(mLeads),
    });
  }

  const costPerLead = totalLeads > 0
    ? Math.round((totalSpend / totalLeads) * 100) / 100
    : null;

  console.log(`[Google Ads] [Sheet] spend=$${totalSpend.toFixed(2)} clicks=${totalClicks} leads=${Math.round(totalLeads)} cpl=${costPerLead}`);

  return {
    spend:            Math.round(totalSpend  * 100) / 100,
    clicks:           totalClicks,
    leads:            Math.round(totalLeads),
    costPerLead,
    campaigns,
    monthlyBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Direct API path (fallback — returns null gracefully when token not approved)
// ---------------------------------------------------------------------------

const API_VERSION = 'v19';
const BASE        = `https://googleads.googleapis.com/${API_VERSION}`;

async function getAdsAccessToken() {
  const body = new URLSearchParams({
    client_id:     process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type:    'refresh_token',
  });
  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Could not get Google Ads access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function gaqlSearch(customerId, query, accessToken) {
  const headers = {
    Authorization:    `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    'Content-Type':   'application/json',
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
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 0);
  const fmt   = d => d.toISOString().split('T')[0];
  return { since: fmt(start), until: fmt(end) };
}

function getMonthlyDateRanges() {
  const ranges = [];
  const now    = new Date();
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

async function pullGoogleAdsDirect(customerId) {
  if (!customerId || customerId === 'FILL_IN') {
    console.log('[Google Ads] No customer ID — skipping');
    return null;
  }
  const requiredEnv = [
    'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN',
  ];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.log(`[Google Ads] Missing env: ${key} — skipping`);
      return null;
    }
  }

  try {
    const accessToken = await getAdsAccessToken();
    const { since, until } = getDateRange();
    const cid = customerId.replace(/-/g, '');

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
      const spend  = (r.metrics?.costMicros || 0) / 1_000_000;
      const clicks = r.metrics?.clicks || 0;
      const leads  = Math.round(r.metrics?.conversions || r.metrics?.allConversions || 0);
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
          month:    range.label,
          adSpend:  Math.round(mSpend * 100) / 100,
          adClicks: mClicks,
          adLeads:  mLeads,
        });
      } catch (e) {
        monthlyBreakdown.push({ month: range.label, adSpend: 0, adClicks: 0, adLeads: 0 });
      }
    }

    const costPerLead = totalLeads > 0
      ? Math.round((totalSpend / totalLeads) * 100) / 100
      : null;

    console.log(`[Google Ads] [API] spend=$${totalSpend.toFixed(2)} clicks=${totalClicks} leads=${totalLeads} cpl=${costPerLead}`);

    return {
      spend:        Math.round(totalSpend * 100) / 100,
      clicks:       totalClicks,
      leads:        totalLeads,
      costPerLead,
      campaigns,
      monthlyBreakdown,
    };
  } catch (e) {
    console.warn('[Google Ads] API error:', e.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public export — Sheet first, API fallback
// ---------------------------------------------------------------------------

async function pullGoogleAds(customerId, slug) {
  // Primary: read from Sheet (no developer token needed)
  if (process.env.GOOGLE_ADS_SHEET_ID && slug) {
    try {
      const result = await pullGoogleAdsFromSheet(slug);
      if (result) return result;
    } catch (e) {
      console.warn('[Google Ads] Sheet read failed:', e.message, '— trying direct API');
    }
  }

  // Fallback: direct API (gracefully returns null until token is approved)
  return pullGoogleAdsDirect(customerId);
}

module.exports = { pullGoogleAds };
