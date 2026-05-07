/**
 * onboard-client.js — Agent-driven client onboarding for reports.killergrowth.com
 * =================================================================================
 * Creates a per-client reporting Sheet, registers in KG Client Directory,
 * and generates the Google Ads Script to install in the client's account.
 *
 * Usage:
 *   node scripts/onboard-client.js --name "Goff Heating & Air" --sources "ads"
 *   node scripts/onboard-client.js --name "Sunflower Plumbing" --sources "ads,analytics"
 *
 * Prerequisites:
 *   - scripts/reporting-config.json must exist (run setup-reporting-infra.js first)
 *   - KG_SHEETS_REFRESH_TOKEN env var set (or in service-account.json with write scope)
 *   - KG Client Directory Sheet shared with service account
 *
 * Requires env: GOOGLE_SHEETS_CLIENT_ID, GOOGLE_SHEETS_CLIENT_SECRET, GOOGLE_SHEETS_REFRESH_TOKEN
 * (for write operations — see SOP-CLIENT-REPORTING.md for auth setup)
 */

const { GoogleAuth } = require('google-auth-library');
const fs   = require('fs');
const path = require('path');

const SA_PATH    = path.join(__dirname, 'service-account.json');
const CONFIG_PATH = path.join(__dirname, 'reporting-config.json');

// ---------------------------------------------------------------------------
// client_id slug generation
// ---------------------------------------------------------------------------

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')     // & → and
    .replace(/['']/g, '')      // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

async function generateClientId(slug, token, directorySheetId) {
  // Check directory for existing slugs
  const existing = await readSheetValues(token, directorySheetId, 'clients!A2:A');
  const taken = (existing || []).flat().filter(Boolean);
  if (!taken.includes(slug)) return slug;
  // Collision: append -2, -3, etc.
  let n = 2;
  while (taken.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// ---------------------------------------------------------------------------
// Tab definitions (mirror of setup-reporting-infra.js)
// ---------------------------------------------------------------------------

const SOURCE_TABS = {
  ads: ['ads_campaigns', 'ads_search_terms', 'ads_keywords', 'ads_keywords_qs'],
  analytics: ['analytics_sessions', 'analytics_pages', 'analytics_events'],
  search_console: ['gsc_queries', 'gsc_pages'],
  gbp: ['gbp_metrics', 'gbp_search_terms', 'gbp_reviews'],
  facebook: ['fb_page', 'fb_posts'],
};

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function getWriteToken() {
  // Try OAuth user token first (required for creating/modifying sheets)
  const clientId     = process.env.GOOGLE_SHEETS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const body = new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: 'refresh_token',
    });
    const res  = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await res.json();
    if (data.access_token) return data.access_token;
    throw new Error('Could not refresh GOOGLE_SHEETS token: ' + JSON.stringify(data));
  }

  // Fall back to service account (only works if Workspace admin authorized spreadsheets scope)
  const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const auth = new GoogleAuth({
    credentials: SA,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function getReadToken() {
  const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const auth = new GoogleAuth({
    credentials: SA,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function sheetsApi(token, method, url, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${JSON.stringify(data).substring(0, 400)}`);
  return data;
}

async function readSheetValues(token, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const d   = await res.json();
  if (!res.ok) throw new Error(`Read ${range}: ${res.status} ${JSON.stringify(d).substring(0, 200)}`);
  return d.values || [];
}

function colLetter(n) {
  let r = '';
  while (n > 0) { const rem = (n - 1) % 26; r = String.fromCharCode(65 + rem) + r; n = Math.floor((n - 1) / 26); }
  return r;
}

// ---------------------------------------------------------------------------
// Sheet creation
// ---------------------------------------------------------------------------

async function createClientSheet(token, clientName, activeSources, config) {
  // 1. Create blank spreadsheet
  const title = `KG Reporting - ${clientName}`;
  const created = await sheetsApi(token, 'POST', 'https://sheets.googleapis.com/v4/spreadsheets', {
    properties: { title },
  });
  const sheetId  = created.spreadsheetId;
  const sheetUrl = created.spreadsheetUrl;
  console.log(`  Created: ${title}`);
  console.log(`  ID: ${sheetId}`);

  // 2. Determine which tabs to include
  const { TEMPLATE_TABS } = require('./setup-reporting-infra');
  const activeTabs = TEMPLATE_TABS.filter(tab => activeSources.includes(tab.source));

  // 3. Add tabs and headers
  const addReqs = activeTabs.map((tab, i) => ({
    addSheet: { properties: { title: tab.name, index: i + 1 } },
  }));
  await sheetsApi(token, 'POST', `https