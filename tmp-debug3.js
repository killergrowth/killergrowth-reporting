const fs = require('fs');
const html = fs.readFileSync('dist/killergrowth/index.html', 'utf8');

// Check chart container IDs
const chartSelectors = [
  'chart-organic-traffic',
  'chart-traffic-channels',
  'chart-ads-spend',
  'chart-gbp-views',
  'chart-social-reach',
  'chart-social-engagement',
  'chart-web-sessions'
];

chartSelectors.forEach(id => {
  const inDOM = html.split('id="' + id + '"').length - 1;
  const inScript = html.includes('"#' + id + '"') || html.includes("'#" + id + "'");
  console.log(id + ': DOM=' + (inDOM > 0 ? 'YES' : 'NO') + ' Script=' + (inScript ? 'YES' : 'NO'));
});

// Check key IDs
const ids = ['report-period','stat-sessions','stat-leads','stat-adspend'];
ids.forEach(id => {
  const count = html.split('id="' + id + '"').length - 1;
  console.log(id + ':', count > 0 ? 'FOUND' : 'MISSING');
});

// Check for the charts variable + chart inits
console.log('\nconst charts:', html.includes('const charts = {}'));
console.log('charts.organicTraffic = new:', html.includes('charts.organicTraffic = new ApexCharts'));
console.log('ApexCharts script tag:', html.includes('apexcharts.min.js'));
console.log('setEl defined:', html.includes('function setEl'));
console.log('loadData call:', html.includes('loadData();'));

// Check that the inline script is AFTER apexcharts.min.js
const apexIdx = html.indexOf('apexcharts.min.js');
const chartsInitIdx = html.indexOf('charts.organicTraffic = new ApexCharts');
console.log('\napexcharts.min.js at:', apexIdx, ' | charts init at:', chartsInitIdx, ' | correct order:', apexIdx < chartsInitIdx);
