/**
 * pull-google-ads.js — Pull Google Ads data from per-client Sheets
 *
 * PRIMARY PATH:
 *   1. Reads KG Client Directory (KG_CLIENT_DIRECTORY_SHEET_ID env var)
 *   2. Finds this client's per-client Sheet ID (matched by slug)
 *   3. Reads ads_campaigns tab, aggregates to monthly shape
 *
 * FALLBACK PATH (legacy — single GOOGLE_ADS_SHEET_ID):
 *   Reads the old "KG Google Ads Data" all_clients tab.
 *   Used during migration. Remove once all clients are on per-client Sheets.
 *
 * LAST RESORT FALLBACK (direct API — blocked until developer token approved):
 *   Requires GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET,
 *   GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN
 *
 * Requires env: GOOGLE_SERVICE_ACCOUNT_JSON
 */

const { GoogleAuth } = require('google-auth-library');

// ---------------------------------------------------------------------------
// Auth + Sheets helpers
// ---------------------------------------------------------------------------

async function getReadToken() {
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

async function readSheet(spreadsheetId, range, token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) throw Object.assign(new Error(`Sheet not found: ${spreadsheetId}`), { code: 404 });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API ${res.status}: ${err.substring(0, 200)}`);
  }
  const d = await res.json();
  return d.values || [];
}

// ---------------------------------------------------------------------------
// Date normalization (handles ISO + US locale + Date objects from Sheets)
// ---------------------------------------------------------------------------

function normalizeDate(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return s;
}

// ---------------------------------------------------------------------------
// Aggregation — shared by all read paths
// ---------------------------------------------------------------------------

function aggregateRows(rows) {
  // rows: [{date, campaignName, cost, clicks, conversions, impressions}]
  const fmtDate = d => d.toISOString().split('T')[0];
  const now     = new Date();

  // Last full month
  const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lmEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
  const lmRows  = rows.filter(r => r.date >= fmtDate(lmStart) && r.date <= fmtDate(lmEnd));

  let totalSpend = 0, totalClicks = 0, totalLeads = 0;
  const campaignMap = {};

  for (const r of lmRows) {
    totalSpend  += r.cost;
    totalClicks += r.clicks;
    totalLeads  += r.conversions;

    if (!campaignMap[r.campaignName]) {
      campaignMap[r.campaignName] = { name: r.campaignName, spend: 0, clicks: 0, leads: 0 };
    }
    campaignMap[r.campaignName].spend       += r.cost;
    campaignMap[r.campaignName].clicks      += r.clicks;
    campaignMap[r.campaignName].leads       += r.conversions;
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

  // Monthly breakdown — last 5 months
  const monthlyBreakdown = [];
  for (let i = 4; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i, 0);
    const label = start.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const mRows = rows.filter(r => r.date >= fmtDate(start) && r.date <= fmtDate(end));
    let mSpend = 0, mClicks = 0, mLeads = 0;
    for (const r of mRows) { mSpend += r.cost; mClicks += r.clicks; mLeads += r.conversions; }
    monthlyBreakdown.push({
      month:    label,
      adSpend:  Math.round(mSpend  * 100) / 100,
      adClicks: mClicks,
      adLeads:  Math.round(mLeads),
    });
  }

  const costPerLead = totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 100) / 100 : null;

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
// Primary path: per-client Sheet via KG Client Directory
// ---------------------------------------------------------------------------

async function pullFromClientSheet(slug, token) {
  const dirId = process.env.KG_CLIENT_DIRECTORY_SHEET_ID;
  if (!dirId) return null;

  // Read directory to find client's Sheet ID
  let dirRows;
  try {
    dirRows = await readSheet(dirId, 'clients!A2:K', token);
  } catch (e) {
    console.warn('[Google Ads] Directory read failed:', e.message);
    return null;
  }

  // Header: client_id(0) client_name(1) sheet_id(2) sheet_url(3) active_sources(4) status(5) ...
  const clientRow = dirRows.find(r => r[0] === slug && r[5] !== 'inactive');
  if (!clientRow) {
    console.log(`[Google Ads] Client '${slug}' not found in directory or inactive`);
    return null;
  }

  const activeSources = (clientRow[4] || '').split(',').map(s => s.trim());
  if (!activeSources.includes('ads')) {
    console.log(`[Google Ads] '${slug}' does not have 'ads' in active_sources — skipping`);
    return null;
  }

  const clientSheetId = clientRow[2];
  if (!clientSheetId) {
    console.warn(`[Google Ads] '${slug}' has no sheet_id in directory — skipping`);
    return null;
  }

  // Read ads_campaigns tab
  // Columns: date(0) campaign_id(1) campaign_name(2) ... cost_usd(8) ... clicks(7) ... conversions(11)
  let campaignRows;
  try {
    campaignRows = await readSheet(clientSheetId, 'ads_campaigns!A2:AA', token);
  } catch (e) {
    if (e.code === 404) {
      console.warn(`[Google Ads] Client Sheet not found for '${slug}': ${clientSheetId}`);
    } else {
      console.warn(`[Google Ads] ads_campaigns read failed for '${slug}':`, e.message);
    }
    return null;
  }

  if (campaignRows.length === 0) {
    console.log(`[Google Ads] ads_campaigns tab empty for '${slug}'`);
    return null;
  }

  const parsed = campaignRows
    .filter(r => r[0]) // skip empty rows
    .map(r => ({
      date:         normalizeDate(r[0]),
      campaignName: r[2] || '',
      impressions:  parseInt(r[6])   || 0,
      clicks:       parseInt(r[7])   || 0,
      cost:         parseFloat(r[8]) || 0,
      conversions:  parseFloat(r[11]) || 0,
    }));

  if (parsed.length === 0) {
    console.log(`[Google Ads] No parseable rows for '${slug}'`);
    return null;
  }

  const result = aggregateRows(parsed);
  console.log(`[Google Ads] [per-client sheet] ${slug}: spend=$${result.spend} clicks=${result.clicks} leads=${result.leads} cpl=${result.costPerLead}`);
  return result;
}

// ---------------------------------------------------------------------------
// Legacy path: old "KG Google Ads Data" all_clients tab
// ---------------------------------------------------------------------------

async function pullFromLegacySheet(slug, token) {
  const sheetId = process.env.GOOGLE_ADS_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readSheet(sheetId, 'all_clients!A2:G', token);
  if (rows.length === 0) {
    console.log('[Google Ads] Legacy all_clients tab is empty');
    return null;
  }

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
    console.log(`[Google Ads] No legacy sheet data for: ${slug}`);
    return null;
  }

  const result = aggregateRows(clientRows);
  console.log(`[Google Ads] [legacy sheet] ${slug}: spend=$${result.spend} clicks=${result.clicks} leads=${result.leads}`);
  return result;
}

// ---------------------------------------------------------------------------
// Direct API fallback (returns null gracefully until token approved)
// ---------------------------------------------------------------------------

const API_VERSION = 'v19';
const BASE        = `https://googleads.googleapis.com/${API_VERSION}`;

async function getAdsToken() {
  const body = new URLSearchParams({
    client_id:     process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type:    'refresh_token',
  });
  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function gaqlSearch(cid, query, accessToken) {
  const headers = {
    Authorization:     `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    'Content-Type':    'application/json',
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const res = await fetch(`${BASE}/customers/${cid}/googleAds:search`, {
    method: 'POST', headers, body: JSON.stringify({ query }),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Google Ads API ${res.status}: ${e.substring(0, 300)}`); }
  return res.json();
}

async function pullGoogleAdsDirect(customerId) {
  if (!customerId || customerId === 'FILL_IN') return null;
  const required = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN'];
  for (const k of required) { if (!process.env[k]) { console.log(`[Google Ads] Missing ${k} — skipping`); return null; } }

  try {
    const accessToken = await getAdsToken();
    const cid = customerId.replace(/-/g, '');
    const now   = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const until = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    const q = `SELECT campaign.name, metrics.cost_micros, metrics.clicks, metrics.conversions, metrics.all_conversions
      FROM campaign WHERE segments.date BETWEEN '${since}' AND '${until}' AND campaign.status = 'ENABLED' ORDER BY metrics.cost_micros DESC`;
    const d = await gaqlSearch(cid, q, accessToken);
    const rows = (d.results || []).map(r => ({
      date: since, campaignName: r.campaign?.name || '',
      cost: (r.metrics?.costMicros || 0) / 1e6,
      clicks: r.metrics?.clicks || 0,
      conversions: r.metrics?.conversions || r.metrics?.allConversions || 0,
      impressions: 0,
    }));
    const result = aggregateRows(rows);
    console.log(`[Google Ads] [direct API] spend=$${result.spend} clicks=${result.clicks}`);
    return result;
  } catch (e) {
    console.warn('[Google Ads] API error:', e.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public export — directory → legacy sheet → direct API
// ---------------------------------------------------------------------------

async function pullGoogleAds(customerId, slug) {
  const token = await getReadToken().catch(() => null);

  // 1. Per-client Sheet via directory (primary)
  if (token && slug && process.env.KG_CLIENT_DIRECTORY_SHEET_ID) {
    try {
      const result = await pullFromClientSheet(slug, token);
      if (result) return result;
    } catch (e) {
      console.warn('[Google Ads] Per-client sheet error:', e.message);
    }
  }

  // 2. Legacy all_clients Sheet
  if (token && slug && process.env.GOOGLE_ADS_SHEET_ID) {
    try {
      const result = await pullFromLegacySheet(slug, token);
      if (result) return result;
    } catch (e) {
      console.warn('[Google Ads] Legacy sheet error:', e.message);
    }
  }

  // 3. Direct API (gracefully null when token not approved)
  return pullGoogleAdsDirect(customerId);
}

module.exports = { pullGoogleAds };
