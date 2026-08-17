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

  // 2. Sessions over time (monthly, all-time) — yearMonth dimension for accurate multi-year data
  const allTimeStart = '2020-01-01'; // GA4 returns only what exists; safe floor
  const monthly = await runReport(propertyId, token, {
    dateRanges: [{ startDate: allTimeStart, endDate }],
    dimensions: [{ name: 'yearMonth' }],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    orderBys: [{ dimension: { dimensionName: 'yearMonth' } }]
  });

  // yearMonth = 'YYYYMM' → YYYY-MM-01 date string
  function yearMonthToDate(ym) {
    return `${ym.slice(0, 4)}-${ym.slice(4, 6)}-01`;
  }
  // Label: 'Jan 2024'
  function yearMonthToLabel(ym) {
    const d = new Date(`${ym.slice(0, 4)}-${ym.slice(4, 6)}-01`);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  const sessionsOverTime = (monthly.rows || []).map(r => ({
    week: r.dimensionValues[0].value,          // reuse 'week' key for compat
    date: yearMonthToDate(r.dimensionValues[0].value),
    label: yearMonthToLabel(r.dimensionValues[0].value),
    sessions: parseInt(r.metricValues[0].value),
    conversions: parseInt(r.metricValues[1].value)
  }));

  // 3. Traffic channels
  const channels = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15
  });

  const trafficChannels = (channels.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value)
  }));

  // 3b. Organic search source breakdown (Google, Bing, etc.)
  const organicSources = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Organic Search' }
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });

  // 3c. GBP traffic — GA4 uses a separate channel group for this
  const gbpSources = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Organic Google Business Profile' }
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 5
  });

  const gbpSessions = (gbpSources.rows || []).reduce((sum, r) => sum + parseInt(r.metricValues[0].value), 0);

  const organicSearchSources = (organicSources.rows || []).map(r => ({
    source: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value)
  }));

  // Inject GBP as a named source if it has sessions
  if (gbpSessions > 0) {
    organicSearchSources.push({ source: 'google business profile', sessions: gbpSessions });
    organicSearchSources.sort((a, b) => b.sessions - a.sessions);
  }

  // 4. Lead events by channel (all sources — for attribution breakdown)
  const LEAD_EVENTS = ['phone_click', 'phone_call', 'generate_lead', 'form_submit', 'email_click', 'cta_click', 'form_start'];
  const channelEventReport = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'eventName' },
      { name: 'sessionDefaultChannelGroup' }
    ],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: LEAD_EVENTS }
      }
    }
  });

  // leadsByChannel: { phone_call: { 'Organic Search': 2, 'Direct': 1 }, ... }
  const leadsByChannel = {};
  (channelEventReport.rows || []).forEach(r => {
    const event   = r.dimensionValues[0].value;
    const channel = r.dimensionValues[1].value;
    const count   = parseInt(r.metricValues[0].value);
    if (!leadsByChannel[event]) leadsByChannel[event] = {};
    leadsByChannel[event][channel] = (leadsByChannel[event][channel] || 0) + count;
  });

  const organicChannel = trafficChannels.find(c => /organic/i.test(c.channel));
  const sumByEvent = evt => Object.values(leadsByChannel[evt] || {}).reduce((a,b) => a+b, 0);

  const leadSignals = {
    organicSessions:  organicChannel?.sessions ?? null,
    phoneCalls:       sumByEvent('phone_click') || sumByEvent('phone_call'),
    formSubmissions:  sumByEvent('generate_lead') || sumByEvent('form_submit'),
    emailClicks:      sumByEvent('email_click'),
    ctaClicks:        sumByEvent('cta_click'),
    formStarts:       sumByEvent('form_start'),
    byChannel:        leadsByChannel
  };

  // 5. AI referral traffic by platform
  const AI_SOURCES = [
    { key: 'perplexity', match: 'perplexity.ai' },
    { key: 'chatgpt',    match: 'chatgpt.com' },
    { key: 'claude',     match: 'claude.ai' },
    { key: 'gemini',     match: 'gemini.google.com' },
    { key: 'copilot',    match: 'copilot.microsoft.com' },
    { key: 'you',        match: 'you.com' },
    { key: 'phind',      match: 'phind.com' }
  ];

  const aiSourceFilter = {
    orGroup: {
      expressions: AI_SOURCES.map(s => ({
        filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'CONTAINS', value: s.match } }
      }))
    }
  };

  const aiByPlatform = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: aiSourceFilter,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  const aiByWeek = await runReport(propertyId, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'week' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: aiSourceFilter,
    orderBys: [{ dimension: { dimensionName: 'week' } }]
  });

  // Map raw sources to friendly platform names
  const PLATFORM_NAMES = {
    'perplexity.ai': 'Perplexity',
    'chatgpt.com':   'ChatGPT',
    'claude.ai':     'Claude',
    'gemini.google.com': 'Gemini',
    'copilot.microsoft.com': 'Copilot',
    'you.com': 'You.com',
    'phind.com': 'Phind'
  };

  const aiPlatforms = (aiByPlatform.rows || []).map(r => {
    const src = r.dimensionValues[0].value;
    const name = Object.entries(PLATFORM_NAMES).find(([k]) => src.includes(k))?.[1] || src;
    return { name, sessions: parseInt(r.metricValues[0].value) };
  });

  const aiTotal = aiPlatforms.reduce((s, p) => s + p.sessions, 0);

  const aiWeeklyTrend = (aiByWeek.rows || []).map(r => ({
    week: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value)
  }));

  const aiReferral = { total: aiTotal, platforms: aiPlatforms, weeklyTrend: aiWeeklyTrend };

  console.log(`[GA4] sessions=${sessions} conversions=${conversions} channels=${trafficChannels.length} ai_referral=${aiTotal} total_leads=${leadSignals.phoneCalls + leadSignals.formSubmissions}`);

  return {
    sessions,
    conversions,
    sessionsDelta: prevSessions > 0 ? Math.round(((sessions - prevSessions) / prevSessions) * 100) : null,
    sessionsOverTime,
    trafficChannels,
    organicSearchSources,
    leadSignals,
    aiReferral
  };
}

module.exports = { pullGA4 };
