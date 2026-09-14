const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'data', 'iserve-facilities.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
data.monthlyUpdates = [{
  month: 'Aug 2026',
  year: 2026,
  text: 'August was a strong month for the website. IServe saw 117 unique visitors \u2014 up significantly from July \u2014 with 264 total page views. Traffic was nearly split between organic search and direct, which tells us people are finding the site through Google and coming back on their own. Top pages were the homepage, /apply, /about, /contact, and /services \u2014 good engagement across all the key pages. The site is technically clean: perfect scores across SEO, Accessibility, and Best Practices. Overall a solid month.'
}];
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done');
