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
const LOOKBACK_DAYS = 90;

// ---------------------------------------------------------------------------
// Client name → slug mapping + aliases for fuzzy matching
// ---------------------------------------------------------------------------
const CLIENT_ALIASES = {
  'killergrowth':   ['KillerGrowth', 'Killer Growth', 'KG'],
  'sunflower':      ['Sunflower Plumbing', 'Sunflower'],
  'dons-heating':   ["Don's Heating", "Dons Heating", "Don's Heating & Air", "Don's HVAC"],
  'good-to-be-clean': ['Good to Be Clean', 'Good To Be Clean', 'GTBC', 'Good2BClean'],
  'timnath':        ['Timnath Painting', 'Timnath'],
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
// Pull items from a board with pagination
// ---------------------------------------------------------------------------
async function pullBoardItems(boardId, columnIds, token) {
  const items = [];
  let cursor = null;

  do {
    const cursorArg = cursor ? `, cursor: "${cursor}"` : '';
    const query = `{
      boards(ids: [${boardId}]) {
        items_page(limit: 500${cursorArg}) {
          cursor
          items {
            id
            name
            group { title }
            updated_at
            column_values(ids: [${columnIds.map(c => `"${c}"`).join(',')}]) {
              id text value
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

  // Pull parent board items
  const parentItems = await pullBoardItems(
    BOARD_PARENT,
    ['connect_boards', 'color_mkvx2hdn', 'date_mkvxgvc6', 'person'],
    token
  );
  console.log(`  Parent board: ${parentItems.length} items`);

  // Pull subitem board items
  const subItems = await pullBoardItems(
    BOARD_SUBITEMS,
    ['connect_boards', 'color_mkvx2hdn', 'date_mkvxgvc6', 'person'],
    token
  );
  console.log(`  Subitems board: ${subItems.length} items`);

  const allItems = [
    ...parentItems.map(i => ({ ...i, _board: 'parent' })),
    ...subItems.map(i => ({ ...i, _board: 'subitems' })),
  ];

  // Group resolved items by client slug
  const bySlug = {};

  for (const item of allItems) {
    const statusCol = item.column_values.find(c => c.id === 'color_mkvx2hdn');
    const status = statusCol?.text ?? '';
    if (!DONE_STATUSES.some(s => s.toLowerCase() === status.toLowerCase())) continue;

    // Date — use updated_at as fallback if Due Date is empty
    const dueDateCol = item.column_values.find(c => c.id === 'date_mkvxgvc6');
    const dateStr = dueDateCol?.text || item.updated_at;
    if (!dateStr) continue;
    const itemDate = new Date(dateStr);
    if (itemDate < cutoff) continue;

    // Owner
    const personCol = item.column_values.find(c => c.id === 'person');
    const owner = personCol?.text ?? '';

    // Determine client slug
    // 1. connect_boards Client column
    const clientCol = item.column_values.find(c => c.id === 'connect_boards');
    let slug = matchClientFromText(clientCol?.text ?? '');

    // 2. Item name fuzzy match
    if (!slug) slug = matchClientFromText(item.name);

    // 3. Group name match (for Website Build groups where item IS the client)
    if (!slug && item.group?.title?.toLowerCase().includes('website build')) {
      slug = matchClientFromText(item.name);
    }

    if (!slug) continue; // can't attribute to a client

    // Skip if filtering to one slug
    if (targetSlug && slug !== targetSlug) continue;

    if (!bySlug[slug]) bySlug[slug] = [];
    bySlug[slug].push({
      id:     item.id,
      title:  item.name,
      status,
      date:   itemDate.toISOString().split('T')[0],
      owner:  owner || null,
      group:  item.group?.title ?? null,
      source: 'monday',
    });
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

    fs.writeFileSync(logPath, JSON.stringify(merged, null, 2), 'utf8');
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
