const fs = require('fs');
const html = fs.readFileSync('killergrowth.html', 'utf8');

// Check IDs
const ids = ['report-period','client-name','stat-sessions','stat-leads','stat-adspend','stat-cpl'];
ids.forEach(id => {
  const count = (html.split('id="' + id + '"').length - 1);
  console.log(id + ':', count > 0 ? 'FOUND' : 'MISSING');
});

// Check setEl
console.log('setEl defined:', html.includes('function setEl'));
// Check chart render calls
console.log('charts.organicTraffic.render:', html.includes('charts.organicTraffic.render'));
// Check charts exist  
console.log('const charts:', html.includes('const charts = {}'));

// Check if there is a syntax issue - look at what comes right before loadData()
const idx = html.indexOf('loadData();');
console.log('\n--- 100 chars before loadData() call ---');
console.log(html.substring(idx - 100, idx + 15));
