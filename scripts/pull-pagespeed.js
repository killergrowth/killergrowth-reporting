/**
 * pull-pagespeed.js — Pull PageSpeed Insights scores via PSI API
 * Returns: Performance, Accessibility, Best Practices, SEO scores for mobile + desktop
 *
 * Requires env: PAGESPEED_API_KEY
 * API quota: 25,000 queries/day (2 per client per run)
 */

const PSI_KEY = process.env.PAGESPEED_API_KEY;
const BASE    = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

async function runPSI(url, strategy) {
  const endpoint = `${BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${PSI_KEY}&category=performance&category=accessibility&category=best-practices&category=seo`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`PSI ${strategy} HTTP ${res.status}`);
  return res.json();
}

function extractScores(data) {
  const cats = (data.lighthouseResult || {}).categories || {};
  return {
    performance:    cats.performance    ? Math.round(cats.performance.score    * 100) : null,
    accessibility:  cats.accessibility  ? Math.round(cats.accessibility.score  * 100) : null,
    bestPractices:  cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : null,
    seo:            cats.seo            ? Math.round(cats.seo.score            * 100) : null,
  };
}

async function pullPageSpeed(domain) {
  if (!domain || domain === 'FILL_IN') {
    console.log('[PSI] No domain configured — skipping');
    return null;
  }
  if (!PSI_KEY) {
    console.log('[PSI] No API key — skipping');
    return null;
  }

  const url = domain.startsWith('http') ? domain : `https://${domain}/`;

  const [mobileResult, desktopResult] = await Promise.allSettled([
    runPSI(url, 'mobile'),
    runPSI(url, 'desktop')
  ]);

  const mobile  = mobileResult.status  === 'fulfilled' ? extractScores(mobileResult.value)  : null;
  const desktop = desktopResult.status === 'fulfilled' ? extractScores(desktopResult.value) : null;

  if (mobile)  console.log(`[PSI] Mobile  — Performance: ${mobile.performance}  Accessibility: ${mobile.accessibility}  BP: ${mobile.bestPractices}  SEO: ${mobile.seo}`);
  if (desktop) console.log(`[PSI] Desktop — Performance: ${desktop.performance}  Accessibility: ${desktop.accessibility}  BP: ${desktop.bestPractices}  SEO: ${desktop.seo}`);

  return { mobile, desktop };
}

module.exports = { pullPageSpeed };
