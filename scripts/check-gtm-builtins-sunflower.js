/**
 * Checks + enables required built-in variables in GTM-P52V4GWP workspace 7
 * and marks phone_click + generate_lead as GA4 conversions.
 */
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID   = '6367272801';
const CONTAINER_ID = '258982828';
const GA4_PROP     = '504550092'; // G-JXZJM5L4H5
const WS_ID        = '7';
const BASE_GTM     = 'https://www.googleapis.com/tagmanager/v2';
const BASE_GA4     = 'https://analyticsadmin.googleapis.com/v1beta';

const NEEDED_BUILTINS = [
  'CLICK_URL', 'CLICK_CLASSES', 'CLICK_TEXT',
  'SCROLL_DEPTH_THRESHOLD', 'SCROLL_DEPTH_UNITS'
];

let gtmToken, ga4Token;

async function getToken(scopes, subject) {
  const creds = JSON.parse(fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/credentials/google-service-account.json', 'utf8'
  ));
  const auth = new GoogleAuth({ credentials: creds, scopes, clientOptions: { subject } });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function gtmReq(method, endpoint, body) {
  const r = await fetch(BASE_GTM + endpoint, {
    method,
    headers: { Authorization: `***${gtmToken}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json();
  if (d.error) throw new Error(`GTM ${d.error.code}: ${d.error.message}`);
  return d;
}

async function ga4Req(method, endpoint, body) {
  const r = await fetch(BASE_GA4 + endpoint, {
    method,
    headers: { Authorization: `Bearer ${ga4Token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json();
  if (d.error) throw new Error(`GA4 ${d.error.code}: ${d.error.message}`);
  return d;
}

async function main() {
  // Auth
  gtmToken = await getToken(
    ['https://www.googleapis.com/auth/tagmanager.edit.containers'],
    'brickley@killergrowth.com'
  );
  ga4Token = await getToken(
    ['https://www.googleapis.com/auth/analytics.edit'],
    'brickley@killergrowth.com'
  );
  console.log('Authenticated ✓\n');

  // ── 1. Check + enable built-in variables ────────────────────────────
  console.log('=== GTM Built-in Variables ===');
  const builtins = await gtmReq('GET',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${WS_ID}/built_in_variables`
  );
  const enabled = (builtins.builtInVariable || []).map(v => v.type);
  console.log('Currently enabled:', enabled.join(', ') || 'NONE');

  const missing = NEEDED_BUILTINS.filter(n => !enabled.includes(n));
  if (missing.length === 0) {
    console.log('✓ All required built-ins already enabled');
  } else {
    console.log('Missing:', missing.join(', '));
    // Enable via query string
    const qs = missing.map(t => `type=${t}`).join('&');
    const enableUrl = `${BASE_GTM}/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${WS_ID}/built_in_variables:create?${qs}`;
    const enableRes = await fetch(enableUrl, {
      method: 'POST',
      headers: { Authorization: `***${gtmToken}` }
    });
    const enableData = await enableRes.json();
    if (enableData.error) {
      console.log('⚠️  Could not enable via workspace API:', enableData.error.message);
      console.log('   → Will need to enable manually in GTM UI: Variables → Configure → check Click URL, Click Classes, Click Text, Scroll Depth');
    } else {
      const nowEnabled = (enableData.builtInVariable || []).map(v => v.type);
      console.log('✓ Enabled:', nowEnabled.join(', '));
    }
  }

  // ── 2. Mark GA4 conversions ──────────────────────────────────────────
  console.log('\n=== GA4 Conversions ===');
  const propPath = `properties/${GA4_PROP}`;

  // List existing key events (conversions in GA4 v4 API = keyEvents)
  const existing = await ga4Req('GET', `/${propPath}/keyEvents`);
  const existingNames = (existing.keyEvents || []).map(e => e.eventName);
  console.log('Existing conversions:', existingNames.join(', ') || 'none');

  const toMark = ['phone_click', 'generate_lead'];
  for (const eventName of toMark) {
    if (existingNames.includes(eventName)) {
      console.log(`✓ Already a conversion: ${eventName}`);
    } else {
      try {
        const result = await ga4Req('POST', `/${propPath}/keyEvents`, {
          eventName,
          countingMethod: 'ONCE_PER_SESSION'
        });
        console.log(`✓ Marked as conversion: ${result.eventName}`);
      } catch (e) {
        console.log(`⚠️  Could not mark ${eventName}: ${e.message}`);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log('GTM workspace 7 built-in variables: checked');
  console.log('GA4 conversions: phone_click + generate_lead marked');
  console.log('\nNEXT: Someone with GTM publish access needs to publish workspace 7.');
  console.log('GTM-P52V4GWP → Workspace "KG Conversion Tracking Setup" → Submit → Publish');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
