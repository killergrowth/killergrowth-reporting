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
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  return {
    startTime: lastMonthStart.toISOString(),
    endTime:   firstOfThisMonth.toISOString()
  };
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
  const locationName = `accounts/${accountId}/locations/${locationId}`;

  // Daily metrics
  const metricsRes = await fetch(
    `${base}/${locationName}:getDailyMetricsTimeSeries?` + new URLSearchParams({
      dailyMetric: ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
                    'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
                    'CALL_CLICKS', 'DIRECTION_REQUESTS'].join(','),
      'dailyRange.startDate.year':  new Date(startTime).getFullYear(),
      'dailyRange.startDate.month': new Date(startTime).getMonth() + 1,
      'dailyRange.startDate.day':   new Date(startTime).getDate(),
      'dailyRange.endDate.year':    new Date(endTime).getFullYear(),
      'dailyRange.endDate.month':   new Date(endTime).getMonth() + 1,
      'dailyRange.endDate.day':     new Date(endTime).getDate()
    }),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metrics = await metricsRes.json();

  if (metrics.error) {
    console.log('[GBP] Error:', metrics.error.message);
    return null;
  }

  // Sum totals from timeSeries
  let totalViews = 0, totalCalls = 0, totalDirections = 0;
  const viewsByDay = {};

  for (const series of metrics.multiDailyMetricTimeSeries || []) {
    for (const ts of series.dailyMetricTimeSeries || []) {
      const metric = ts.dailyMetric;
      for (const pt of ts.timeSeries?.datedValues || []) {
        const val = parseInt(pt.value || '0');
        const date = `${pt.date.year}-${String(pt.date.month).padStart(2,'0')}-${String(pt.date.day).padStart(2,'0')}`;
        if (metric.includes('IMPRESSIONS')) {
          totalViews += val;
          viewsByDay[date] = (viewsByDay[date] || 0) + val;
        } else if (metric === 'CALL_CLICKS') {
          totalCalls += val;
        } else if (metric === 'DIRECTION_REQUESTS') {
          totalDirections += val;
        }
      }
    }
  }

  // Reviews
  const reviewsBase = 'https://mybusiness.googleapis.com/v4';
  const reviewsRes = await fetch(
    `${reviewsBase}/accounts/${accountId}/locations/${locationId}/reviews`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const reviews = await reviewsRes.json();

  const totalReviews = reviews.totalReviewCount || 0;
  const avgRating    = reviews.averageRating ? parseFloat(reviews.averageRating.toFixed(1)) : null;

  // New reviews this month
  const cutoff = new Date(startTime);
  const newReviews = (reviews.reviews || []).filter(r => new Date(r.createTime) >= cutoff).length;

  // Weekly view aggregation for chart
  const viewsOverTime = Object.entries(viewsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));

  console.log(`[GBP] views=${totalViews} calls=${totalCalls} directions=${totalDirections} reviews=${totalReviews} avgRating=${avgRating}`);

  return { totalViews, calls: totalCalls, directions: totalDirections, viewsOverTime, totalReviews, newReviews, avgRating };
}

module.exports = { pullGBP };
