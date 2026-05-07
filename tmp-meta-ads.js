const token = 'EAANLZCzlKBiEBRP5ZC4BRXJQFT3nptpeOqLZClhroEZANazWl85ZArDg0dpuqG0wUcuCdpG5p6N6LYpwhzPbl0ZCew1M29pjLvQcrqZAehNTcsWlZCk0tFpczwAZBJw6ZCDGXGVbIF5TPZAUNm1ZBFax6VEc7A7tzMPYY7GmZCPt4yrZCgniPHIHhRd7ytQOcZBFjZAg2kQcOAZDZD';
const adAccount = 'act_688691968221248';
const timeRange = JSON.stringify({ since: '2026-04-01', until: '2026-04-30' });
const url = `https://graph.facebook.com/v21.0/${adAccount}/insights?fields=spend,actions,clicks,impressions,reach&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;

fetch(url).then(r => r.json()).then(d => {
  if (d.error) { console.log('Ads error:', d.error.message); return; }
  const row = (d.data || [])[0] || {};
  console.log('Ad spend April 2026:', row.spend || '0');
  console.log('Clicks:', row.clicks || '0');
  console.log('Impressions:', row.impressions || '0');
  console.log('Reach:', row.reach || '0');
  const leads = (row.actions || []).find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.lead');
  console.log('Lead actions:', leads ? leads.value : '0');
});

// Also pull KG page organic insights
fetch(`https://graph.facebook.com/v21.0/110087812169615/insights?metric=page_impressions_unique,page_post_engagements,page_views_total&period=month&since=1743483600&until=1746075600&access_token=${token}`)
  .then(r => r.json())
  .then(d => {
    (d.data || []).forEach(m => {
      const val = (m.values || [])[0];
      console.log(m.name + ':', val ? val.value : '?');
    });
  });
