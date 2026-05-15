/**
 * fix-steward-chart-init.js
 * Adds the charts.psiTrend = new ApexCharts(...) init to stewardright.html
 * (was missing because the socialEngagement anchor doesn't exist there)
 */
const fs = require('fs');

const CHART_INIT = [
  '    /* PSI Trend Chart */',
  '    charts.psiTrend = new ApexCharts(document.querySelector(\'#chart-psi-trend\'), makeChartOpts({',
  '        chart: { ...baseChart.chart, type: \'line\', height: 260 },',
  '        series: [',
  '            { name: \'Performance\',    data: [] },',
  '            { name: \'Accessibility\',  data: [] },',
  '            { name: \'Best Practices\', data: [] },',
  '            { name: \'SEO\',            data: [] }',
  '        ],',
  '        xaxis: { categories: [], labels: { style: { colors: KG_MUTED }, rotate: -30 } },',
  '        yaxis: { min: 0, max: 100, labels: { style: { colors: KG_MUTED } } },',
  '        colors: [\'#b8e600\', \'#3b82f6\', \'#8b5cf6\', \'#f59e0b\'],',
  '        stroke: { curve: \'smooth\', width: 2 },',
  '        markers: { size: 4 },',
  '        legend: { labels: { colors: KG_MUTED }, position: \'top\' },',
  '        dataLabels: { enabled: false },',
  '        annotations: {',
  '            yaxis: [',
  '                { y: 90, borderColor: \'#22c55e\', strokeDashArray: 4, label: { text: \'Good\', style: { color: \'#22c55e\', background: \'transparent\', fontSize: \'10px\' } } },',
  '                { y: 50, borderColor: \'#f97316\', strokeDashArray: 4, label: { text: \'Needs work\', style: { color: \'#f97316\', background: \'transparent\', fontSize: \'10px\' } } }',
  '            ]',
  '        }',
  '    }));',
  '    charts.psiTrend.render();',
  ''
].join('\n');

var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// Already has init?
if (c.indexOf('charts.psiTrend = new ApexCharts') !== -1) {
  console.log('Already has psiTrend init.');
  process.exit(0);
}

// Find the first charts.X = new ApexCharts(...) and inject before it
var anchor = '    charts.adsTrend = new ApexCharts';
var idx = c.indexOf(anchor);
if (idx === -1) {
  // fallback: find any charts init
  idx = c.indexOf('    charts.');
}
if (idx === -1) {
  console.log('ERROR: no charts anchor found');
  process.exit(1);
}

c = c.slice(0, idx) + CHART_INIT + c.slice(idx);
fs.writeFileSync(f, c, 'utf8');

console.log('Injected psiTrend init. Present: ' + (c.indexOf('charts.psiTrend = new ApexCharts') !== -1));
