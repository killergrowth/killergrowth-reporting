/**
 * onboard-client.js — Agent-driven client onboarding for reports.killergrowth.com
 * =================================================================================
 * Creates a per-client reporting Sheet, registers in KG Client Directory,
 * and prints the Google Ads Script to install in the client's account.
 *
 * Usage:
 *   node scripts/onboard-client.js --name "Goff Heating & Air" --sources "ads"
 *   node scripts/onboard-client.js --name "Sunflower Plumbing" --sources "ads,analytics"
 *
 * Requires env (set by agent or inherited from GitHub Actions secrets):
 *   GOOGLE_SHEETS_CLIENT_ID
 *   GOOGLE_SHEETS_CLIENT_SECRET
 *   GOOGLE_SHEETS_REFRESH_TOKEN
 */

const { TEMPLATE_TABS } = require('./setup-reporting-infra');
const fs   = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'reporting-config.json');
const SA_PATH     = path.join(__dirname, 'service-account.json');

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const out  = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      out[args[i].slice(2)] = args[i + 1] || '';
      i++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function getWriteToken() {
  const clientId     = process.env.GOOGLE_SHEETS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing GOOGLE_SHEETS_CLIENT_ID / GOOGLE_SHEETS_CLIENT_SECRET / GOOGLE_SHEETS_REFRESH_TOKEN.\n' +
      'See workspace\\References\\credentials.md — KG Reporting / Sheets Write section.'
    );
  }

  const body = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type:    'refresh_token',
  });
  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(data));
  return data.access_token;
}

async function getReadToken() {
  const { GoogleAuth } = require('google-auth-library');
  const SA  = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const auth = new GoogleAuth({
    credentials: SA,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client      = await auth.getClient();
  const { token }   = await client.getAccessToken();
  return token;
}

// ---------------------------------------------------------------------------
// Sheets API helpers
// ---------------------------------------------------------------------------

async function sheetsApi(token, method, url, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${url}\n  → ${res.status}: ${JSON.stringify(data).substring(0, 400)}`);
  return data;
}

async function readSheetValues(token, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Read ${range}: ${res.status} ${JSON.stringify(data).substring(0, 200)}`);
  return data.values || [];
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateClientId(slug, readToken, directorySheetId) {
  let existing = [];
  try {
    const rows = await readSheetValues(readToken, directorySheetId, 'clients!A2:A');
    existing   = rows.flat().filter(Boolean);
  } catch (e) {
    // Directory might be empty — that's fine
  }
  if (!existing.includes(slug)) return slug;
  let n = 2;
  while (existing.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// ---------------------------------------------------------------------------
// Sheet creation
// ---------------------------------------------------------------------------

async function createClientSheet(writeToken, clientName, activeSources) {
  const title = `KG Reporting - ${clientName}`;

  // 1. Create blank spreadsheet
  const created = await sheetsApi(writeToken, 'POST', 'https://sheets.googleapis.com/v4/spreadsheets', {
    properties: { title },
  });
  const sheetId  = created.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
  console.log(`  Created: ${title}`);
  console.log(`  ID: ${sheetId}`);

  // 2. Filter tabs by active sources
  const sourcesArr = activeSources.split(',').map(s => s.trim().toLowerCase());
  const activeTabs  = TEMPLATE_TABS.filter(tab => sourcesArr.includes(tab.source));

  if (activeTabs.length === 0) {
    console.warn('  WARNING: No matching tabs for sources:', sourcesArr);
  }

  // 3. Add tabs via batchUpdate
  const addRequests = activeTabs.map((tab, i) => ({
    addSheet: { properties: { title: tab.name, index: i + 1 } },
  }));

  if (addRequests.length > 0) {
    await sheetsApi(
      writeToken, 'POST',
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      { requests: addRequests }
    );
  }

  // 4. Write headers to each tab
  const data = activeTabs.map(tab => ({
    range:  `${tab.name}!A1`,
    values: [tab.headers],
  }));

  if (data.length > 0) {
    await sheetsApi(
      writeToken, 'POST',
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`,
      { valueInputOption: 'RAW', data }
    );
  }

  console.log(`  Added ${activeTabs.length} tabs: ${activeTabs.map(t => t.name).join(', ')}`);

  // 5. Share with brickley@killergrowth.com as writer
  await sheetsApi(
    writeToken, 'POST',
    `https://www.googleapis.com/drive/v3/files/${sheetId}/permissions`,
    { role: 'writer', type: 'user', emailAddress: 'brickley@killergrowth.com' }
  );
  console.log('  Shared with brickley@killergrowth.com');

  return { sheetId, sheetUrl, activeTabs };
}

// ---------------------------------------------------------------------------
// Directory registration
// ---------------------------------------------------------------------------

async function registerInDirectory(writeToken, config, clientId, clientName, sheetId, sheetUrl, activeSources) {
  const directoryId = config.directorySheetId;
  const now         = new Date().toISOString().split('T')[0];

  const row = [
    clientId,
    clientName,
    sheetId,
    sheetUrl,
    activeSources,        // comma-separated source names
    'active',
    now,                  // onboarded_at
    'brickley@killergrowth.com', // onboarded_by
    'pending',            // ads_script_install_status
    '',                   // last_pull_at
    '',                   // notes
  ];

  await sheetsApi(
    writeToken, 'POST',
    `https://sheets.googleapis.com/v4/spreadsheets/${directoryId}/values/clients!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { values: [row] }
  );

  console.log(`  Registered in Directory: ${clientId}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();
  const clientName   = args.name;
  const activeSources = args.sources || 'ads';

  if (!clientName) {
    console.error('Usage: node scripts/onboard-client.js --name "Client Name" --sources "ads,analytics"');
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('Missing reporting-config.json. Run setup-reporting-infra.js first.');
    process.exit(1);
  }

  const config    = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const writeToken = await getWriteToken();
  const readToken  = await getReadToken();

  const slug     = toSlug(clientName);
  const clientId = await generateClientId(slug, readToken, config.directorySheetId);

  console.log(`\nOnboarding: ${clientName} (${clientId})`);
  console.log(`Sources: ${activeSources}\n`);

  // Create client sheet
  const { sheetId, sheetUrl, activeTabs } = await createClientSheet(writeToken, clientName, activeSources);

  // Register in directory
  await registerInDirectory(writeToken, config, clientId, clientName, sheetId, sheetUrl, activeSources);

  // Persist to reporting-config.json
  config.clients = config.clients || {};
  config.clients[clientId] = { name: clientName, sheetId, sheetUrl, sources: activeSources, onboardedAt: new Date().toISOString() };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log(`\n=== Onboarding Complete ===`);
  console.log(`Client ID : ${clientId}`);
  console.log(`Sheet     : ${sheetUrl}`);
  console.log(`Sheet ID  : ${sheetId}`);

  // Print Ads Script snippet if ads is a source
  const sourcesArr = activeSources.split(',').map(s => s.trim());
  if (sourcesArr.includes('ads')) {
    const adsScriptNum = Object.keys(config.clients).length; // for schedule stagger
    const scheduleMin  = 5 + (adsScriptNum - 1) * 5;
    const scheduleTime = `6:${String(scheduleMin).padStart(2, '0')}am`;

    console.log(`\n--- Google Ads Script install ---`);
    console.log(`1. Open Google Ads account for ${clientName}`);
    console.log(`2. Bulk Actions → Scripts → + New Script`);
    console.log(`3. Name it: KG Ads Export — ${clientName}`);
    console.log(`4. Paste scripts/kg-ads-export-v2.js, then set:`);
    console.log(`   var SHEET_ID  = '${sheetId}';`);
    console.log(`   var CLIENT_ID = '${clientId}';`);
    console.log(`5. Authorize → Run manually once (backfills from 2026-01-01)`);
    console.log(`6. Set schedule: Daily at ${scheduleTime}`);
    console.log(`---------------------------------`);
  }

  // Print workflow step snippet
  console.log(`\n--- .github/workflows/pull-data.yml step to add ---`);
  console.log(`      - name: Pull data — ${clientName}`);
  console.log(`        if: \${{ github.event.inputs.client == '' || github.event.inputs.client == '${clientId}' }}`);
  console.log(`        env:`);
  console.log(`          GOOGLE_SERVICE_ACCOUNT_JSON:       \${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}`);
  console.log(`          META_SYSTEM_TOKEN:                 \${{ secrets.META_SYSTEM_TOKEN }}`);
  console.log(`          GHL_API_KEY:                       \${{ secrets.GHL_API_KEY }}`);
  console.log(`          KG_CLIENT_DIRECTORY_SHEET_ID:      \${{ secrets.KG_CLIENT_DIRECTORY_SHEET_ID }}`);
  console.log(`          GOOGLE_ADS_SHEET_ID:               \${{ secrets.GOOGLE_ADS_SHEET_ID }}`);
  console.log(`          GOOGLE_ADS_CLIENT_ID:              \${{ secrets.GOOGLE_ADS_CLIENT_ID }}`);
  console.log(`          GOOGLE_ADS_CLIENT_SECRET:          \${{ secrets.GOOGLE_ADS_CLIENT_SECRET }}`);
  console.log(`          GOOGLE_ADS_REFRESH_TOKEN:          \${{ secrets.GOOGLE_ADS_REFRESH_TOKEN }}`);
  console.log(`          GOOGLE_ADS_DEVELOPER_TOKEN:        \${{ secrets.GOOGLE_ADS_DEVELOPER_TOKEN }}`);
  console.log(`          GOOGLE_ADS_LOGIN_CUSTOMER_ID:      \${{ secrets.GOOGLE_ADS_LOGIN_CUSTOMER_ID }}`);
  console.log(`        run: node scripts/build-report.js ${clientId}`);
  console.log(`---------------------------------------------------`);

  // Add to clients.json if it exists
  const clientsJsonPath = path.join(__dirname, 'clients.json');
  if (fs.existsSync(clientsJsonPath)) {
    const clients = JSON.parse(fs.readFileSync(clientsJsonPath, 'utf8'));
    if (!clients[clientId]) {
      clients[clientId] = {
        name:       clientName,
        slug:       clientId,
        sources:    sourcesArr,
        googleAdsCustomerId: '',  // fill in after confirming
      };
      fs.writeFileSync(clientsJsonPath, JSON.stringify(clients, null, 2));
      console.log(`\nAdded ${clientId} to clients.json (fill in googleAdsCustomerId)`);
    }
  }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
