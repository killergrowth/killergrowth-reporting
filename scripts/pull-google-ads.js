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

function aggregateRows(rows, conversionRows) {
  // rows: [{date, campaignName, cost, clicks, conversions, impressions}]
  // conversionRows (optional): [{date, conversionActionCategory, conversionActionName, conversions}]
  const fmtDate = d => d.toISOString().split('T')[0];
  const now     = new Date();

  // Current period: current month MTD if we have data for it, else last full month
  const cmStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const cmEnd      = now; // today
  const cmRows     = rows.filter(r => r.date >= fmtDate(cmStart) && r.date <= fmtDate(cmEnd));
  const lmStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lmEnd      = new Date(now.getFullYear(), now.getMonth(), 0);
  // Use current month if it has data, otherwise fall back to last full month
  const useCurrent = cmRows.length > 0 && cmRows.some(r => r.cost > 0 || r.clicks > 0);
  const lmRows     = useCurrent ? cmRows : rows.filter(r => r.date >= fmtDate(lmStart) && r.date <= fmtDate(lmEnd));
  const periodStart = useCurrent ? cmStart : lmStart;
  const periodEnd   = useCurrent ? cmEnd   : lmEnd;
  console.log('[Google Ads] Using period:', useCurrent ? 'current month MTD' : 'last full month', fmtDate(periodStart), '-', fmtDate(periodEnd), '| rows:', lmRows.length);

  let totalSpend = 0, totalClicks = 0, totalLeads = 0, totalPhoneCallsMetric = 0;
  const campaignMap = {};

  let totalImpressions = 0;
  for (const r of lmRows) {
    totalSpend            += r.cost;
    totalClicks           += r.clicks;
    totalLeads            += r.conversions;
    totalImpressions      += (r.impressions || 0);
    totalPhoneCallsMetric += (r.phoneCalls  || 0);

    if (!campaignMap[r.campaignName]) {
      campaignMap[r.campaignName] = { name: r.campaignName, spend: 0, clicks: 0, leads: 0, impressions: 0 };
    }
    campaignMap[r.campaignName].spend       += r.cost;
    campaignMap[r.campaignName].clicks      += r.clicks;
    campaignMap[r.campaignName].leads       += r.conversions;
    campaignMap[r.campaignName].impressions += (r.impressions || 0);
  }

  const campaigns = Object.values(campaignMap)
    .map(c => ({
      name:        c.name,
      spend:       Math.round(c.spend  * 100) / 100,
      clicks:      c.clicks,
      leads:       Math.round(c.leads),
      impressions: c.impressions,
    }))
    .filter(c => c.spend > 0 || c.clicks > 0)
    .sort((a, b) => b.spend - a.spend);

  // Phone call name/category matchers — defined here so convTotalsForPeriod can use them
  const PHONE_CALL_NAMES_LOCAL = [
    'business profile - tracked call',
    'business profile - call',
    'gbp - clicks to call',
    'calls from ads',
  ];
  const PHONE_CALL_CATEGORIES_LOCAL = ['PHONE_CALL_LEAD', 'AD_CALL', 'CALLS_FROM_ADS'];

  // Helper: compute phone + form totals from conversionRows for a date window
  function convTotalsForPeriod(pStart, pEnd) {
    if (!conversionRows || !conversionRows.length) return { phoneCalls: null, allConversions: null, formSubmissions: null };
    const pRows = conversionRows.filter(r => r.date >= fmtDate(pStart) && r.date <= fmtDate(pEnd));
    let phoneTotal = 0, phoneCallsMetric = 0, allConvTotal = 0, formTotal = 0;
    // phone_calls metric from main rows
    const mainPRows = rows.filter(r => r.date >= fmtDate(pStart) && r.date <= fmtDate(pEnd));
    for (const r of mainPRows) phoneCallsMetric += (r.phoneCalls || 0);
    for (const r of pRows) {
      allConvTotal += r.allConversions;
      const nameLower = (r.conversionActionName || '').toLowerCase();
      const isPhone = PHONE_CALL_NAMES_LOCAL.some(n => nameLower.includes(n)) ||
                      PHONE_CALL_CATEGORIES_LOCAL.includes(r.conversionActionCategory);
      if (isPhone) phoneTotal += r.allConversions;
      if (r.conversionActionCategory === 'SUBMIT_LEAD_FORM') formTotal += r.allConversions;
    }
    const combinedPhone = Math.round(phoneTotal + phoneCallsMetric);
    return {
      phoneCalls:     combinedPhone || null,
      allConversions: allConvTotal > 0 ? Math.round(allConvTotal) : null,
      formSubmissions: formTotal > 0 ? Math.round(formTotal) : null,
    };
  }

  // Monthly breakdown — last 4 full months + current month MTD
  const monthlyBreakdown = [];
  for (let i = 4; i >= 1; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const label = start.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const mRows = rows.filter(r => r.date >= fmtDate(start) && r.date <= fmtDate(end));
    let mSpend = 0, mClicks = 0, mLeads = 0, mImpressions = 0;
    for (const r of mRows) { mSpend += r.cost; mClicks += r.clicks; mLeads += r.conversions; mImpressions += (r.impressions || 0); }
    const mConv = convTotalsForPeriod(start, end);
    monthlyBreakdown.push({
      month:          label,
      adSpend:        Math.round(mSpend  * 100) / 100,
      adClicks:       mClicks,
      adLeads:        Math.round(mLeads),
      adImpressions:  mImpressions || null,
      adPhoneCalls:   mConv.phoneCalls,
      adAllConv:      mConv.allConversions,
      adFormSubs:     mConv.formSubmissions,
    });
  }
  // Current month MTD
  {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const label = start.toLocaleString('en-US', { month: 'short', year: 'numeric' }) + ' (MTD)';
    const mRows = rows.filter(r => r.date >= fmtDate(start) && r.date <= fmtDate(now));
    let mSpend = 0, mClicks = 0, mLeads = 0, mImpressions = 0;
    for (const r of mRows) { mSpend += r.cost; mClicks += r.clicks; mLeads += r.conversions; mImpressions += (r.impressions || 0); }
    const mConv = convTotalsForPeriod(start, now);
    if (mSpend > 0 || mClicks > 0) {
      monthlyBreakdown.push({
        month:          label,
        adSpend:        Math.round(mSpend  * 100) / 100,
        adClicks:       mClicks,
        adLeads:        Math.round(mLeads),
        adImpressions:  mImpressions || null,
        adPhoneCalls:   mConv.phoneCalls,
        adAllConv:      mConv.allConversions,
        adFormSubs:     mConv.formSubmissions,
      });
    }
  }

  // Phone calls — from conversion action breakdown (last full month)
  // Match by name (exact or partial) for all phone call action types.
  // Phil's spec: Business profile - Tracked call, Business profile - Call,
  //              GBP - Clicks to call, Calls from ads
  // Also include any PHONE_CALL_LEAD category as a safety net.
  const PHONE_CALL_NAMES = [
    'business profile - tracked call',
    'business profile - call',
    'gbp - clicks to call',
    'calls from ads',
  ];
  const PHONE_CALL_CATEGORIES = ['PHONE_CALL_LEAD', 'AD_CALL', 'CALLS_FROM_ADS'];

  let phoneCalls = null;
  let allConversions = Math.round(totalLeads); // fallback to conversions metric
  if (conversionRows && conversionRows.length > 0) {
    const lmConv = conversionRows.filter(r => r.date >= fmtDate(periodStart) && r.date <= fmtDate(periodEnd));
    let phoneTotal = 0, allConvTotal = 0, formTotal = 0;
    for (const r of lmConv) {
      allConvTotal += r.allConversions;
      const nameLower = (r.conversionActionName || '').toLowerCase();
      const isPhone = PHONE_CALL_NAMES.some(n => nameLower.includes(n)) ||
                      PHONE_CALL_CATEGORIES.includes(r.conversionActionCategory);
      if (isPhone) phoneTotal += r.allConversions;
      // Form submissions = SUBMIT_LEAD_FORM category
      if (r.conversionActionCategory === 'SUBMIT_LEAD_FORM') formTotal += r.allConversions;
    }
    if (allConvTotal > 0) allConversions = Math.round(allConvTotal);
    // Add metrics.phone_calls (call extension clicks) on top of conversion-action phone totals
    const combinedPhone = Math.round(phoneTotal + totalPhoneCallsMetric);
    if (combinedPhone > 0) phoneCalls = combinedPhone;
    // Per-type call breakdown
    let gbpCallsTotal = 0, callExtTotal = 0, websiteCallsTotal = 0, otherCallsTotal = 0;
    const GBP_NAMES   = ['business profile - tracked call', 'business profile - call', 'gbp - clicks to call'];
    const EXT_NAMES   = ['calls from ads'];
    const WEB_NAMES   = ['phone number click', 'website call', 'phone call from website', 'phone_click', 'phone call - website'];
    for (const r of lmConv) {
      const nl = (r.conversionActionName || '').toLowerCase();
      const cat = r.conversionActionCategory || '';
      if (GBP_NAMES.some(n => nl.includes(n)) || cat === 'AD_CALL') {
        gbpCallsTotal += r.allConversions;
      } else if (EXT_NAMES.some(n => nl.includes(n)) || cat === 'CALLS_FROM_ADS') {
        callExtTotal += r.allConversions;
      } else if (WEB_NAMES.some(n => nl.includes(n)) || cat === 'PHONE_CALL_LEAD') {
        websiteCallsTotal += r.allConversions;
      } else if (PHONE_CALL_NAMES.some(n => nl.includes(n)) || PHONE_CALL_CATEGORIES.includes(cat)) {
        otherCallsTotal += r.allConversions;
      }
    }
    // phone_calls metric (call extension clicks not captured as conversion actions)
    if (totalPhoneCallsMetric > 0 && callExtTotal === 0) callExtTotal += totalPhoneCallsMetric;
    console.log('[Google Ads] phone breakdown: convAction=' + phoneTotal.toFixed(1) + ' phoneCallsMetric=' + totalPhoneCallsMetric + ' total=' + combinedPhone);
    console.log('[Google Ads] call types: gbp=' + gbpCallsTotal.toFixed(1) + ' ext=' + callExtTotal.toFixed(1) + ' web=' + websiteCallsTotal.toFixed(1) + ' other=' + otherCallsTotal.toFixed(1));
    // CPL denominator = phone calls + form submissions (meaningful leads only)
    const meaningfulLeads = phoneTotal + formTotal;
    const costPerLeadFinal = meaningfulLeads > 0 ? Math.round((totalSpend / meaningfulLeads) * 100) / 100 : null;
    return {
      spend:          Math.round(totalSpend * 100) / 100,
      clicks:         totalClicks,
      leads:          allConversions,
      phoneCalls:     phoneCalls || 0,
      gbpCalls:       gbpCallsTotal > 0 ? Math.round(gbpCallsTotal) : null,
      callExtensionCalls: callExtTotal > 0 ? Math.round(callExtTotal) : null,
      websiteCalls:   websiteCallsTotal > 0 ? Math.round(websiteCallsTotal) : null,
      otherCalls:     otherCallsTotal > 0 ? Math.round(otherCallsTotal) : null,
      allConversions: allConversions,
      impressions:    totalImpressions || null,
      costPerLead:    costPerLeadFinal,
      campaigns,
      monthlyBreakdown,
    };
  }

  // fallback if no conversionRows
  const costPerLead = totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 100) / 100 : null;

  return {
    spend:          Math.round(totalSpend  * 100) / 100,
    clicks:         totalClicks,
    leads:          allConversions,
    phoneCalls:     phoneCalls,
    allConversions: allConversions,
    impressions:    totalImpressions || null,
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

const API_VERSION = 'v21';
const BASE        = `https://googleads.googleapis.com/${API_VERSION}`;

// SA JWT auth (primary — confirmed working 2026-07-22)
// Signs JWT manually and exchanges for access token
async function getAdsTokenSA() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('No GOOGLE_SERVICE_ACCOUNT_JSON');
  const sa = JSON.parse(raw);
  const crypto = require('crypto');
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss:   sa.client_email,
    sub:   'tylerbrickley@killergrowth.com',
    scope: 'https://www.googleapis.com/auth/adwords',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data));
  return data.access_token;
}

// OAuth refresh token auth (legacy fallback)
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
  // Always pass MCC as login-customer-id when available
  const loginCid = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '9760213886';
  headers['login-customer-id'] = loginCid;
  const res = await fetch(`${BASE}/customers/${cid}/googleAds:search`, {
    method: 'POST', headers, body: JSON.stringify({ query }),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Google Ads API ${res.status}: ${e.substring(0, 300)}`); }
  return res.json();
}

async function pullGoogleAdsDirect(customerId) {
  if (!customerId || customerId === 'FILL_IN') return null;
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) { console.log('[Google Ads] Missing GOOGLE_ADS_DEVELOPER_TOKEN — skipping'); return null; }

  // Try SA+DWD first (confirmed working), fall back to OAuth refresh token
  let accessToken;
  try {
    accessToken = await getAdsTokenSA();
    console.log('[Google Ads] Using SA+DWD auth');
  } catch (e) {
    console.warn('[Google Ads] SA auth failed, trying OAuth:', e.message);
    const oauthRequired = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN'];
    if (oauthRequired.every(k => process.env[k])) {
      try { accessToken = await getAdsToken(); } catch (e2) { console.warn('[Google Ads] OAuth also failed:', e2.message); return null; }
    } else {
      console.log('[Google Ads] No valid auth available — skipping');
      return null;
    }
  }

  try {
    // accessToken already set above (SA+DWD or OAuth fallback)
    const cid = customerId.replace(/-/g, '');
    const now   = new Date();
    // Pull last 6 months of daily data so aggregateRows can build monthly breakdown
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
    const until = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().split('T')[0];

    const q = `SELECT campaign.name, segments.date, metrics.cost_micros, metrics.clicks,
      metrics.conversions, metrics.impressions, metrics.phone_calls
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
      ORDER BY segments.date DESC
      LIMIT 10000`;
    const d = await gaqlSearch(cid, q, accessToken);
    const rows = (d.results || []).map(r => ({
      date:         r.segments?.date || since,
      campaignName: r.campaign?.name || '',
      cost:         (r.metrics?.costMicros || 0) / 1e6,
      clicks:       parseInt(r.metrics?.clicks)      || 0,
      conversions:  parseFloat(r.metrics?.conversions) || 0,
      impressions:  parseInt(r.metrics?.impressions)  || 0,
      phoneCalls:   parseInt(r.metrics?.phoneCalls)   || 0,
    }));

    // Pull conversion action breakdown for phone call categorization
    let conversionRows = [];
    try {
      const qConv = `SELECT segments.date, segments.conversion_action_category,
        segments.conversion_action_name, metrics.all_conversions
        FROM campaign
        WHERE segments.date BETWEEN '${since}' AND '${until}'
          AND metrics.all_conversions > 0
        ORDER BY segments.date DESC
        LIMIT 5000`;
      const dConv = await gaqlSearch(cid, qConv, accessToken);
      conversionRows = (dConv.results || []).map(r => ({
        date:                     r.segments?.date || since,
        conversionActionCategory: r.segments?.conversionActionCategory || '',
        conversionActionName:     r.segments?.conversionActionName || '',
        allConversions:           parseFloat(r.metrics?.allConversions) || 0,
        conversions:              parseFloat(r.metrics?.allConversions) || 0, // compat
      }));
      console.log(`[Google Ads] Conversion action rows: ${conversionRows.length}`);
    } catch (e) {
      console.warn('[Google Ads] Conversion action pull failed (non-fatal):', e.message);
    }

    const result = aggregateRows(rows, conversionRows);
    console.log(`[Google Ads] [direct API] spend=$${result.spend} clicks=${result.clicks} phoneCalls=${result.phoneCalls} allConv=${result.allConversions}`);
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
