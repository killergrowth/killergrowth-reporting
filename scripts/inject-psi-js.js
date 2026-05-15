/**
 * inject-psi-js.js — injects PSI history JS into all dashboard HTML files
 * Fixes CRLF issue that broke the previous injection attempt
 */
const fs = require('fs');

const CHART_JS_DATA = `
        /* PSI history chart */
        window.__psiHistory = d.website ? (d.website.psiHistory || []) : [];
        window.__psiView    = 'mobile';
        function setPsiView(view) {
            window.__psiView = view;
            var mb = document.getElementById('psi-toggle-mobile');
            var db = document.getElementById('psi-toggle-desktop');
            if (mb) { mb.style.background = view === 'mobile'  ? '#b8e600' : 'transparent'; mb.style.color = view === 'mobile'  ? '#111' : '#9ca3af'; mb.style.borderColor = view === 'mobile' ? '#b8e600' : '#2a2a2a'; }
            if (db) { db.style.background = view === 'desktop' ? '#b8e600' : 'transparent'; db.style.color = view === 'desktop' ? '#111' : '#9ca3af'; db.style.borderColor = view === 'desktop' ? '#b8e600' : '#2a2a2a'; }
            var hist = window.__psiHistory;
            if (!hist || !hist.length) return;
            var dates = hist.map(function(h) { return h.date; });
            var s = view;
            charts.psiTrend.updateOptions({
                series: [
                    { name: 'Performance',    data: hist.map(function(h) { return (h[s] && h[s].performance    != null) ? h[s].performance    : null; }) },
                    { name: 'Accessibility',  data: hist.map(function(h) { return (h[s] && h[s].accessibility  != null) ? h[s].accessibility  : null; }) },
                    { name: 'Best Practices', data: hist.map(function(h) { return (h[s] && h[s].bestPractices  != null) ? h[s].bestPractices  : null; }) },
                    { name: 'SEO',            data: hist.map(function(h) { return (h[s] && h[s].seo            != null) ? h[s].seo            : null; }) }
                ],
                xaxis: { categories: dates }
            });
        }
        if (window.__psiHistory.length) setPsiView('mobile');
`;

const files = [
  'sunflower.html','dons-heating.html','good-to-be-clean.html',
  'stewardright.html','killergrowth.html'
];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('SKIP: ' + f); return; }
  var c = fs.readFileSync(f, 'utf8');
  if (c.indexOf('function setPsiView') !== -1) {
    console.log(f + ': already has setPsiView — skipping');
    return;
  }
  var anchor = '        /* Ads spend chart */';
  if (c.indexOf(anchor) === -1) {
    console.log(f + ': ANCHOR NOT FOUND');
    return;
  }
  c = c.replace(anchor, CHART_JS_DATA + '\n        /* Ads spend chart */');
  fs.writeFileSync(f, c, 'utf8');
  var ok = c.indexOf('function setPsiView') !== -1;
  console.log(f + ': injected=' + ok);
});

console.log('Done.');
