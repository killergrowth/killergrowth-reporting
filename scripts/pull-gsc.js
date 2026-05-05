/**
 * pull-gsc.js — Pull Google Search Console data
 * Returns: top keywords with rank, impressions, clicks, CTR
 */
const { GoogleAuth } = require('google-auth-library');

async function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const credentials = raw ? JSON.parse(raw) : require('./service-account.json');
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

function getDateRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  const fmt = d => d.toISOString().split('T')[0];
  return { startDate: fmt(lastMonthStart), endDate: fmt(lastMonthEnd) };
}

async function pullGSC(siteUrl) {
  if (!siteUrl || siteUrl === 'FILL_IN') {
    console.log('[GSC] No site URL configured — skipping');
    return null;
  }

  const token = await getAuth();
  const { startDate, endDate } = getDateRange();

  const body = {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 25,
    orderBy: [{ field: 'impressions', sortOrder: 'DESCENDING' }]
  };

  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();

  if (data.error) {
    console.log('[GSC] Error:', data.error.message);
    return null;
  }

  const keywords = (data.rows || []).map(r => ({
    keyword:     r.keys[0],
    clicks:      r.clicks,
    impressions: r.impressions,
    ctr:         parseFloat((r.ctr * 100).toFixed(1)),
    position:    parseFloat(r.position.toFixed(1))
  }));

  // Count how many have avg position <= 10
  const top10Count = keywords.filter(k => k.position <= 10).length;

  console.log(`[GSC] keywords=${keywords.length} top10=${top10Count}`);
  return { keywords, rankingsTop10: top10Count };
}

module.exports = { pullGSC };
