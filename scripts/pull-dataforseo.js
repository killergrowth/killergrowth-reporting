/**
 * pull-dataforseo.js — Pull keyword rankings via DataForSEO
 * Returns: keyword rankings for target domain
 *
 * Requires env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

const BASE = 'https://api.dataforseo.com/v3';

async function dfs(path, body) {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function pullDataForSEO(target) {
  if (!target || target === 'FILL_IN') {
    console.log('[DataForSEO] No target domain — skipping');
    return null;
  }
  if (!process.env.DATAFORSEO_LOGIN) {
    console.log('[DataForSEO] No credentials — skipping');
    return null;
  }

  // Ranked keywords for domain (live endpoint — no task queue needed)
  const result = await dfs('/serp/google/organic/live/regular', [
    {
      target,
      location_code: 2840,     // United States
      language_code: 'en',
      calculate_rectangles: false,
      depth: 100
    }
  ]);

  const items = result?.tasks?.[0]?.result?.[0]?.items || [];

  const keywords = items
    .filter(i => i.type === 'organic' && i.domain === target)
    .slice(0, 25)
    .map(i => ({
      keyword:     i.keyword_data?.keyword || i.title || '',
      position:    i.rank_absolute,
      searchVolume: i.keyword_data?.keyword_info?.search_volume || null
    }));

  const rankingsTop10 = keywords.filter(k => k.position <= 10).length;

  console.log(`[DataForSEO] keywords=${keywords.length} top10=${rankingsTop10}`);

  return { keywords, rankingsTop10 };
}

module.exports = { pullDataForSEO };
