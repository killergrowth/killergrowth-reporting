const { pullFathom } = require('./scripts/pull-fathom.js');
const fs = require('fs');
const path = require('path');
const creds = fs.readFileSync('C:/Users/KillerGrowth/.openclaw/workspace/References/credentials.md', 'utf8');
const token = creds.match(/\d{16}\|[A-Za-z0-9]+/)[0];
process.env.FATHOM_API_TOKEN = ***

pullFathom('DYSWZSVJ', new Date(2026, 7, 1)).then(website => {
  const p = path.join(__dirname, 'data', 'cogans-woodshop.json');
  let raw = fs.readFileSync(p);
  if (raw[0]===0xEF&&raw[1]===0xBB&&raw[2]===0xBF) raw=raw.slice(3);
  const d = JSON.parse(raw.toString('utf8'));
  d.website = Object.assign({}, d.website || {}, website);
  d.fathomSiteId = 'DYSWZSVJ';
  d.overview.sessions = website.visits;
  fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
  console.log('Done. visits:', website.visits, 'uniques:', website.uniques, 'pageviews:', website.pageviews);
}).catch(e => console.error('Error:', e.message));
