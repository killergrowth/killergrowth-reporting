#!/usr/bin/env node
/**
 * pull-monday.js — Pull completed work items from Monday.com Projects & Tasks board
 *
 * Writes per-client work logs to: data/work-logs/<slug>.json
 *
 * Matching strategy (in priority order):
 *   1. connect_boards "Client" column — if populated, use it (clean match)
 *   2. Item name fuzzy-match against client display names + known aliases
 *   3. Group context (e.g. "Website Build (Tyler B)" items are named after clients directly)
 *
 * Usage:
 *   node scripts/pull-monday.js                  — all clients
 *   node scripts/pull-monday.js sunflower        — one client
 *
 * Env vars:
 *   MONDAY_TOKEN   Personal API token for Monday.com (Tyler B)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const CLIENTS    = JSON.parse(fs.readFileSync(path.join(__dirname, 'clients.json'), 'utf8'));
const WORK_LOGS  = path.join(ROOT, 'data', 'work-logs');

// Board IDs
const BOARD_PARENT   = 10078098401; // Projects & Tasks
const BOARD_SUBITEMS = 10078101097; // Subitems of Projects & Tasks

// Status values that count as "completed" work
const DONE_STATUSES = ['Done', 'Complete', 'Completed', 'Sent', 'Live', 'Launched', 'Published'];

// How far back to look (days)
const LOOKBACK_DAYS = 180;

// ---------------------------------------------------------------------------
// Client name → slug mapping + aliases for fuzzy matching
// ---------------------------------------------------------------------------
const CLIENT_ALIASES = {
  'killergrowth':   ['KillerGrowth', 'Killer Growth', 'KG'],
  'sunflower':      ['Sunflower Plumbing', 'Sunflower'],
  'dons-heating':   ["Don's Heating", "Dons Heating", "Don's Heating & Air", "Don's HVAC"],
  'good-to-be-clean': ['Good to Be Clean', 'Good To Be Clean', 'GTBC', 'Good2BClean'],
  'timnath':        ['Timnath Painting', 'Timnath', 'Timnath Painting LLC'],
  'walnut-valley':  ['Walnut Valley Meat Market', 'Walnut Valley', 'WVMM'],
  'stewardright':   ['StewardRight', 'Steward Right'],
  'goff':           ['Goff Heating & Air', 'Goff Heating', 'Goff Heating and Air', 'Goff'],
  '316-health':     ['316 Health Insurance', '316 Health', '316'],
  'learning-lab':   ['Learning Lab'],
  'wheatland':      ['Wheatland Construction', 'Wheatland'],
  '360-painting':   ['360 Painting'],
  'alex-miller':    ['Alex Miller Auctioneer', 'Alex Miller'],
  'cogans-woodshop':['Cogan\'s Woodshop', 'Cogans Woodshop', 'Cogan\'s Wood Shop'],
  'iserve-facilities': ['IServe Facilities', 'IServe', 'iServe'],
  'shaws-pest':     ["Shaw's Pest Control", "Shaws Pest Control", "Shaw's Pest"],
  'prairie-pots':   ['Prairie Pots'],
  'demo-sales':     ['Demo Sales'],
  'diamond-springs':['Diamond Springs Ranch', 'Diamond Springs'],
};

// Build reverse lookup: normalised alias → slug
const ALIAS_MAP = {};
for (const [slug, aliases] of Object.entries(CLIENT_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_MAP[alias.toLowerCase().trim()] = slug;
  }
}

function matchClientFromText(text) {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  // Exact match first
  if (ALIAS_MAP[t]) return ALIAS_MAP[t];
  // Partial match — text contains an alias
  for (const [alias, slug] of Object.entries(ALIAS_MAP)) {
    if (t.includes(alias)) return slug;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Monday API helper
// ---------------------------------------------------------------------------
async function mondayQuery(query, token) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Monday API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`Monday API errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// ---------------------------------------------------------------------------
// Pull parent items WITH nested subitems from a board (paginated)
// ---------------------------------------------------------------------------
async function pullBoardItemsWithSubitems(boardId, token) {
  const items = [];
  let cursor = null;

  do {
    const cursorArg = cursor ? `, cursor: "${cursor}"` : '';
    const query = `{
      boards(ids: [${boardId}]) {
        items_page(limit: 200${cursorArg}) {
          cursor
          items {
            id
            name
            group { id title }
            updated_at
            column_values(ids: ["connect_boards","color_mkvx2hdn","date_mkvxgvc6","person"]) {
              id text value
            }
            subitems {
              id
              name
              updated_at
              column_values(ids: ["status","color_mkvx2hdn","date0","date_mkvxgvc6","person"]) {
                id text value
              }
            }
          }
        }
      }
    }`;

    const data = await mondayQuery(query, token);
    const page = data.boards[0].items_page;
    items.push(...page.items);
    cursor = page.cursor ?? null;
  } while (cursor);

  return items;
}

// ---------------------------------------------------------------------------
// Main pull
// ---------------------------------------------------------------------------
async function pullMonday(targetSlug = null) {
  const token = process.env.MONDAY_TOKEN;
  if (!token) throw new Error('MONDAY_TOKEN env var not set');

  if (!fs.existsSync(WORK_LOGS)) fs.mkdirSync(WORK_LOGS, { recursive: true });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);

  console.log(`\nPulling Monday.com Projects & Tasks (last ${LOOKBACK_DAYS} days)...`);

  // Pull parent items WITH nested subitems
  const parentItems = await pullBoardItemsWithSubitems(BOARD_PARENT, token);
  console.log(`  Parent board: ${parentItems.length} items (with subitems inline)`);

  // Group resolved items by client slug
  const bySlug = {};

  // Helper: resolve a done entry and push to bySlug
  // statusColIds: ordered list of column ids to check for status (parent uses color_mkvx2hdn, subitems use status)
  function resolveEntry(item, overrideSlug, parentName, statusColIds = ['color_mkvx2hdn', 'status']) {
    // Find the first populated status column
    const statusCol = statusColIds.map(id => item.column_values.find(c => c.id === id)).find(c => c && c.text);
    const status = statusCol?.text ?? '';
    const isDone = DONE_STATUSES.some(s => s.toLowerCase() === status.toLowerCase());
    const inCompletedGroup = item.group?.title?.toLowerCase() === 'completed';
    if (!isDone && !inCompletedGroup) return;

    // Date: changed_at from status JSON → due date (date_mkvxgvc6 or date0) → updated_at
    let itemDate;
    try {
      const statusVal = statusCol?.value ? JSON.parse(statusCol.value) : null;
      if (statusVal?.changed_at) itemDate = new Date(statusVal.changed_at);
    } catch { /* ignore */ }
    if (!itemDate) {
      const dueDateCol = item.column_values.find(c => c.id === 'date_mkvxgvc6' || c.id === 'date0');
      const dateStr = dueDateCol?.text || item.updated_at;
      if (!dateStr) return;
      itemDate = new Date(dateStr);
    }
    if (itemDate < cutoff) return;

    const personCol = item.column_values.find(c => c.id === 'person');
    const owner = personCol?.text ?? null;

    const slug = overrideSlug;
    if (!slug) return;
    if (targetSlug && slug !== targetSlug) return;

    if (!bySlug[slug]) bySlug[slug] = [];
    bySlug[slug].push({
      id:         item.id,
      title:      parentName ? `${parentName} — ${item.name}` : item.name,
      status,
      date:       itemDate.toISOString().split('T')[0],
      owner:      owner || null,
      group:      item.group?.title ?? null,
      source:     'monday',
    });
  }

  for (const parent of parentItems) {
    // Determine client slug from the parent item
    const clientCol = parent.column_values.find(c => c.id === 'connect_boards');
    let slug = matchClientFromText(clientCol?.text ?? '');
    if (!slug) slug = matchClientFromText(parent.name);

    // Process the parent item itself as a potential done entry
    if (slug) resolveEntry(parent, slug, null);

    // Process all subitems — use parent's client slug (subitems don't have client column)
    if (parent.subitems?.length) {
      // If parent slug is unknown, try to infer from parent name for subitems too
      const subSlug = slug;
      if (subSlug) {
        for (const sub of parent.subitems) {
          // Attach group from parent for context
          sub.group = parent.group;
          // Subitems use 'status' column; pass that first
          resolveEntry(sub, subSlug, parent.name, ['status', 'color_mkvx2hdn']);
        }
      }
    }
  }

  // Sort each client's log newest-first, deduplicate by id
  const slugsToWrite = targetSlug ? [targetSlug] : Object.keys(bySlug);
  const results = {};

  for (const slug of slugsToWrite) {
    const entries = bySlug[slug] ?? [];
    // Deduplicate
    const seen = new Set();
    const unique = entries.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    // Sort newest first
    unique.sort((a, b) => b.date.localeCompare(a.date));

    // Merge with any existing non-monday entries (e.g. future feedbucket source)
    const logPath = path.join(WORK_LOGS, `${slug}.json`);
    const existing = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
      : [];
    const nonMonday = existing.filter(e => e.source !== 'monday');
    const merged = [...unique, ...nonMonday].sort((a, b) => b.date.localeCompare(a.date));

    fs.writeFileSync(logPath, JSON.stringify(merged, null, 2) + '\n', { encoding: 'utf8', flag: 'w' });
    results[slug] = merged.length;
    console.log(`  ${slug}: ${unique.length} monday items written (${merged.length} total)`);
  }

  // For slugs that had no items found, write empty array (don't leave stale data)
  if (!targetSlug) {
    for (const slug of Object.keys(CLIENTS)) {
      if (!bySlug[slug]) {
        const logPath = path.join(WORK_LOGS, `${slug}.json`);
        const existing = fs.existsSync(logPath)
          ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
          : [];
        // Preserve non-monday entries, wipe old monday entries (they aged out of lookback window)
        const nonMonday = existing.filter(e => e.source !== 'monday');
        if (nonMonday.length !== existing.length || !fs.existsSync(logPath)) {
          fs.writeFileSync(logPath, JSON.stringify(nonMonday, null, 2), 'utf8');
        }
      }
    }
  }

  console.log(`\nDone. Work logs written to data/work-logs/`);
  return results;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
const targetSlug = process.argv[2] ?? null;
pullMonday(targetSlug).catch(err => {
  console.error('pull-monday.js failed:', err.message);
  process.exit(1);
});

module.exports = { pullMonday };
