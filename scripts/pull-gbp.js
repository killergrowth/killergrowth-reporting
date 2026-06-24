/**
 * pull-gbp.js — Pull Google Business Profile data
 * Returns: views, calls, directions, reviews
 *
 * Requires env: GBP_REFRESH_TOKEN, GBP_CLIENT_ID, GBP_CLIENT_SECRET
 */

async function refreshAccessToken() {
  const params = new URLSearchParams({
    client_id:     process.env.GBP_CLIENT_ID,
    client_secret: process.env.GBP_CLIENT_SECRET,
    refresh_token: process.env.GBP_REFRESH_TOKEN,
    grant_type:    'refresh_token'
  });
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
  const data = await res.json();
  if (!data.access_token) throw new Error('GBP token refresh failed: ' + JSON.stringify(data));
  return data.access_token;
}

function getDateRange() {
  const now = new Date();
  const endTime = now.toISOString();
  // Pull 6 months back (current month + 5 prior)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { startTime: sixMonthsAgo.toISOString(), endTime };
}

async function pullGBP(accountId, locationId) {
  if (!accountId || accountId === 'FILL_IN' || !locationId || locationId === 'FILL_IN') {
    console.log('[GBP] No account/location ID configured — skipping');
    return null;
  }
  if (!process.env.GBP_REFRESH_TOKEN) {
    console.log('[GBP] No refresh token — skipping');
    return null;
  }

  const token = await refreshAccessToken();
  const { startTime, endTime } = getDateRange();
  const base = 'https://businessprofileperformance.googleapis.com/v1';
  // Performance API uses just locations/{id} (no account prefix)
  const locId = locationId.startsWith('locations/') ? locationId : `locations/${locationId}`;
  const acctId = accountId.startsWith('accounts/') ? accountId : `accounts/${accountId}`;
  const locationName = `${acctId}/${locId}`; // used for reviews API
  const perfName = locId; // used for performance API

  // Multi-metric fetch via fetchMultiDailyMetricsTimeSeries
  const metricNames = [
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS',  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'WEBSITE_CLICKS'
  ];
  const sd = new Date(startTime), ed = new Date(endTime);
  const qs = metricNames.map(m => `dailyMetrics=${encodeURIComponent(m)}`).join('&') +
    `&dailyRange.startDate.year=${sd.getFullYear()}` +
    `&dailyRange.startDate.month=${sd.getMonth() + 1}` +
    `&dailyRange.startDate.day=${sd.getDate()}` +
    `&dailyRange.endDate.year=${ed.getFullYear()}` +
    `&dailyRange.endDate.month=${ed.getMonth() + 1}` +
    `&dailyRange.endDate.day=${ed.getDate()}`;
  const metricsRes = await fetch(
    `${base}/${perfName}:fetchMultiDailyMetricsTimeSeries?${qs}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metrics = await metricsRes.json();

  if (metrics.error) {
    console.log('[GBP] Error:', metrics.error.message);
    return null;
  }

  // Sum totals from timeSeries — unified daily map
  let totalViews = 0, totalCalls = 0, totalDirections = 0, totalWebClicks = 0;
  const dayMap = {}; // { date: { views, calls, directions, websiteClicks } }

  for (const series of metrics.multiDailyMetricTimeSeries || []) {
    for (const ts of series.dailyMetricTimeSeries || []) {
      const metric = ts.dailyMetric;
      for (const pt of ts.timeSeries?.datedValues || []) {
        const val = parseInt(pt.value || '0');
        const date = `${pt.date.year}-${String(pt.date.month).padStart(2,'0')}-${String(pt.date.day).padStart(2,'0')}`;
        if (!dayMap[date]) dayMap[date] = { date, views: 0, calls: 0, directions: 0, websiteClicks: 0 };
        if (metric.includes('IMPRESSIONS')) {
          totalViews += val;
          dayMap[date].views += val;
        } else if (metric === 'CALL_CLICKS') {
          totalCalls += val;
          dayMap[date].calls += val;
        } else if (metric === 'BUSINESS_DIRECTION_REQUESTS') {
          totalDirections += val;
          dayMap[date].directions += val;
        } else if (metric === 'WEBSITE_CLICKS') {
          totalWebClicks += val;
          dayMap[date].websiteClicks += val;
        }
      }
    }
  }

  // Reviews
  const reviewsBase = 'https://mybusiness.googleapis.com/v4';
  const reviewsRes = await fetch(
    `${reviewsBase}/${locationName}/reviews`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const reviews = await reviewsRes.json();

  const totalReviews = reviews.totalReviewCount || 0;
  const avgRating    = reviews.averageRating ? parseFloat(reviews.averageRating.toFixed(1)) : null;

  // New reviews this month
  const cutoff = new Date(startTime);
  const newReviews = (reviews.reviews || []).filter(r => new Date(r.createTime) >= cutoff).length;

  // Sorted unified daily array
  const viewsOverTime = Object.values(dayMap)
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log(`[GBP] views=${totalViews} calls=${totalCalls} directions=${totalDirections} websiteClicks=${totalWebClicks} reviews=${totalReviews} avgRating=${avgRating}`);

  return { totalViews, calls: totalCalls, directions: totalDirections, websiteClicks: totalWebClicks, viewsOverTime, totalReviews, newReviews, avgRating };
}

module.exports = { pullGBP };
