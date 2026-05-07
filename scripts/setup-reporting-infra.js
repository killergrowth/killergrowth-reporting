/**
 * setup-reporting-infra.js
 * ========================
 * One-time setup: creates KG Reporting - TEMPLATE and KG Client Directory sheets.
 * Run once. Saves IDs to scripts/reporting-config.json.
 *
 * Usage: node scripts/setup-reporting-infra.js
 */

const { GoogleAuth } = require('google-auth-library');
const fs   = require('fs');
const path = require('path');

const SA_PATH    = path.join(__dirname, 'service-account.json');
const SA         = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
const CONFIG_OUT = path.join(__dirname, 'reporting-config.json');

const TYLER_B_EMAIL = 'brickley@killergrowth.com';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// ---------------------------------------------------------------------------
// Tab schema — comprehensive, source-of-truth
// ---------------------------------------------------------------------------

const TEMPLATE_TABS = [
  // ── Google Ads ────────────────────────────────────────────────────────────
  {
    source: 'ads',
    name: 'ads_campaigns',
    // One row per campaign × device × day. 27 columns.
    headers: [
      'date',                       // segments.date
      'campaign_id',                // campaign.id
      'campaign_name',              // campaign.name
      'campaign_status',            // campaign.status
      'campaign_type',              // campaign.advertising_channel_type
      'device',                     // segments.device
      'impressions',                // metrics.impressions
      'clicks',                     // metrics.clicks
      'cost_usd',                   // metrics.cost_micros / 1e6
      'ctr',                        // metrics.ctr
      'avg_cpc_usd',                // metrics.average_cpc / 1e6
      'conversions',                // metrics.conversions
      'all_conversions',            // metrics.all_conversions
      'conversion_rate',            // metrics.conversions_from_interactions_rate
      'conversion_value_usd',       // metrics.conversions_value
      'cost_per_conversion_usd',    // metrics.cost_per_conversion / 1e6
      'view_through_conversions',   // metrics.view_through_conversions
      'phone_calls',                // metrics.phone_calls
      'phone_impressions',          // metrics.phone_impressions
      'phone_call_rate',            // metrics.phone_through_rate
      'video_views',                // metrics.video_views
      'video_view_rate',            // metrics.video_view_rate
      'engagements',                // metrics.engagements
      'engagement_rate',            // metrics.engagement_rate
      'search_impression_share',    // metrics.search_impression_share
      'search_top_impression_share',// metrics.search_top_impression_share
      'search_abs_top_imp_share',   // metrics.search_absolute_top_impression_share
    ],
  },
  {
    source: 'ads',
    name: 'ads_search_terms',
    // One row per search term × campaign × day. 13 columns.
    // Note: can grow fast at high-volume accounts. Pruning policy in SOP.
    headers: [
      'date',             // segments.date
      'campaign_name',    // campaign.name
      'ad_group_name',    // ad_group.name
      'search_term',      // search_term_view.search_term
      'match_type',       // segments.search_term_match_type
      'status',           // search_term_view.status (ADDED / EXCLUDED / NONE)
      'impressions',      // metrics.impressions
      'clicks',           // metrics.clicks
      'cost_usd',         // metrics.cost_micros / 1e6
      'ctr',              // metrics.ctr
      'avg_cpc_usd',      // metrics.average_cpc / 1e6
      'conversions',      // metrics.conversions
      'conversion_rate',  // metrics.conversions_from_interactions_rate
    ],
  },
  {
    source: 'ads',
    name: 'ads_keywords',
    // One row per keyword × day. Performance only — no QS (QS is snapshot, see ads_keywords_qs). 14 columns.
    headers: [
      'date',             // segments.date
      'campaign_name',    // campaign.name
      'ad_group_name',    // ad_group.name
      'keyword_text',     // ad_group_criterion.keyword.text
      'match_type',       // ad_group_criterion.keyword.match_type
      'keyword_status',   // ad_group_criterion.status
      'impressions',      // metrics.impressions
      'clicks',           // metrics.clicks
      'cost_usd',         // metrics.cost_micros / 1e6
      'ctr',              // metrics.ctr
      'avg_cpc_usd',      // metrics.average_cpc / 1e6
      'conversions',      // metrics.conversions
      'conversion_rate',  // metrics.conversions_from_interactions_rate
      'bid_usd',          // ad_group_criterion.effective_cpc_bid_micros / 1e6
    ],
  },
  {
    source: 'ads',
    name: 'ads_keywords_qs',
    // SNAPSHOT tab — cleared and rewritten on every pull. NOT time-series.
    // as_of_date shows when the snapshot was taken.
    // ⚠️ Quality Score is a current-state metric only. Google does not expose historical QS via API.
    // Do NOT use this tab for trend analysis. 11 columns.
    headers: [
      'as_of_date',        // date of this snapshot
      'campaign_name',     // campaign.name
      'ad_group_name',     // ad_group.name
      'keyword_text',      // ad_group_criterion.keyword.text
      'match_type',        // ad_group_criterion.keyword.match_type
      'keyword_status',    // ad_group_criterion.status
      'quality_score',     // ad_group_criterion.quality_info.quality_score (1-10)
      'ad_relevance',      // ad_group_criterion.quality_info.creative_quality_score
      'landing_page_exp',  // ad_group_criterion.quality_info.post_click_quality_score
      'expected_ctr',      // ad_group_criterion.quality_info.search_predicted_ctr
      'bid_usd',           // ad_group_criterion.effective_cpc_bid_micros / 1e6
    ],
  },

  // ── GA4 Analytics ─────────────────────────────────────────────────────────
  {
    source: 'analytics',
    name: 'analytics_sessions',
    // PLACEHOLDER — pipeline ships when GA4 Sheets integration is built.
    headers: [
      'date', 'channel_group', 'source', 'medium',
      'sessions', 'users', 'new_users', 'engaged_sessions',
      'engagement_rate', 'bounce_rate', 'avg_session_duration_sec',
      'conversions', 'conversion_rate',
    ],
  },
  {
    source: 'analytics',
    name: 'analytics_pages',
    headers: [
      'date', 'page_path', 'page_title',
      'sessions', 'users', 'views', 'entrances', 'exits', 'avg_time_on_page',
    ],
  },
  {
    source: 'analytics',
    name: 'analytics_events',
    headers: [
      'date', 'event_name', 'event_count', 'users', 'sessions_with_event', 'conversion_count',
    ],
  },

  // ── Google Search Console ─────────────────────────────────────────────────
  {
    source: 'search_console',
    name: 'gsc_queries',
    // PLACEHOLDER
    headers: [
      'date', 'query', 'page', 'device', 'country',
      'impressions', 'clicks', 'ctr', 'avg_position',
    ],
  },
  {
    source: 'search_console',
    name: 'gsc_pages',
    headers: [
      'date', 'page', 'impressions', 'clicks', 'ctr', 'avg_position',
    ],
  },

  // ── Google Business Profile ───────────────────────────────────────────────
  {
    source: 'gbp',
    name: 'gbp_metrics',
    // PLACEHOLDER
    headers: [
      'date',
      'impressions_maps_desktop', 'impressions_maps_mobile',
      'impressions_search_desktop', 'impressions_search_mobile',
      'call_clicks', 'website_clicks', 'direction_requests',
      'bookings', 'food_orders',
    ],
  },
  {
    source: 'gbp',
    name: 'gbp_search_terms',
    headers: ['date', 'search_keyword', 'impressions'],
  },
  {
    source: 'gbp',
    name: 'gbp_reviews',
    // Snapshot tab — cleared and rewritten each pull.
    headers: ['review_id', 'create_time', 'rating', 'has_reply', 'reply_time', 'reviewer_name'],
  },

  // ── Facebook / Meta ───────────────────────────────────────────────────────
  {
    source: 'facebook',
    name: 'fb_page',
    // PLACEHOLDER
    headers: [
      'date', 'impressions', 'reach', 'engaged_users',
      'page_views', 'new_fans', 'fan_count', 'post_engagements',
    ],
  },
  {
    source: 'facebook',
    name: 'fb_posts',
    headers: [
      'post_id', 'created_time', 'post_type', 'message_snippet',
      'impressions', 'reach', 'reactions', 'comments', 'shares', 'clicks', 'video_views',
    ],
  },
];

const DIRECTORY_HEADERS = [
  'client_id', 'client_name', 'sheet_id', 'sheet_url',
  'active_sources', 'status', 'onboarded_at', 'onboarded_by',
  'ads_script_install_status', 'last_pull_at', 'notes',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getToken() {
  // Try OAuth user token first (required if SA write scope not authorized in Workspace)
  const clientId     = process.env.GOOGLE_SHEETS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    const body = new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: 'refresh_token',
    });
    const res  = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
    });
    const data = await res.json();
    if (data.access_token) return data.access_token;
    throw new Error('OAuth token refresh failed: ' + JSON.stringify(data));
  }
  // Fall back to service account
  const auth = new GoogleAuth({ credentials: SA, scopes: SCOPES });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function api(token, method, url, body) {
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

function colLetter(n) {
  let r = '';
  while (n > 0) { const rem = (n - 1) % 26; r = String.fromCharCode(65 + rem) + r; n = Math.floor((n - 1) / 26); }
  return r;
}

async function createSpreadsheet(token, title) {
  const res = await api(token, 'POST', 'https://sheets.googleapis.com/v4/spreadsheets', {
    properties: { title },
  });
  return { id: res.spreadsheetId, url: res.spreadsheetUrl };
}

async function addTabsAndHeaders(token, spreadsheetId, tabs) {
  // 1. Add all tabs
  const addRequests = tabs.map((tab, i) => ({
    addSheet: { properties: { title: tab.name, index: i + 1 } },
  }));
  await api(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, { requests: addRequests });

  // 2. Write headers to all tabs in one batchUpdate
  const data = tabs.map(tab => ({
    range:  `${tab.name}!A1:${colLetter(tab.headers.length)}1`,
    values: [tab.headers],
  }));
  await api(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    valueInputOption: 'RAW',
    data,
  });

  // 3. Delete the default "Sheet1"
  const meta     = await api(token, 'GET', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`);
  const sheet1   = meta.sheets.find(s => s.properties.title === 'Sheet1');
  if (sheet1) {
    await api(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }],
    });
  }
}

async function shareWith(token, fileId, email, role = 'writer') {
  await api(token, 'POST', `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    type: 'user', role, emailAddress: email, sendNotificationEmail: false,
  });
  console.log(`  Shared with ${email} as ${role}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Getting auth token...');
  const token = await getToken();

  // ── TEMPLATE ──
  console.log('\nCreating KG Reporting - TEMPLATE...');
  const tpl = await createSpreadsheet(token, 'KG Reporting - TEMPLATE');
  console.log('  ID:', tpl.id);
  await addTabsAndHeaders(token, tpl.id, TEMPLATE_TABS);
  console.log(`  Added ${TEMPLATE_TABS.length} tabs`);
  await shareWith(token, tpl.id, TYLER_B_EMAIL, 'writer');

  // ── DIRECTORY ──
  console.log('\nCreating KG Client Directory...');
  const dir = await createSpreadsheet(token, 'KG Client Directory');
  console.log('  ID:', dir.id);

  // Rename default Sheet1 → clients
  const dirMeta = await api(token, 'GET', `https://sheets.googleapis.com/v4/spreadsheets/${dir.id}?fields=sheets.properties`);
  const defSheet = dirMeta.sheets[0];
  await api(token, 'POST', `https://sheets.googleapis.com/v4/spreadsheets/${dir.id}:batchUpdate`, {
    requests: [{
      updateSheetProperties: {
        properties: { sheetId: defSheet.properties.sheetId, title: 'clients' },
        fields: 'title',
      },
    }],
  });
  await api(token, 'PUT',
    `https://sheets.googleapis.com/v4/spreadsheets/${dir.id}/values/clients!A1:K1?valueInputOption=RAW`,
    { values: [DIRECTORY_HEADERS] }
  );
  await shareWith(token, dir.id, TYLER_B_EMAIL, 'writer');

  // ── Save config ──
  const config = {
    templateSheetId:  tpl.id,
    templateSheetUrl: tpl.url,
    directorySheetId: dir.id,
    directorySheetUrl: dir.url,
  };
  fs.writeFileSync(CONFIG_OUT, JSON.stringify(config, null, 2), 'utf8');

  console.log('\n=== Done ===');
  console.log('Template :', tpl.id, tpl.url);
  console.log('Directory:', dir.id, dir.url);
  console.log('\nAdd to GitHub Actions secrets:');
  console.log('  KG_CLIENT_DIRECTORY_SHEET_ID =', dir.id);
  console.log('\nSaved:', CONFIG_OUT);
}

main().catch(e => { console.error(e.message); process.exit(1); });

// Export for use by other scripts
module.exports = { TEMPLATE_TABS, DIRECTORY_HEADERS };
