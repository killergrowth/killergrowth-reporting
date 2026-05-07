/**
 * KG Google Ads Export Script v2
 * ================================
 * Writes to 4 tabs in the per-client reporting Sheet:
 *   ads_campaigns   — daily × campaign × device (27 columns)
 *   ads_search_terms — daily × search term (13 columns)
 *   ads_keywords    — daily × keyword performance (14 columns, no QS)
 *   ads_keywords_qs — QS snapshot, overwritten each run (11 columns)
 *
 * SETUP:
 *   1. Set SHEET_ID to the client's per-client Sheet ID
 *   2. Confirm CLIENT_ID matches the client slug in the directory
 *   3. Paste into Google Ads → Bulk Actions → Scripts
 *   4. Authorize → Run once manually (backfills from BACKFILL_FROM)
 *   5. Set schedule per stagger convention (see SOP-CLIENT-REPORTING.md)
 *
 * Schedule stagger convention:
 *   First client  → 6:05am
 *   Each additional client → +5 min (6:10, 6:15, ...)
 */

var SHEET_ID      = 'YOUR_PER_CLIENT_SHEET_ID'; // ← Replace with client's Sheet ID
var CLIENT_ID     = 'sunflower';                  // ← Replace with client slug
var BACKFILL_FROM = '2026-01-01';                 // ← Backfill start date

// ── Tab column definitions (must match template schema exactly) ───────────

var CAMPAIGNS_COLS = [
  'date', 'campaign_id', 'campaign_name', 'campaign_status', 'campaign_type',
  'device', 'impressions', 'clicks', 'cost_usd', 'ctr', 'avg_cpc_usd',
  'conversions', 'all_conversions', 'conversion_rate', 'conversion_value_usd',
  'cost_per_conversion_usd', 'view_through_conversions', 'phone_calls',
  'phone_impressions', 'phone_call_rate', 'video_views', 'video_view_rate',
  'engagements', 'engagement_rate', 'search_impression_share',
  'search_top_impression_share', 'search_abs_top_imp_share',
];

var SEARCH_TERMS_COLS = [
  'date', 'campaign_name', 'ad_group_name', 'search_term', 'match_type', 'status',
  'impressions', 'clicks', 'cost_usd', 'ctr', 'avg_cpc_usd', 'conversions', 'conversion_rate',
];

var KEYWORDS_COLS = [
  'date', 'campaign_name', 'ad_group_name', 'keyword_text', 'match_type',
  'keyword_status', 'impressions', 'clicks', 'cost_usd', 'ctr', 'avg_cpc_usd',
  'conversions', 'conversion_rate', 'bid_usd',
];

var KEYWORDS_QS_COLS = [
  // ⚠️ SNAPSHOT — not time-series. as_of_date shows when snapshot was taken.
  // Quality Score reflects current state only. Google does not expose historical QS via API.
  'as_of_date', 'campaign_name', 'ad_group_name', 'keyword_text', 'match_type',
  'keyword_status', 'quality_score', 'ad_relevance', 'landing_page_exp',
  'expected_ctr', 'bid_usd',
];

// ---------------------------------------------------------------------------

function main() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    Logger.log('ERROR: Could not open sheet. Check SHEET_ID. ' + e.message);
    return;
  }

  Logger.log('Starting KG Ads Export v2 for: ' + CLIENT_ID);

  // Pull campaign performance (appending)
  pullCampaigns(ss);

  // Pull search terms (appending)
  pullSearchTerms(ss);

  // Pull keyword performance (appending)
  pullKeywords(ss);

  // Pull QS snapshot (overwrite)
  pullKeywordsQs(ss);

  Logger.log('Done.');
}

// ── ads_campaigns ────────────────────────────────────────────────────────────

function pullCampaigns(ss) {
  var sheet = getOrCreateTab(ss, 'ads_campaigns', CAMPAIGNS_COLS);
  var startDate = getStartDate(sheet, BACKFILL_FROM);
  var endDate   = yesterday();

  if (startDate > endDate) {
    Logger.log('ads_campaigns: up to date through ' + formatDate(endDate));
    return;
  }
  Logger.log('ads_campaigns: pulling ' + formatDate(startDate) + ' → ' + formatDate(endDate));

  var current = new Date(startDate);
  while (current <= endDate) {
    var chunkEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    if (chunkEnd > endDate) chunkEnd = new Date(endDate);

    var query =
      'SELECT ' +
        'segments.date, campaign.id, campaign.name, campaign.status, ' +
        'campaign.advertising_channel_type, segments.device, ' +
        'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, ' +
        'metrics.average_cpc, metrics.conversions, metrics.all_conversions, ' +
        'metrics.conversions_from_interactions_rate, metrics.conversions_value, ' +
        'metrics.cost_per_conversion, metrics.view_through_conversions, ' +
        'metrics.phone_calls, metrics.phone_impressions, metrics.phone_through_rate, ' +
        'metrics.video_views, metrics.video_view_rate, ' +
        'metrics.engagements, metrics.engagement_rate, ' +
        'metrics.search_impression_share, metrics.search_top_impression_share, ' +
        'metrics.search_absolute_top_impression_share ' +
      'FROM campaign ' +
      "WHERE segments.date BETWEEN '" + formatDate(current) + "' AND '" + formatDate(chunkEnd) + "' " +
      'ORDER BY segments.date ASC, campaign.name ASC, segments.device ASC';

    var rows = [];
    var result = AdsApp.search(query);
    while (result.hasNext()) {
      var r = result.next();
      rows.push([
        r.segments.date,
        r.campaign.id              || '',
        r.campaign.name            || '',
        r.campaign.status          || '',
        r.campaign.advertisingChannelType || '',
        r.segments.device          || '',
        parseInt(r.metrics.impressions      || 0),
        parseInt(r.metrics.clicks           || 0),
        micros(r.metrics.costMicros),
        pct(r.metrics.ctr),
        micros(r.metrics.averageCpc),
        parseFloat((r.metrics.conversions   || 0).toFixed(2)),
        parseFloat((r.metrics.allConversions|| 0).toFixed(2)),
        pct(r.metrics.conversionsFromInteractionsRate),
        parseFloat((r.metrics.conversionsValue || 0).toFixed(2)),
        micros(r.metrics.costPerConversion),
        parseInt(r.metrics.viewThroughConversions || 0),
        parseInt(r.metrics.phoneCalls       || 0),
        parseInt(r.metrics.phoneImpressions || 0),
        pct(r.metrics.phoneThroughRate),
        parseInt(r.metrics.videoViews       || 0),
        pct(r.metrics.videoViewRate),
        parseInt(r.metrics.engagements      || 0),
        pct(r.metrics.engagementRate),
        pct(r.metrics.searchImpressionShare),
        pct(r.metrics.searchTopImpressionShare),
        pct(r.metrics.searchAbsoluteTopImpressionShare),
      ]);
    }

    appendRows(sheet, rows, CAMPAIGNS_COLS.length);
    Logger.log('  ads_campaigns: ' + rows.length + ' rows (' + formatDate(current) + ' → ' + formatDate(chunkEnd) + ')');
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
}

// ── ads_search_terms ─────────────────────────────────────────────────────────

function pullSearchTerms(ss) {
  var sheet = getOrCreateTab(ss, 'ads_search_terms', SEARCH_TERMS_COLS);
  var startDate = getStartDate(sheet, BACKFILL_FROM);
  var endDate   = yesterday();

  if (startDate > endDate) {
    Logger.log('ads_search_terms: up to date');
    return;
  }
  Logger.log('ads_search_terms: pulling ' + formatDate(startDate) + ' → ' + formatDate(endDate));

  var current = new Date(startDate);
  while (current <= endDate) {
    var chunkEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    if (chunkEnd > endDate) chunkEnd = new Date(endDate);

    var query =
      'SELECT ' +
        'segments.date, campaign.name, ad_group.name, ' +
        'search_term_view.search_term, segments.search_term_match_type, ' +
        'search_term_view.status, ' +
        'metrics.impressions, metrics.clicks, metrics.cost_micros, ' +
        'metrics.ctr, metrics.average_cpc, ' +
        'metrics.conversions, metrics.conversions_from_interactions_rate ' +
      'FROM search_term_view ' +
      "WHERE segments.date BETWEEN '" + formatDate(current) + "' AND '" + formatDate(chunkEnd) + "' " +
      'ORDER BY segments.date ASC, metrics.cost_micros DESC';

    var rows = [];
    var result = AdsApp.search(query);
    while (result.hasNext()) {
      var r = result.next();
      rows.push([
        r.segments.date,
        r.campaign.name            || '',
        r.adGroup.name             || '',
        r.searchTermView.searchTerm || '',
        r.segments.searchTermMatchType || '',
        r.searchTermView.status    || '',
        parseInt(r.metrics.impressions || 0),
        parseInt(r.metrics.clicks      || 0),
        micros(r.metrics.costMicros),
        pct(r.metrics.ctr),
        micros(r.metrics.averageCpc),
        parseFloat((r.metrics.conversions || 0).toFixed(2)),
        pct(r.metrics.conversionsFromInteractionsRate),
      ]);
    }

    appendRows(sheet, rows, SEARCH_TERMS_COLS.length);
    Logger.log('  ads_search_terms: ' + rows.length + ' rows (' + formatDate(current) + ' → ' + formatDate(chunkEnd) + ')');
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
}

// ── ads_keywords ─────────────────────────────────────────────────────────────

function pullKeywords(ss) {
  var sheet = getOrCreateTab(ss, 'ads_keywords', KEYWORDS_COLS);
  var startDate = getStartDate(sheet, BACKFILL_FROM);
  var endDate   = yesterday();

  if (startDate > endDate) {
    Logger.log('ads_keywords: up to date');
    return;
  }
  Logger.log('ads_keywords: pulling ' + formatDate(startDate) + ' → ' + formatDate(endDate));

  var current = new Date(startDate);
  while (current <= endDate) {
    var chunkEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    if (chunkEnd > endDate) chunkEnd = new Date(endDate);

    var query =
      'SELECT ' +
        'segments.date, campaign.name, ad_group.name, ' +
        'ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ' +
        'ad_group_criterion.status, ' +
        'metrics.impressions, metrics.clicks, metrics.cost_micros, ' +
        'metrics.ctr, metrics.average_cpc, ' +
        'metrics.conversions, metrics.conversions_from_interactions_rate, ' +
        'ad_group_criterion.effective_cpc_bid_micros ' +
      'FROM keyword_view ' +
      "WHERE segments.date BETWEEN '" + formatDate(current) + "' AND '" + formatDate(chunkEnd) + "' " +
      'ORDER BY segments.date ASC, metrics.cost_micros DESC';

    var rows = [];
    var result = AdsApp.search(query);
    while (result.hasNext()) {
      var r = result.next();
      rows.push([
        r.segments.date,
        r.campaign.name                              || '',
        r.adGroup.name                               || '',
        r.adGroupCriterion.keyword.text              || '',
        r.adGroupCriterion.keyword.matchType         || '',
        r.adGroupCriterion.status                    || '',
        parseInt(r.metrics.impressions               || 0),
        parseInt(r.metrics.clicks                    || 0),
        micros(r.metrics.costMicros),
        pct(r.metrics.ctr),
        micros(r.metrics.averageCpc),
        parseFloat((r.metrics.conversions            || 0).toFixed(2)),
        pct(r.metrics.conversionsFromInteractionsRate),
        micros(r.adGroupCriterion.effectiveCpcBidMicros),
      ]);
    }

    appendRows(sheet, rows, KEYWORDS_COLS.length);
    Logger.log('  ads_keywords: ' + rows.length + ' rows (' + formatDate(current) + ' → ' + formatDate(chunkEnd) + ')');
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
}

// ── ads_keywords_qs (snapshot) ────────────────────────────────────────────────

function pullKeywordsQs(ss) {
  var sheet = getOrCreateTab(ss, 'ads_keywords_qs', KEYWORDS_QS_COLS);

  // ⚠️ Snapshot tab — clear all existing data (except header) and rewrite
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, KEYWORDS_QS_COLS.length).clearContent();
  }

  var today = formatDate(new Date());
  var query =
    'SELECT ' +
      'campaign.name, ad_group.name, ' +
      'ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ' +
      'ad_group_criterion.status, ' +
      'ad_group_criterion.quality_info.quality_score, ' +
      'ad_group_criterion.quality_info.creative_quality_score, ' +
      'ad_group_criterion.quality_info.post_click_quality_score, ' +
      'ad_group_criterion.quality_info.search_predicted_ctr, ' +
      'ad_group_criterion.effective_cpc_bid_micros ' +
    'FROM keyword_view ' +
    "WHERE ad_group_criterion.status != 'REMOVED' " +
    'ORDER BY campaign.name ASC, ad_group.name ASC';

  var rows = [];
  var result = AdsApp.search(query);
  while (result.hasNext()) {
    var r = result.next();
    rows.push([
      today,
      r.campaign.name                              || '',
      r.adGroup.name                               || '',
      r.adGroupCriterion.keyword.text              || '',
      r.adGroupCriterion.keyword.matchType         || '',
      r.adGroupCriterion.status                    || '',
      r.adGroupCriterion.qualityInfo.qualityScore  || '',
      r.adGroupCriterion.qualityInfo.creativeQualityScore      || '',
      r.adGroupCriterion.qualityInfo.postClickQualityScore     || '',
      r.adGroupCriterion.qualityInfo.searchPredictedCtr        || '',
      micros(r.adGroupCriterion.effectiveCpcBidMicros),
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, KEYWORDS_QS_COLS.length).setValues(rows);
  }
  Logger.log('ads_keywords_qs: snapshot written — ' + rows.length + ' keywords as of ' + today);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOrCreateTab(ss, name, columns) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(columns);
    Logger.log('Created tab: ' + name);
  }
  return sheet;
}

function getStartDate(sheet, backfillFrom) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return parseDate(backfillFrom);
  // Find last date in column A
  var vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var lastDate = null;
  for (var i = vals.length - 1; i >= 0; i--) {
    var v = vals[i][0];
    if (v) { lastDate = v; break; }
  }
  if (!lastDate) return parseDate(backfillFrom);
  return addDays(parseDate(isoDate(lastDate)), 1);
}

function appendRows(sheet, rows, colCount) {
  if (rows.length === 0) return;
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, colCount).setValues(rows);
}

// Date helpers
function isoDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear(), mo = String(val.getMonth() + 1).padStart(2, '0'), d = String(val.getDate()).padStart(2, '0');
    return y + '-' + mo + '-' + d;
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
  return s;
}

function parseDate(str) {
  var p = str.split('-');
  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
}

function formatDate(date) {
  var y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function addDays(date, n) {
  var d = new Date(date); d.setDate(d.getDate() + n); return d;
}

function yesterday() {
  var d = new Date(); d.setDate(d.getDate() - 1); return d;
}

// Metric helpers
function micros(val) { return parseFloat(((parseInt(val || 0)) / 1000000).toFixed(4)); }
function pct(val)    { return parseFloat((parseFloat(val || 0) * 100).toFixed(4)); }
