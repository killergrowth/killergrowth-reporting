/**
 * pull-ga4.js — Pull GA4 data for a client
 * Returns: sessions overview, organic traffic over time, traffic channels
 *
 * Requires env: GOOGLE_SERVICE_ACCOUNT_JSON (stringified JSON)
 * Or file:      scripts/service-account.json
 */
const { GoogleAuth } = require('google-auth-library');

const MONTHS_BACK = 1; // report on last calendar month

function getDateRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  const fmt = d => d.toISOString().split('T')[0];
  return { startDate: fmt(lastMonthStart), endDate: fmt(lastMonthEnd) };
}

async function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const credentials = raw ? JSON.parse(raw) : require('./service-account.json');
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/analytics.readonly'] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function runReport(propertyId, token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function pullGA4(propertyId) {
  if (!propertyId || propertyId === 'FILL_IN') {
    console.log('[GA4] No property ID configured — skipping');
    return null;
  }

  const token = await getAuth();
  const { startDate, endDate } = getDateRange();

  // 1. Overview: sessions + conversions
  const overview = await runReport(propertyId, token, {
    dateRanges: [
      { startDate, endDate },
      { startDate: startDate.replace(/^(\d{4})/, y => String(Number(y) - 0).replace(/(\d{4})-(\d{2})/, (_, yr, mo) => {
          const d = new Date(yr, Number(mo) - 2, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        })), endDate }  // approx prev month — simplified
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'bounceRate' }
    ]
  });

  const thisMonth = overview.rows?.[0]?.metricValues || [];
  const prevMonth = overview.rows?.[1]?.metricValues || [];
  const sessions     = parseInt(thisMonth[0]?.value || '0');
  const conversions  = parseInt(thisMonth[1]?.value || '0');
  const prevSessions = parseInt(prevMonth[0]?.value || '0');

  // 2. Sessions over time (weekly)
  const weekly = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'week' }],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    orderBys: [{ dimension: { dimensionName: 'week' } }]
  });

  const sessionsOverTime = (weekly.rows || []).map(r => ({
    week: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value),
    conversions: parseInt(r.metricValues[1].value)
  }));

  // 3. Traffic channels
  const channels = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 6
  });

  const trafficChannels = (channels.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value)
  }));

  console.log(`[GA4] sessions=${sessions} conversions=${conversions} channels=${trafficChannels.length}`);

  return {
    sessions,
    conversions,
    sessionsDelta: prevSessions > 0 ? Math.round(((sessions - prevSessions) / prevSessions) * 100) : null,
    sessionsOverTime,
    trafficChannels
  };
}

module.exports = { pullGA4 };
