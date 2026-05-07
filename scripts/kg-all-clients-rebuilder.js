/**
 * KG Google Ads — all_clients Auto-Rebuilder
 * ===========================================
 * Container-bound Apps Script attached to the "KG Google Ads Data" sheet.
 *
 * INSTALL (one time):
 *   1. Open the sheet → Extensions → Apps Script
 *   2. Paste this entire file, replacing any existing content
 *   3. Save (Ctrl+S)
 *   4. Run rebuildAllClients() once manually (to build the view right now)
 *   5. Run installDailyTrigger() once (sets up 7am daily auto-rebuild)
 *      ⚠️ Only run installDailyTrigger() ONCE — it cleans up old triggers
 *         before adding new ones, but no need to run it again unless you
 *         want to change the trigger time.
 *
 * HOW IT WORKS:
 *   - Scans every tab in the sheet except "all_clients"
 *   - Unions all data rows, prepending the tab name as client_id
 *   - Writes the result to all_clients, replacing previous content
 *   - Runs daily at 7am (after all Ads Scripts have finished at 6:x5am)
 *
 * ADDING A NEW CLIENT:
 *   Just install the Ads Script in their Google Ads account.
 *   The next time rebuildAllClients() runs (or on the next Ads Script run),
 *   the new client's tab will be picked up automatically.
 *   No formula changes needed.
 */

// ---------------------------------------------------------------------------

/**
 * Normalize a date value to YYYY-MM-DD string regardless of how Sheets stored it.
 * Handles: Date objects, '2026-01-01' strings, '1/1/2026' locale strings.
 */
function isoDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var mo = String(val.getMonth() + 1).padStart(2, '0');
    var d  = String(val.getDate()).padStart(2, '0');
    return y + '-' + mo + '-' + d;
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
  return s;
}

/**
 * Rebuild the all_clients tab from all per-client tabs.
 * Safe to run any time — always does a full replace, never appends duplicates.
 */
function rebuildAllClients() {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();

  // Get or create all_clients tab
  var dest = ss.getSheetByName('all_clients');
  if (!dest) {
    dest = ss.insertSheet('all_clients');
  }

  // Clear existing content
  dest.clearContents();

  // Write header
  var header = ['client_id', 'date', 'campaign_name', 'impressions', 'clicks', 'cost_usd', 'conversions'];
  dest.getRange(1, 1, 1, header.length).setValues([header]);

  // Collect all rows from every client tab
  var allRows = [];

  for (var i = 0; i < allSheets.length; i++) {
    var sheet = allSheets[i];
    var name  = sheet.getName();

    // Skip the aggregator tab itself
    if (name === 'all_clients') continue;

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) continue; // empty or header only

    // Read all data rows (skip header row)
    var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

    for (var j = 0; j < data.length; j++) {
      var row = data[j];
      if (!row[0]) continue; // skip empty rows (date missing)
      allRows.push([name, isoDate(row[0]), row[1], row[2], row[3], row[4], row[5]]);
    }
  }

  if (allRows.length === 0) {
    Logger.log('all_clients: no data found in any client tab.');
    return;
  }

  // Write all rows in one call (efficient — single Sheets API call)
  dest.getRange(2, 1, allRows.length, 7).setValues(allRows);

  var clientTabs = allSheets.filter(function(s) { return s.getName() !== 'all_clients'; }).length;
  Logger.log('all_clients rebuilt: ' + allRows.length + ' rows from ' + clientTabs + ' client tab(s).');
}

// ---------------------------------------------------------------------------

/**
 * Install a daily time-based trigger for rebuildAllClients().
 * Run this ONCE from the Apps Script editor.
 * Cleans up existing triggers before adding a new one to prevent duplicates.
 */
function installDailyTrigger() {
  // Remove any existing triggers for this function
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'rebuildAllClients') {
      ScriptApp.deleteTrigger(existing[i]);
      Logger.log('Removed existing trigger.');
    }
  }

  // Daily at 7am — after all Ads Scripts have finished (stagger ends at ~6:20am)
  ScriptApp.newTrigger('rebuildAllClients')
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .create();

  Logger.log('Trigger installed: rebuildAllClients() runs daily at 7am.');
}
