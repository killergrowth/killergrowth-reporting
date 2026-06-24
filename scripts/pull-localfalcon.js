/**
 * pull-localfalcon.js — KillerGrowth Local Falcon Data Pull
 *
 * Pulls latest scan reports for a client location from the Local Falcon API.
 * Returns:
 *   - googleMaps: top keywords by SoLV (Google Maps / local pack)
 *   - aiPlatforms: SAIV per platform (chatgpt, gemini, aimode, grok)
 *   - topSolv: best performing keyword overall
 *   - avgSaiv: average SAIV across all AI scans
 *
 * Auth: Bearer token (LF_API_KEY env var)
 */

const LF_BASE = 'https://api.localfalcon.com';

async function fetchLF(path, apiKey) {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`${LF_BASE}${path}${sep}api_key=${apiKey}`);
  if (!r.ok) throw new Error(`LF API ${r.status}: ${path}`);
  const d = await r.json();
  if (!d.success) throw new Error(`LF error: ${d.message}`);
  return d.data;
}

/**
 * Pull Local Falcon data for a given place_id.
 * Returns structured GEO + local pack data.
 */
async function pullLocalFalcon(placeId, apiKey, options = {}) {
  const limit = options.limit || 50;

  // Fetch recent reports for this location
  const data = await fetchLF(`/v1/reports/?place_id=${placeId}&limit=${limit}`, apiKey);
  const reports = data.reports || [];

  if (!reports.length) {
    console.log('[LocalFalcon] No reports found for place_id:', placeId);
    return null;
  }

  // Separate by platform
  const googleReports  = reports.filter(r => r.platform === 'google');
  const aiReports      = reports.filter(r => ['chatgpt', 'gemini', 'aimode', 'grok'].includes(r.platform));

  // ── GOOGLE MAPS (SoLV) ──────────────────────────────────────────────────────
  // Group by keyword, take latest scan per keyword
  const googleByKw = {};
  for (const r of googleReports) {
    if (!googleByKw[r.keyword] || new Date(r.date) > new Date(googleByKw[r.keyword].date)) {
      googleByKw[r.keyword] = r;
    }
  }

  const googleKws = Object.values(googleByKw)
    .sort((a, b) => parseFloat(b.solv) - parseFloat(a.solv))
    .slice(0, 8)
    .map(r => ({
      keyword: r.keyword,
      solv:    parseFloat(r.solv) || 0,
      arp:     parseFloat(r.arp)  || null,
      date:    r.date,
      reportKey: r.report_key
    }));

  // ── AI PLATFORMS (SAIV) ─────────────────────────────────────────────────────
  // Group by platform, take latest scan per keyword per platform
  const aiByPlatformKw = {};
  for (const r of aiReports) {
    const key = `${r.platform}::${r.keyword}`;
    if (!aiByPlatformKw[key] || new Date(r.date) > new Date(aiByPlatformKw[key].date)) {
      aiByPlatformKw[key] = r;
    }
  }

  // Note: LF list endpoint returns SAIV as 'solv' for AI platform reports
  // Use r.saiv ?? r.solv to handle both list and any future normalization
  const getAiScore = r => parseFloat(r.saiv ?? r.solv) || 0;

  // Summarize SAIV per platform (avg across keywords)
  const platformSums = {};
  for (const r of Object.values(aiByPlatformKw)) {
    if (!platformSums[r.platform]) platformSums[r.platform] = { total: 0, count: 0 };
    platformSums[r.platform].total += getAiScore(r);
    platformSums[r.platform].count += 1;
  }

  const aiPlatforms = Object.entries(platformSums)
    .map(([platform, s]) => ({
      platform,
      saiv:  parseFloat((s.total / s.count).toFixed(1)),
      scans: s.count
    }))
    .sort((a, b) => b.saiv - a.saiv);

  // Best individual AI keyword
  const aiByKw = {};
  for (const r of Object.values(aiByPlatformKw)) {
    const saiv = getAiScore(r);
    if (!aiByKw[r.keyword] || saiv > aiByKw[r.keyword].saiv) {
      aiByKw[r.keyword] = { keyword: r.keyword, saiv, platform: r.platform, arp: parseFloat(r.arp) };
    }
  }
  const topAiKeywords = Object.values(aiByKw)
    .sort((a, b) => b.saiv - a.saiv)
    .slice(0, 5);

  // ── SUMMARY METRICS ────────────────────────────────────────────────────────
  const topSolv      = googleKws[0]?.solv ?? null;
  const topSolvKw    = googleKws[0]?.keyword ?? null;
  const avgSolvAll   = googleKws.length
    ? parseFloat((googleKws.reduce((s, r) => s + r.solv, 0) / googleKws.length).toFixed(1))
    : null;
  const avgSaiv      = aiPlatforms.length
    ? parseFloat((aiPlatforms.reduce((s, p) => s + p.saiv, 0) / aiPlatforms.length).toFixed(1))
    : null;
  const lastScanDate = reports[0]?.date ?? null;

  console.log(`[LocalFalcon] google=${googleKws.length} kws | topSolv=${topSolv}% | ai platforms=${aiPlatforms.length} | avgSaiv=${avgSaiv}%`);

  return {
    lastScanDate,
    topSolv,
    topSolvKw,
    avgSolvAll,
    avgSaiv,
    googleKeywords: googleKws,
    aiPlatforms,
    topAiKeywords
  };
}

module.exports = { pullLocalFalcon };
