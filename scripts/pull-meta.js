/**
 * pull-meta.js — Pull Meta (Facebook) organic social data
 * Returns: page reach, engagements, followers, top posts
 *
 * Requires env: META_SYSTEM_TOKEN
 */

const BASE = 'https://graph.facebook.com/v21.0';

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}access_token=${process.env.META_SYSTEM_TOKEN}`);
  return res.json();
}

async function getPageToken(pageId) {
  const accounts = await get('/me/accounts?fields=id,access_token&limit=100');
  const page = (accounts.data || []).find(p => p.id === pageId);
  return page?.access_token;
}

function getInsightsPeriod() {
  // Meta uses since/until Unix timestamps for month-over-month
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  return {
    since: Math.floor(lastMonthStart.getTime() / 1000),
    until: Math.floor(firstOfThisMonth.getTime() / 1000)
  };
}

async function pullMeta(pageId) {
  if (!pageId || pageId === 'FILL_IN') {
    console.log('[Meta] No page ID configured — skipping');
    return null;
  }
  if (!process.env.META_SYSTEM_TOKEN) {
    console.log('[Meta] No system token — skipping');
    return null;
  }

  const pageToken = await getPageToken(pageId);
  if (!pageToken) {
    console.log(`[Meta] Page ${pageId} not accessible via system token`);
    return null;
  }

  const { since, until } = getInsightsPeriod();

  // Page insights
  const metrics = [
    'page_impressions_unique',   // unique reach
    'page_post_engagements',
    'page_views_total'
  ].join(',');

  const insights = await get(
    `/${pageId}/insights?metric=${metrics}&period=month&since=${since}&until=${until}&access_token=${pageToken}`
  );

  let reach = 0, engagements = 0, pageViews = 0;
  for (const m of insights.data || []) {
    const val = m.values?.[0]?.value || 0;
    if (m.name === 'page_impressions_unique') reach = val;
    if (m.name === 'page_post_engagements')  engagements = val;
    if (m.name === 'page_views_total')        pageViews = val;
  }

  // Follower count (direct field)
  const pageInfo = await get(`/${pageId}?fields=fan_count&access_token=${pageToken}`);
  const followers = pageInfo.fan_count || 0;

  // Top posts this month
  const posts = await get(
    `/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&limit=5&since=${since}&until=${until}&access_token=${pageToken}`
  );

  const topPosts = (posts.data || []).map(p => ({
    message:   (p.message || '').substring(0, 100),
    date:      p.created_time,
    likes:     p.likes?.summary?.total_count || 0,
    comments:  p.comments?.summary?.total_count || 0,
    shares:    p.shares?.count || 0
  }));

  console.log(`[Meta] reach=${reach} engagements=${engagements} followers=${followers} posts=${topPosts.length}`);

  return { reach, engagements, pageViews, followers, topPosts };
}

module.exports = { pullMeta };
