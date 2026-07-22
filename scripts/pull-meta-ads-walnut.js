/**
 * pull-meta-ads-walnut.js
 * Pulls Facebook Ads data for Walnut Valley Meat Market
 *
 * Campaign: KG | Traffic campaign | single images | 1-30-26
 * Campaign ID: 120239372794470031
 *
 * Outputs:
 *   - ads.monthlyBreakdown   — campaign-level spend by month (YTD)
 *   - ads.adBreakdown        — per-ad performance for last 30 days (ads with spend only)
 *   - overview.adSpend       — current month spend
 *   - overview.adImpressions — current month impressions
 *
 * Usage:
 *   node scripts/pull-meta-ads-walnut.js
 *
 * Requires: META_SYSTEM_TOKEN env var (or uses credentials.md token directly)
 */

const fs   = require('fs');
const path = require('path');

const TOKEN      = process.env.META_SYSTEM_TOKEN || 'EAANLZCzlKBiEBRP5ZC4BRXJQFT3nptpeOqLZClhroEZANazWl85ZArDg0dpuqG0wUcuCdpG5p6N6LYpwhzPbl0ZCew1M29pjLvQcrqZAehNTcsWlZCk0tFpczwAZBJw6ZCDGXGVbIF5TPZAUNm1ZBFax6VEc7A7tzMPYY7GmZCPt4yrZCgniPHIHhRd7ytQOcZBFjZAg2kQcOAZDZD';
const CAMPAIGN_ID = '120239372794470031';
const BASE        = 'https://graph.facebook.com/v21.0';
const DATA_FILE   = path.join(__dirname, '..', 'data', 'walnut-valley.json');

async function get(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Meta API error: ${json.error.message} (code ${json.error.code})`);
  return json;
}

function fmtMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function last30Days() {
  const now = new Date();
  const until = now.toISOString().split('T')[0];
  const since = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return { since, until };
}

function ytdRange() {
  const now = new Date();
  const until = now.toISOString().split('T')[0];
  return { since: '2026-01-01', until };
}

async function pullCampaignMonthly() {
  const { since, until } = ytdRange();
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }));
  const url = `${BASE}/${CAMPAIGN_ID}/insights?fields=spend,clicks,impressions,reach,ctr,cpc&time_range=${timeRange}&time_increment=monthly&access_token=${TOKEN}`;
  const data = await get(url);

  return (data.data || []).map(row => ({
    month:         fmtMonth(row.date_start),
    adSpend:       row.spend       ? parseFloat(parseFloat(row.spend).toFixed(2))       : 0,
    adClicks:      row.clicks      ? parseInt(row.clicks)      : 0,
    adImpressions: row.impressions ? parseInt(row.impressions) : 0,
    adReach:       row.reach       ? parseInt(row.reach)       : 0,
    ctr:           row.ctr         ? parseFloat(parseFloat(row.ctr).toFixed(2))         : 0,
    cpc:           row.cpc         ? parseFloat(parseFloat(row.cpc).toFixed(3))         : 0,
    adLeads:       null
  }));
}

async function pullAdBreakdown() {
  const { since, until } = last30Days();

  // Get all ads in campaign
  const adsData = await get(`${BASE}/${CAMPAIGN_ID}/ads?fields=id,name,status&limit=50&access_token=${TOKEN}`);
  const ads = adsData.data || [];

  const results = [];
  for (const ad of ads) {
    try {
      const timeRange = encodeURIComponent(JSON.stringify({ since, until }));
      const url = `${BASE}/${ad.id}/insights?fields=spend,clicks,impressions,reach,ctr,cpc,actions&time_range=${timeRange}&access_token=${TOKEN}`;
      const insightData = await get(url);
      const row = (insightData.data || [])[0];
      if (!row || !row.spend || parseFloat(row.spend) === 0) continue; // skip zero-spend ads

      const leads = (row.actions || []).find(
        a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.lead'
      );

      const spend       = row.spend       ? parseFloat(parseFloat(row.spend).toFixed(2))      : 0;
      const impressions = row.impressions ? parseInt(row.impressions) : 0;
      const clicks      = row.clicks      ? parseInt(row.clicks)      : 0;
      const reach       = row.reach       ? parseInt(row.reach)       : 0;
      const ctr         = row.ctr         ? parseFloat(parseFloat(row.ctr).toFixed(2))  : 0;
      const cpc         = row.cpc         ? parseFloat(parseFloat(row.cpc).toFixed(3))  : 0;
      // CPM = spend / impressions * 1000
      const cpm         = impressions > 0 ? parseFloat((spend / impressions * 1000).toFixed(3)) : null;

      results.push({
        adId:       ad.id,
        adName:     ad.name,
        live:       ad.status === 'ACTIVE',
        spend,
        clicks,
        impressions,
        reach,
        // template fields
        ctrAll:     ctr,      // overall CTR
        ctrLink:    null,     // link CTR not available via this endpoint without action_values
        cpm,
        lpViews:    null,     // landing page views not available without pixel events
        costPerLP:  null,     // no LP views = no cost/LP
        cpc,
        leads:      leads ? parseInt(leads.value) : 0
      });
    } catch (e) {
      console.warn(`  [skip] ${ad.name}: ${e.message}`);
    }
  }

  // Sort by spend descending
  results.sort((a, b) => b.spend - a.spend);
  return results;
}

async function main() {
  console.log('Pulling Walnut Valley Meta Ads...');

  const [monthly, adBreakdown] = await Promise.all([
    pullCampaignMonthly(),
    pullAdBreakdown()
  ]);

  console.log(`Campaign monthly: ${monthly.length} months`);
  console.log(`Ad breakdown: ${adBreakdown.length} ads with spend in last 30 days`);

  // Current month spend (last entry in monthly)
  const currentMonth = monthly[monthly.length - 1] || {};

  // Load existing data file
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Merge
  existing.overview.adSpend       = currentMonth.adSpend       ?? existing.overview.adSpend;
  existing.overview.adImpressions = currentMonth.adImpressions ?? existing.overview.adImpressions;

  existing.ads = {
    campaignName:    'KG | Traffic Campaign | Single Images',
    campaignId:      CAMPAIGN_ID,
    dateRangeLabel:  'Last 30 days (ad breakdown) / YTD (monthly)',
    monthlyBreakdown: monthly,
    adBreakdown:     adBreakdown
  };

  existing.generatedAt = new Date().toISOString();

  fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');
  console.log('data/walnut-valley.json updated.');

  // Print summary
  adBreakdown.forEach(a => {
    console.log(`  ${a.adName}: $${a.spend} | ${a.clicks} clicks | ${a.ctr}% CTR | $${a.cpc} CPC`);
  });
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
