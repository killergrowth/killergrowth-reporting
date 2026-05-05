#!/usr/bin/env node
/**
 * build-report.js — Pull all data sources and write data/<client>.json
 *
 * Usage:
 *   node scripts/build-report.js <client-slug>
 *   node scripts/build-report.js killergrowth
 *
 * Reads client config from scripts/clients.json
 * Writes to data/<client-slug>.json
 *
 * All secrets via env vars (set in GitHub Actions or locally):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — stringified service account JSON
 *   GBP_REFRESH_TOKEN            — GBP OAuth refresh token
 *   GBP_CLIENT_ID                — GBP OAuth client ID
 *   GBP_CLIENT_SECRET            — GBP OAuth client secret
 *   META_SYSTEM_TOKEN            — Meta system user token
 *   GHL_API_KEY                  — GHL private integration token
 *   DATAFORSEO_LOGIN             — DataForSEO login email
 *   DATAFORSEO_PASSWORD          — DataForSEO password
 */

const fs      = require('fs');
const path    = require('path');

const { pullGA4 }        = require('./pull-ga4');
const { pullGSC }        = require('./pull-gsc');
const { pullGBP }        = require('./pull-gbp');
const { pullMeta }       = require('./pull-meta');
const { pullGHL }        = require('./pull-ghl');
const { pullDataForSEO } = require('./pull-dataforseo');

const ROOT    = path.join(__dirname, '..');
const clients = JSON.parse(fs.readFileSync(path.join(__dirname, 'clients.json'), 'utf8'));

function getPeriodLabel() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

async function buildReport(slug) {
  const client = clients[slug];
  if (!client) {
    console.error(`Unknown client slug: ${slug}`);
    console.error(`Known clients: ${Object.keys(clients).join(', ')}`);
    process.exit(1);
  }

  console.log(`\nBuilding report for: ${client.name} (${slug})`);
  console.log('---');

  // Load existing data file as base (preserves manual edits)
  const dataPath = path.join(ROOT, 'data', `${slug}.json`);
  const base = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : {};

  // Pull all sources in parallel
  const [ga4, gsc, gbp, meta, ghl, dfs] = await Promise.allSettled([
    pullGA4(client.ga4PropertyId),
    pullGSC(client.gscSiteUrl),
    pullGBP(client.gbpAccountId, client.gbpLocationId),
    pullMeta(client.metaPageId, client),
    pullGHL(client.ghlLocationId),
    pullDataForSEO(client.dataForSeoTarget)
  ]);

  const v = r => r.status === 'fulfilled' ? r.value : null;

  // Merge into schema
  const report = {
    client:       client.name,
    slug,
    period:       getPeriodLabel(),
    generatedAt:  new Date().toISOString(),

    overview: {
      sessions:         v(ga4)?.sessions         ?? base.overview?.sessions         ?? null,
      sessionsDelta:    v(ga4)?.sessionsDelta     ?? base.overview?.sessionsDelta    ?? null,
      leads:            v(ghl)?.newContacts       ?? base.overview?.leads            ?? null,
      leadsDelta:       base.overview?.leadsDelta ?? null,
      rankingsTop10:    v(gsc)?.rankingsTop10     ?? v(dfs)?.rankingsTop10           ?? base.overview?.rankingsTop10 ?? null,
      rankingsDelta:    base.overview?.rankingsDelta ?? null,
      gbpViews:         v(gbp)?.totalViews        ?? base.overview?.gbpViews         ?? null,
      gbpViewsDelta:    base.overview?.gbpViewsDelta ?? null,
      adSpend:          v(meta)?.adSpend          ?? base.overview?.adSpend    ?? null,
      adBudget:         base.overview?.adBudget   ?? null,
      costPerLead:      (v(meta)?.adSpend && v(meta)?.adLeads) ? parseFloat((v(meta).adSpend / v(meta).adLeads).toFixed(2)) : (base.overview?.costPerLead ?? null),
      costPerLeadDelta: base.overview?.costPerLeadDelta ?? null,
      socialReach:      v(meta)?.reach            ?? base.overview?.socialReach      ?? null,
      socialReachDelta: base.overview?.socialReachDelta ?? null,
      reviewCount:      v(gbp)?.totalReviews      ?? base.overview?.reviewCount      ?? null,
      avgRating:        v(gbp)?.avgRating         ?? base.overview?.avgRating        ?? null
    },

    seo: {
      organicSessions: v(ga4)?.sessionsOverTime  ?? base.seo?.organicSessions ?? [],
      trafficChannels: v(ga4)?.trafficChannels   ?? base.seo?.trafficChannels ?? [],
      keywords:        v(gsc)?.keywords          ?? v(dfs)?.keywords          ?? base.seo?.keywords ?? []
    },

    ads: base.ads ?? { spendByWeek: [], campaigns: [] },

    gbp: {
      totalViews:   v(gbp)?.totalViews    ?? base.gbp?.totalViews   ?? null,
      calls:        v(gbp)?.calls         ?? base.gbp?.calls        ?? null,
      callsDelta:   base.gbp?.callsDelta  ?? null,
      directions:   v(gbp)?.directions    ?? base.gbp?.directions   ?? null,
      directionsDelta: base.gbp?.directionsDelta ?? null,
      viewsOverTime: v(gbp)?.viewsOverTime ?? base.gbp?.viewsOverTime ?? [],
      totalReviews:  v(gbp)?.totalReviews  ?? base.gbp?.totalReviews  ?? null,
      newThisMonth:  v(gbp)?.newReviews    ?? base.gbp?.newThisMonth  ?? null,
      avgRating:     v(gbp)?.avgRating     ?? base.gbp?.avgRating     ?? null
    },

    social: {
      reachByWeek: base.social?.reachByWeek ?? [],
      platforms: v(meta) ? [
        { platform: 'Facebook', reach: v(meta).reach, engagements: v(meta).engagements, followers: v(meta).followers }
      ] : (base.social?.platforms ?? [])
    },

    website: {
      sessionsOverTime: v(ga4)?.sessionsOverTime ?? base.website?.sessionsOverTime ?? [],
      vitals: base.website?.vitals ?? { lcp: null, cls: null, inp: null, pagespeedMobile: null }
    }
  };

  fs.writeFileSync(dataPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nWrote ${dataPath}`);

  // Summary
  console.log('\nPull summary:');
  console.log(`  GA4:         ${v(ga4) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GSC:         ${v(gsc) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GBP:         ${v(gbp) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  Meta:        ${v(meta) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GHL:         ${v(ghl) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  DataForSEO:  ${v(dfs) ? 'OK' : 'SKIPPED/ERROR'}`);

  if (ga4.status === 'rejected')  console.log('  GA4 error:',  ga4.reason?.message);
  if (gsc.status === 'rejected')  console.log('  GSC error:',  gsc.reason?.message);
  if (gbp.status === 'rejected')  console.log('  GBP error:',  gbp.reason?.message);
  if (meta.status === 'rejected') console.log('  Meta error:', meta.reason?.message);
  if (ghl.status === 'rejected')  console.log('  GHL error:',  ghl.reason?.message);
  if (dfs.status === 'rejected')  console.log('  DFS error:',  dfs.reason?.message);
}

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/build-report.js <client-slug>');
  process.exit(1);
}

buildReport(slug).catch(e => { console.error(e); process.exit(1); });
