/**
 * KG Google Ads Export Script
 * ===========================
 * Paste this into Google Ads → Bulk Actions → Scripts
 *
 * SETUP (do this before saving the script):
 *   1. Replace SHEET_ID below with the ID from your Google Sheet URL
 *      e.g. https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 *   2. Confirm CLIENT_ID matches the client slug in clients.json
 *   3. Save and run once manually to backfill, then set schedule to Daily at 6:05am
 *
 * Schedule convention (stagger to avoid Sheets API rate limits):
 *   sunflower  → 6:05am
 *   next client → 6:10am
 *   next client → 6:15am
 *   (add 5 minutes per client)
 */

var SHEET_ID     = 'YOUR_SHEET_ID_HERE'; // ← Replace with your Google Sheet ID
var CLIENT_ID    = 'sunflower';           // ← Client slug (must match clients.json)
var BACKFILL_FROM = '2026-01-01';         // ← First date to pull on initial run

var COLUMNS = ['date', 'campaign_name', 'impressions', 'clicks', 'cost_usd', 'conversions'];

// ---------------------------------------------------------------------------

function main() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    Logger.log('ERROR: Could not open sheet. Check SHEET_ID. ' + e.message);
    return;
  }

  // Get or create the per-client tab
  var sheet = ss.getSheetByName(CLIENT_ID);
  if (!sheet) {
    sheet = ss.insertSheet(CLIENT_ID);
    sheet.appendRow(COLUMNS);
    Logger.log('Created new tab: ' + CLIENT_ID);
  }

  // Determine pull range
  var lastDate  = getLastDate(sheet);
  var startDate = lastDate ? addDays(lastDate, 1) : parseDate(BACKFILL_FROM);
  var endDate   = yesterday();

  if (startDate > endDate) {
    Logger.log('Already up to date through ' + formatDate(endDate) + '. Nothing to do.');
    return;
  }

  Logger.log('Pulling ' + CLIENT_ID + ' from ' + formatDate(startDate) + ' to ' + formatDate(endDate));

  // Chunk by month to stay within the 30-minute script time limit
  var current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  // Start from the month of startDate
  current = new Date(startDate);

  while (current <= endDate) {
    var chunkEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0); // last day of month
    if (chunkEnd > endDate) chunkEnd = new Date(endDate);

    pullDateRange(sheet, current, chunkEnd);

    // Advance to first day of next month
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  Logger.log('Done. Last row: ' + sheet.getLastRow());
}

function pullDateRange(sheet, startDate, endDate) {
  var since = formatDate(startDate);
  var until = formatDate(endDate);

  // GAQL query — supported in Google Ads Scripts via AdsApp.search()
  var query =
    'SELECT ' +
      'segments.date, ' +
      'campaign.name, ' +
      'metrics.impressions, ' +
      'metrics.clicks, ' +
      'metrics.cost_micros, ' +
      'metrics.conversions ' +
    'FROM campaign ' +
    "WHERE segments.date BETWEEN '" + since + "' AND '" + until + "' " +
    "ORDER BY segments.date ASC";

  var rows = [];
  var result = AdsApp.search(query);

  while (result.hasNext()) {
    var row = result.next();
    rows.push([
      row.segments.date,
      row.campaign.name || '',
      parseInt(row.metrics.impressions || 0),
      parseInt(row.metrics.clicks || 0),
      parseFloat(((parseInt(row.metrics.costMicros || 0)) / 1000000).toFixed(2)),
      parseFloat((row.metrics.conversions || 0).toFixed(2))
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, COLUMNS.length).setValues(rows);
    Logger.log('  Wrote ' + rows.length + ' rows (' + since + ' → ' + until + ')');
  } else {
    Logger.log('  No data for ' + since + ' → ' + until);
  }
}

// ---------------------------------------------------------------------------
// Helpers

function getLastDate(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null; // header only or empty
  var val = sheet.getRange(lastRow, 1).getValue();
  if (!val) return null;
  return parseDate(val.toString().substring(0, 10));
}

function parseDate(str) {
  var p = str.split('-');
  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
}

function formatDate(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function addDays(date, n) {
  var d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function yesterday() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}
