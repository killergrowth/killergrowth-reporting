#!/usr/bin/env node
/**
 * build-report.js  Pull all data sources and write data/<client>.json
 *
 * Usage:
 *   node scripts/build-report.js <client-slug>
 *   node scripts/build-report.js killergrowth
 *
 * Reads client config from scripts/clients.json
 * Writes to data/<client-slug>.json
 *
 * All secrets via env vars (set in GitHub Actions or locally):
 *   GOOGLE_SERVICE_ACCOUNT_JSON   stringified service account JSON
 *   GBP_REFRESH_TOKEN             GBP OAuth refresh token
 *   GBP_CLIENT_ID                 GBP OAuth client ID
 *   GBP_CLIENT_SECRET             GBP OAuth client secret
 *   META_SYSTEM_TOKEN             Meta system user token
 *   GHL_API_KEY                   GHL private integration token
 *   DATAFORSEO_LOGIN              DataForSEO login email
 *   DATAFORSEO_PASSWORD           DataForSEO password
 */

const fs      = require('fs');
const path    = require('path');

const { pullGA4 }        = require('./pull-ga4');
const { pullGSC }        = require('./pull-gsc');
const { pullGBP }        = require('./pull-gbp');
const { pullMeta }       = require('./pull-meta');
const { pullGHL }        = require('./pull-ghl');
const { pullDataForSEO }    = require('./pull-dataforseo');
const { pullGoogleAds }     = require('./pull-google-ads');
const { pullPageSpeed }     = require('./pull-pagespeed');
const { pullLocalFalcon }     = require('./pull-localfalcon');
const { pullBrandPhrases }    = require('./pull-brand-phrases');
const { pullMonday }          = require('./pull-monday');
const { pullCFAnalytics }     = require('./pull-cf-analytics');
const { pullFathom }          = require('./pull-fathom');

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

  // Report month = previous calendar month
  const now = new Date();
  const reportMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Load existing data file as base (preserves manual edits)
  const dataPath = path.join(ROOT, 'data', `${slug}.json`);
  const base = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : {};

  const lfApiKey = process.env.LF_API_KEY;

  // Pull all sources in parallel
  const [ga4, gsc, gbp, gbp2, gbp3, meta, ghl, dfs, gads, psi, lf, bp, cfa, fathom] = await Promise.allSettled([
    pullGA4(client.ga4PropertyId),
    pullGSC(client.gscSiteUrl),
    pullGBP(client.gbpAccountId, client.gbpLocationId),
    client.gbpLocationId2 ? pullGBP(client.gbpAccountId, client.gbpLocationId2) : Promise.resolve(null),
    client.gbpLocationId3 ? pullGBP(client.gbpAccountId, client.gbpLocationId3) : Promise.resolve(null),
    pullMeta(client.metaPageId, client),
    pullGHL(client.ghlLocationId),
    pullDataForSEO(client.dataForSeoTarget),
    pullGoogleAds(client.googleAdsCustomerId, slug),
    pullPageSpeed(client.dataForSeoTarget),
    (lfApiKey && client.lfPlaceId) ? pullLocalFalcon(client.lfPlaceId, lfApiKey) : Promise.resolve(null),
    (lfApiKey && client.lfPlaceId) ? pullBrandPhrases({ placeId: client.lfPlaceId, brandName: client.name, lfApiKey }) : Promise.resolve(null),
    client.cfZoneTag ? pullCFAnalytics(client.cfZoneTag) : Promise.resolve(null),
    client.fathomSiteId ? pullFathom(client.fathomSiteId, reportMonthRef) : Promise.resolve(null)
  ]);

  const v = r => r.status === 'fulfilled' ? r.value : null;

  // Merge into schema
  const report = {
    client:       client.name,
    slug,
    logoPath:     client.logoPath ?? null,
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
      adSpend:          v(gads)?.spend            ?? v(meta)?.adSpend          ?? base.overview?.adSpend    ?? null,
      adImpressions:    v(gads)?.impressions       ?? base.overview?.adImpressions ?? null,
      adBudget:         base.overview?.adBudget   ?? null,
      costPerLead:      v(gads)?.costPerLead      ?? (v(meta)?.adSpend && v(meta)?.adLeads) ? parseFloat(((v(gads)?.spend ?? v(meta)?.adSpend) / (v(gads)?.leads ?? v(meta)?.adLeads)).toFixed(2)) : (base.overview?.costPerLead ?? null),
      costPerLeadDelta: base.overview?.costPerLeadDelta ?? null,
      socialReach:      v(meta)?.reach            ?? base.overview?.socialReach      ?? null,
      socialReachDelta: base.overview?.socialReachDelta ?? null,
      reviewCount:      v(gbp)?.totalReviews      ?? base.overview?.reviewCount      ?? null,
      avgRating:        v(gbp)?.avgRating         ?? base.overview?.avgRating        ?? null
    },

    seo: {
      organicSessions: v(ga4)?.sessionsOverTime  ?? base.seo?.organicSessions ?? [],
      trafficChannels:      v(ga4)?.trafficChannels      ?? base.seo?.trafficChannels      ?? [],
      organicSearchSources: v(ga4)?.organicSearchSources ?? base.seo?.organicSearchSources ?? [],
      keywords:        v(gsc)?.keywords          ?? v(dfs)?.keywords          ?? base.seo?.keywords ?? [],
      dfsSnapshot:     (() => {
        // Load latest DFS snapshot for this client if it exists
        const dfsFile = path.join(ROOT, 'data', `${slug}-dfs-latest.json`);
        if (fs.existsSync(dfsFile)) {
          try { return JSON.parse(fs.readFileSync(dfsFile, 'utf8')); } catch { return null; }
        }
        return null;
      })(),
      leadSignals: (() => {
        const ls = v(ga4)?.leadSignals ?? base.seo?.leadSignals ?? null;
        if (!ls) return null;
        // Attach GBP call + website click counts for cross-source attribution
        return {
          ...ls,
          gbpCalls:         v(gbp)?.calls         ?? base.seo?.leadSignals?.gbpCalls         ?? 0,
          gbpWebsiteClicks: v(gbp)?.websiteClicks ?? base.seo?.leadSignals?.gbpWebsiteClicks ?? 0,
          gbpDirections:    v(gbp)?.directions    ?? base.seo?.leadSignals?.gbpDirections    ?? 0
          // NOTE: gbp2/gbp3 totals are added at render time from filtered time-series (applyRange)
        };
      })()
    },

    ads: {
      monthlyBreakdown: v(gads)?.monthlyBreakdown?.map(m => ({
        month:         m.month,
        adSpend:       m.adSpend,
        adClicks:      m.adClicks,
        adLeads:       m.adLeads,
        adImpressions: m.adImpressions ?? null,
      })) ?? v(meta)?.monthlyHistory?.map(m => ({
        month:    m.month,
        adSpend:  m.adSpend,
        adClicks: m.adClicks,
        adLeads:  m.adLeads
      })) ?? base.ads?.monthlyBreakdown ?? [],
      spendByWeek:    base.ads?.spendByWeek    ?? [],
      campaigns:      v(gads)?.campaigns       ?? base.ads?.campaigns      ?? [],
      phoneCalls:     v(gads)?.phoneCalls      ?? base.ads?.phoneCalls     ?? null,
      allConversions: v(gads)?.allConversions  ?? base.ads?.allConversions ?? null,
      costPerLead:    v(gads)?.costPerLead     ?? base.ads?.costPerLead    ?? null,
    },

    localFalcon: (() => {
      // Merge fresh LF data with base
      const lfData = {
        lastScanDate:    v(lf)?.lastScanDate    ?? base.localFalcon?.lastScanDate    ?? null,
        topSolv:         v(lf)?.topSolv         ?? base.localFalcon?.topSolv         ?? null,
        topSolvKw:       v(lf)?.topSolvKw       ?? base.localFalcon?.topSolvKw       ?? null,
        avgSolvAll:      v(lf)?.avgSolvAll      ?? base.localFalcon?.avgSolvAll      ?? null,
        avgSaiv:         v(lf)?.avgSaiv         ?? base.localFalcon?.avgSaiv         ?? null,
        googleKeywords:  v(lf)?.googleKeywords  ?? base.localFalcon?.googleKeywords  ?? [],
        aiPlatforms:     v(lf)?.aiPlatforms     ?? base.localFalcon?.aiPlatforms     ?? [],
        topAiKeywords:   v(lf)?.topAiKeywords   ?? base.localFalcon?.topAiKeywords   ?? [],
        brandPhrases:    v(bp)                  ?? base.localFalcon?.brandPhrases    ?? null,
        campaignPublicUrl: client.lfCampaignUrl ?? v(lf)?.campaignPublicUrl ?? base.localFalcon?.campaignPublicUrl ?? null
      };

      // Snapshot history: carry forward existing history, append new month if we have a fresh LF pull
      const existingHistory = Array.isArray(base.localFalcon?.localFalconHistory)
        ? base.localFalcon.localFalconHistory
        : (base.localFalcon?.localFalconHistory ? [base.localFalcon.localFalconHistory] : []);

      if (v(lf) && lfData.avgSaiv != null) {
        // Determine month label from the scan date (or now)
        const scanRaw = lfData.lastScanDate || new Date().toISOString();
        const scanDate = new Date(scanRaw);
        const monthLabel = scanDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        // Only add if this month isn't already recorded
        const alreadyRecorded = existingHistory.some(h => h.month === monthLabel);
        if (!alreadyRecorded) {
          existingHistory.push({
            month:      monthLabel,
            scanDate:   lfData.lastScanDate,
            avgSaiv:    lfData.avgSaiv,
            avgSolvAll: lfData.avgSolvAll,
            platforms:  lfData.aiPlatforms ?? []
          });
          console.log(`  [LocalFalcon] Snapshotted ${monthLabel} into history (${existingHistory.length} total months)`);
        } else {
          console.log(`  [LocalFalcon] History already has ${monthLabel} — no snapshot added`);
        }
      }

      lfData.localFalconHistory = existingHistory;
      return lfData;
    })(),

    gbp: {
      locationName:  client.gbpLocationName  ?? 'Primary',
      totalViews:   v(gbp)?.totalViews    ?? base.gbp?.totalViews   ?? null,
      calls:        v(gbp)?.calls         ?? base.gbp?.calls         ?? null,
      callsDelta:   base.gbp?.callsDelta  ?? null,
      directions:   v(gbp)?.directions    ?? base.gbp?.directions    ?? null,
      websiteClicks: v(gbp)?.websiteClicks ?? base.gbp?.websiteClicks ?? null,
      directionsDelta: base.gbp?.directionsDelta ?? null,
      viewsOverTime: v(gbp)?.viewsOverTime ?? base.gbp?.viewsOverTime ?? [],
      totalReviews:  v(gbp)?.totalReviews  ?? base.gbp?.totalReviews  ?? null,
      newThisMonth:  v(gbp)?.newReviews    ?? base.gbp?.newThisMonth  ?? null,
      avgRating:     v(gbp)?.avgRating     ?? base.gbp?.avgRating     ?? null
    },

    gbp2: client.gbpLocationId2 ? {
      locationName:  client.gbpLocationName2 ?? 'Location 2',
      totalViews:   v(gbp2)?.totalViews    ?? base.gbp2?.totalViews   ?? null,
      calls:        v(gbp2)?.calls         ?? base.gbp2?.calls         ?? null,
      directions:   v(gbp2)?.directions    ?? base.gbp2?.directions    ?? null,
      websiteClicks: v(gbp2)?.websiteClicks ?? base.gbp2?.websiteClicks ?? null,
      viewsOverTime: v(gbp2)?.viewsOverTime ?? base.gbp2?.viewsOverTime ?? [],
      totalReviews:  v(gbp2)?.totalReviews  ?? base.gbp2?.totalReviews  ?? null,
      avgRating:     v(gbp2)?.avgRating     ?? base.gbp2?.avgRating     ?? null
    } : (base.gbp2 ?? null),

    gbp3: client.gbpLocationId3 ? {
      locationName:  client.gbpLocationName3 ?? 'Location 3',
      totalViews:   v(gbp3)?.totalViews    ?? base.gbp3?.totalViews   ?? null,
      calls:        v(gbp3)?.calls         ?? base.gbp3?.calls         ?? null,
      directions:   v(gbp3)?.directions    ?? base.gbp3?.directions    ?? null,
      websiteClicks: v(gbp3)?.websiteClicks ?? base.gbp3?.websiteClicks ?? null,
      viewsOverTime: v(gbp3)?.viewsOverTime ?? base.gbp3?.viewsOverTime ?? [],
      totalReviews:  v(gbp3)?.totalReviews  ?? base.gbp3?.totalReviews  ?? null,
      avgRating:     v(gbp3)?.avgRating     ?? base.gbp3?.avgRating     ?? null
    } : (base.gbp3 ?? null),

    social: {
      monthlyHistory: v(meta)?.monthlyHistory?.map(m => ({
        month:       m.month,
        reach:       m.reach,
        engagements: m.engagements
      })) ?? base.social?.monthlyHistory ?? [],
      reachByWeek: base.social?.reachByWeek ?? [],
      platforms: v(meta) ? [
        { platform: 'Facebook', reach: v(meta).reach, engagements: v(meta).engagements, followers: v(meta).followers }
      ] : (base.social?.platforms ?? [])
    },

    meta: v(meta) ? {
      monthlyBreakdown: v(meta)?.monthlyHistory?.map(m => ({
        month:         m.month,
        adSpend:       m.adSpend       ?? null,
        adClicks:      m.adClicks      ?? null,
        adLeads:       m.adLeads       ?? null,
        adImpressions: m.adImpressions ?? null,
        adReach:       m.reach         ?? null,
      })) ?? base.meta?.monthlyBreakdown ?? [],
      metrics:     v(meta)?.metrics     ?? base.meta?.metrics     ?? null,
      adBreakdown: v(meta)?.adBreakdown ?? base.meta?.adBreakdown ?? [],
      ageGender:   v(meta)?.ageGender   ?? base.meta?.ageGender   ?? [],
      adSpend:       v(meta)?.adSpend       ?? null,
      adClicks:      v(meta)?.adClicks      ?? null,
      adImpressions: v(meta)?.adImpressions ?? null,
      adLeads:       v(meta)?.adLeads       ?? null,
    } : (base.meta ?? null),

    website: {
      sessionsOverTime: v(ga4)?.sessionsOverTime ?? base.website?.sessionsOverTime ?? [],
      aiReferral: v(ga4)?.aiReferral ?? base.website?.aiReferral ?? { total: 0, platforms: [], weeklyTrend: [] },
      vitals: base.website?.vitals ?? { lcp: null, cls: null, inp: null, pagespeedMobile: null },
      // Fathom Analytics (PKG001/PKG002 — preferred over CF WA when fathomSiteId is set)
      analyticsSource:  v(fathom)?.analyticsSource      ?? (client.fathomSiteId ? 'fathom' : null) ?? (v(cfa) ? 'cloudflare' : null) ?? base.website?.analyticsSource ?? null,
      fathomSiteId:     v(fathom)?.fathomSiteId         ?? client.fathomSiteId              ?? base.website?.fathomSiteId ?? null,
      uniques:          v(fathom)?.uniques               ?? base.website?.uniques           ?? null,
      visits:           v(fathom)?.visits                ?? base.website?.visits            ?? null,
      pageviews:        v(fathom)?.pageviews             ?? base.website?.pageviews         ?? null,
      avgDuration:      v(fathom)?.avgDuration           ?? base.website?.avgDuration       ?? null,
      bounceRate:       v(fathom)?.bounceRate            ?? base.website?.bounceRate        ?? null,
      uniquesDelta:     v(fathom)?.uniquesDelta          ?? base.website?.uniquesDelta      ?? null,
      visitsDelta:      v(fathom)?.visitsDelta           ?? base.website?.visitsDelta       ?? null,
      pageviewsDelta:   v(fathom)?.pageviewsDelta        ?? base.website?.pageviewsDelta    ?? null,
      dailyTimeseries:  v(fathom)?.dailyTimeseries       ?? base.website?.dailyTimeseries   ?? [],
      monthlyHistory:   v(fathom)?.monthlyHistory        ?? base.website?.monthlyHistory    ?? [],
      topPages:         v(fathom)?.topPages              ?? base.website?.topPages          ?? [],
      referrers:        v(fathom)?.referrers             ?? base.website?.referrers         ?? [],
      // CF Zone Analytics (legacy — used when fathomSiteId is NOT set)
      cfPageViews:      v(cfa)?.pageViewsThisMonth      ?? base.website?.cfPageViews      ?? null,
      cfUniques:        v(cfa)?.uniqueVisitorsThisMonth  ?? base.website?.cfUniques        ?? null,
      cfPageViewsDelta: v(cfa)?.pageViewsDelta           ?? base.website?.cfPageViewsDelta ?? null,
      cfUniquesDelta:   v(cfa)?.uniquesDelta             ?? base.website?.cfUniquesDelta   ?? null,
      cfDailyPageViews: v(cfa)?.dailyPageViews           ?? base.website?.cfDailyPageViews ?? [],
      cfMonthlyHistory: v(cfa)?.monthlyHistory           ?? base.website?.cfMonthlyHistory ?? [],
      psiScores: v(psi) ?? base.website?.psiScores ?? { mobile: null, desktop: null },
      psiHistory: (() => {
        const existing = base.website?.psiHistory ?? [];
        if (!v(psi)) return existing;
        const today = new Date().toISOString().split('T')[0];
        // Replace today's entry if it exists, otherwise append
        const filtered = existing.filter(e => e.date !== today);
        filtered.push({ date: today, mobile: v(psi).mobile, desktop: v(psi).desktop });
        // Keep last 90 entries
        return filtered.slice(-90);
      })()
    }
  };

  // Pull Monday work log for this client
  try {
    if (process.env.MONDAY_TOKEN) {
      await pullMonday(slug);
    } else {
      console.log('  Monday: SKIPPED (no MONDAY_TOKEN)');
    }
  } catch (e) {
    console.log('  Monday: ERROR —', e.message);
  }

  // Merge persisted work log (survives data pulls)
  const workLogPath = path.join(ROOT, 'data', 'work-logs', `${slug}.json`);
  try { report.workLog = JSON.parse(fs.readFileSync(workLogPath, 'utf8')); } catch { report.workLog = []; }

  fs.writeFileSync(dataPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nWrote ${dataPath}`);

  // Summary
  console.log('\nPull summary:');
  console.log(`  GA4:         ${v(ga4) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GSC:         ${v(gsc) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GBP:         ${v(gbp) ? 'OK' : 'SKIPPED/ERROR'}`);
  if (client.gbpLocationId2) console.log(`  GBP2:        ${v(gbp2) ? 'OK' : 'SKIPPED/ERROR'}`);
  if (client.gbpLocationId3) console.log(`  GBP3:        ${v(gbp3) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  Meta:        ${v(meta) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  GHL:         ${v(ghl) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  DataForSEO:  ${v(dfs) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  Google Ads:  ${v(gads) ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  PageSpeed:   ${v(psi)  ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  LocalFalcon: ${v(lf)   ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  BrandPhrases:${v(bp)   ? 'OK' : 'SKIPPED/ERROR'}`);
  console.log(`  CF Analytics:${v(cfa)  ? 'OK' : 'SKIPPED/ERROR'}`);
  if (lf.status === 'rejected') console.log('  LF error:', lf.reason?.message);
  if (bp.status === 'rejected') console.log('  BP error:', bp.reason?.message);

  console.log(`  Monday:      ${report.workLog?.length > 0 ? `OK (${report.workLog.length} items)` : 'No items matched'}`);
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
