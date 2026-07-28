#!/usr/bin/env node
/**
 * pull-dfs-timnath.js
 *
 * Runs DFS rank tracking for Timnath Painting and writes the result into:
 *   data/timnath-dfs-latest.json   ← always the latest snapshot (used by dashboard)
 *   data/timnath-dfs-YYYY-MM-DD.json ← dated archive
 *
 * Run manually:  node scripts/pull-dfs-timnath.js
 * Scheduled:     weekly via OpenClaw cron (Mondays)
 *
 * Requires DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD env vars (from credentials.md)
 */

// Load env from pipeline dir where .env lives
try {
  require('dotenv').config({ path: require('path').join(__dirname, '../../../tools/hyperlocal-pipeline/.env') });
} catch (e) {
  // dotenv not installed — load .env manually
  const envPath = require('path').join(__dirname, '../../../tools/hyperlocal-pipeline/.env');
  if (require('fs').existsSync(envPath)) {
    require('fs').readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g,'').replace(/^'|'$/g,'');
    });
  }
}

const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');

const ROOT      = path.join(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'data');
const TODAY     = new Date().toISOString().split('T')[0];
const SLUG      = 'timnath-painting';
const DOMAIN    = 'timnathpainting.com';
const LOC_CODE  = 1014517; // Timnath, CO
const LANGUAGE  = 'en';

// Load keyword list from pipeline config
const pipelineConfig = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../../tools/hyperlocal-pipeline/clients/timnath-painting.json'),
    'utf8'
  )
);
const KEYWORDS = pipelineConfig.rankingKeywords;

const DFS_BASE = 'https://api.dataforseo.com/v3';
const DFS_AUTH = Buffer.from(
  `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
).toString('base64');

const dfs = axios.create({
  baseURL: DFS_BASE,
  headers: { Authorization: `Basic ${DFS_AUTH}`, 'Content-Type': 'application/json' },
  timeout: 120000,
});

const BATCH_DELAY = 1500;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Post tasks, wait with retries until done (mirrors dfs-tracker.js pattern)
async function dfsPostAsync(postEndpoint, getEndpoint, payload, initialWaitMs = 45000) {
  const postRes = await dfs.post(postEndpoint, payload);
  if (postRes.data.status_code !== 20000) {
    throw new Error(`DFS post error ${postRes.data.status_code}: ${postRes.data.status_message}`);
  }
  const taskIds = (postRes.data.tasks || []).map(t => t.id).filter(Boolean);
  if (!taskIds.length) return [];

  await sleep(initialWaitMs);

  const allResults = [];
  const pending = [...taskIds];
  let attempts = 0;

  while (pending.length > 0 && attempts < 8) {
    const stillPending = [];
    for (const id of pending) {
      try {
        const r = await dfs.get(`${getEndpoint}/${id}`);
        const tasks = r.data.tasks || [];
        const done = tasks.filter(t => t.status_code === 20000 && t.result && t.result.length > 0);
        // 40601 = handed (not yet assigned), 40602 = in queue
        const queued = tasks.filter(t => t.status_code === 40601 || t.status_code === 40602);
        if (done.length > 0) {
          allResults.push(...done.flatMap(t => t.result || []));
        } else if (queued.length > 0) {
          stillPending.push(id);
        }
        // any other status = failed, skip
      } catch { /* skip */ }
      await sleep(300);
    }
    pending.length = 0;
    if (stillPending.length > 0) {
      console.log(`[DFS] ${stillPending.length} tasks still queued, waiting 25s...`);
      await sleep(25000);
      pending.push(...stillPending);
    }
    attempts++;
  }

  return allResults;
}

async function pullOrganicRanks(keywords) {
  console.log(`[DFS] Pulling organic ranks for ${keywords.length} keywords...`);
  const payload = keywords.map(kw => ({
    keyword:       kw,
    location_code: LOC_CODE,
    language_code: LANGUAGE,
    device:        'desktop',
    depth:         100,
  }));

  const results = await dfsPostAsync(
    '/serp/google/organic/task_post',
    '/serp/google/organic/task_get/advanced',
    payload,
    45000
  );

  const ranks = {};
  for (const r of results) {
    const kw = r.keyword;
    if (!kw) continue;
    let organicRank = null;
    let organicUrl  = null;
    let inAio       = false;
    let citedInAio  = false;

    for (const item of (r.items || [])) {
      // Organic result
      if (item.type === 'organic' && item.domain === DOMAIN && organicRank === null) {
        organicRank = item.rank_absolute;
        organicUrl  = item.url;
      }
      // AI Overview presence
      if (item.type === 'ai_overview') {
        inAio = true;
        const refs = (item.references || []).concat(item.items || []);
        if (refs.some(ref => (ref.domain || ref.url || '').includes(DOMAIN))) {
          citedInAio = true;
        }
      }
    }

    ranks[kw] = { organicRank, organicUrl, inAiOverview: inAio, citedInAiOverview: citedInAio };
  }

  console.log(`[DFS] Organic: got results for ${Object.keys(ranks).length} keywords`);
  return ranks;
}

async function pullMapsRanks(keywords) {
  console.log(`[DFS] Pulling Maps ranks for ${keywords.length} keywords...`);
  // Only localized keywords make sense for Maps — filter to ones with city names
  // or "near me" queries. For broad terms we still check.
  const BATCH = 50;
  const allResults = [];

  for (let i = 0; i < keywords.length; i += BATCH) {
    const batch = keywords.slice(i, i + BATCH);
    const payload = batch.map(kw => ({
      keyword:       kw,
      location_code: LOC_CODE,
      language_code: LANGUAGE,
    }));

    try {
      const results = await dfsPostAsync(
        '/serp/google/maps/task_post',
        '/serp/google/maps/task_get/advanced',
        payload,
        35000
      );
      allResults.push(...results);
    } catch (e) {
      console.warn(`[DFS] Maps batch ${i}-${i+BATCH} failed:`, e.message);
    }

    if (i + BATCH < keywords.length) await sleep(BATCH_DELAY);
  }

  const ranks = {};
  for (const r of allResults) {
    const kw = r.keyword;
    if (!kw) continue;
    let mapsRank = null;

    for (const item of (r.items || [])) {
      if (
        item.type === 'maps_search' &&
        (item.domain || '').includes(DOMAIN) &&
        mapsRank === null
      ) {
        mapsRank = item.rank_absolute;
      }
    }

    ranks[kw] = { mapsRank };
  }

  console.log(`[DFS] Maps: got results for ${Object.keys(ranks).length} keywords`);
  return ranks;
}

async function run() {
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    console.error('[DFS] Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD');
    process.exit(1);
  }

  console.log(`\nDFS rank pull — Timnath Painting — ${TODAY}`);
  console.log(`Keywords: ${KEYWORDS.length}`);
  console.log('---');

  const [organicRanks, mapsRanks] = await Promise.all([
    pullOrganicRanks(KEYWORDS),
    pullMapsRanks(KEYWORDS),
  ]);

  // Merge into unified keyword objects
  const keywords = KEYWORDS.map(kw => {
    const org  = organicRanks[kw] || {};
    const maps = mapsRanks[kw]    || {};
    return {
      keyword:         kw,
      organicRank:     org.organicRank     ?? null,
      organicUrl:      org.organicUrl      ?? null,
      mapsRank:        maps.mapsRank       ?? null,
      inAiOverview:    org.inAiOverview    ?? false,
      citedInAiOverview: org.citedInAiOverview ?? false,
    };
  });

  // Summary stats
  const organicRanked  = keywords.filter(k => k.organicRank !== null).length;
  const mapsRanked     = keywords.filter(k => k.mapsRank !== null).length;
  const organicTop10   = keywords.filter(k => k.organicRank !== null && k.organicRank <= 10).length;
  const mapsTop3       = keywords.filter(k => k.mapsRank !== null && k.mapsRank <= 3).length;
  const aioCited       = keywords.filter(k => k.citedInAiOverview).length;

  const snapshot = {
    client:      'Timnath Painting',
    slug:        SLUG,
    domain:      DOMAIN,
    trackedAt:   new Date().toISOString(),
    locationCode: LOC_CODE,
    keywordCount: keywords.length,
    stats: {
      organicRanked,
      organicTop10,
      mapsRanked,
      mapsTop3,
      aioCited,
    },
    keywords,
  };

  // Write latest + dated archive
  const latestPath = path.join(DATA_DIR, 'timnath-dfs-latest.json');
  const datedPath  = path.join(DATA_DIR, `timnath-dfs-${TODAY}.json`);

  fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 2), 'utf8');
  fs.writeFileSync(datedPath,  JSON.stringify(snapshot, null, 2), 'utf8');

  console.log(`\n✓ Wrote ${latestPath}`);
  console.log(`✓ Wrote ${datedPath}`);
  console.log(`\nSummary:`);
  console.log(`  Organic ranked: ${organicRanked} (top 10: ${organicTop10})`);
  console.log(`  Maps ranked:    ${mapsRanked} (top 3: ${mapsTop3})`);
  console.log(`  AIO cited:      ${aioCited}`);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
