/**
 * audit-dashboards.js
 * For each client, check every major KPI box and explain why it has or doesn't have data.
 */
const fs = require('fs');

function check(val, label) {
  const ok = val != null && val !== '' && !(Array.isArray(val) && val.length === 0);
  return (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : ' → ' + (val === null ? 'null' : Array.isArray(val) ? 'empty array' : 'missing'));
}

const clients = ['sunflower','dons-heating','good-to-be-clean','stewardright','killergrowth'];

clients.forEach(slug => {
  const d = JSON.parse(fs.readFileSync('data/' + slug + '.json', 'utf8'));
  const o = d.overview || {};
  const seo = d.seo || {};
  const ads = d.ads || {};
  const gbp = d.gbp || {};
  const soc = d.social || {};
  const web = d.website || {};
  const mb  = ads.monthlyBreakdown || [];
  const curr = mb.length ? mb[mb.length-1] : {};

  console.log('\n══════════════════════════════');
  console.log(' ' + d.client + ' (' + d.period + ')');
  console.log('══════════════════════════════');

  console.log('\n── SEO ──');
  console.log(check(o.rankingsTop10,     'Keyword Rankings Top 10'));
  console.log(check(seo.organicSessions && seo.organicSessions.length, 'Organic Sessions over time'));
  console.log(check(seo.keywords && seo.keywords.length, 'Keyword table'));
  console.log(check(seo.trafficChannels && seo.trafficChannels.length, 'Traffic channels chart'));

  console.log('\n── PAID ADS ──');
  console.log(check(o.adSpend || curr.adSpend,       'Ad Spend'));
  console.log(check(o.adImpressions || curr.adImpressions, 'Ad Impressions'));
  console.log(check(o.adClicks || curr.adClicks,     'Ad Clicks'));
  console.log(check(mb.length,                        'Monthly trend chart (' + mb.length + ' months)'));
  console.log(check(ads.campaigns && ads.campaigns.length, 'Campaign breakdown table'));

  console.log('\n── GBP ──');
  console.log(check(gbp.totalViews,    'Profile Views'));
  console.log(check(gbp.calls,         'Calls'));
  console.log(check(gbp.directions,    'Direction Requests'));
  console.log(check(gbp.avgRating,     'Avg Rating'));
  console.log(check(gbp.viewsOverTime && gbp.viewsOverTime.length, 'Views over time chart'));

  console.log('\n── SOCIAL ──');
  console.log(check(o.socialReach || (soc.platforms && soc.platforms[0] && soc.platforms[0].reach), 'Organic Reach'));
  console.log(check(soc.platforms && soc.platforms[0] && soc.platforms[0].followers, 'Page Followers'));
  console.log(check(soc.monthlyHistory && soc.monthlyHistory.length, 'Monthly reach/engagement chart (' + (soc.monthlyHistory||[]).length + ' months)'));

  console.log('\n── WEBSITE / PSI ──');
  console.log(check(web.psiScores && web.psiScores.mobile && web.psiScores.mobile.performance, 'PSI Mobile scores'));
  console.log(check(web.psiScores && web.psiScores.desktop && web.psiScores.desktop.performance, 'PSI Desktop scores'));
  console.log(check(web.psiHistory && web.psiHistory.length, 'PSI history chart (' + (web.psiHistory||[]).length + ' entries)'));
  console.log(check(web.sessionsOverTime && web.sessionsOverTime.length, 'Website sessions chart'));
});
