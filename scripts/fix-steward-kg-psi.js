/**
 * fix-steward-kg-psi.js — injects PSI rendering + history JS into
 * stewardright.html and killergrowth.html which have a different structure
 */
const fs = require('fs');

const PSI_RENDER_AND_HISTORY = `
        /* PSI scores + history */
        var psi = d.website ? (d.website.psiScores || null) : null;
        if (psi) {
            renderPsiScores(psi.mobile,  'psi-m');
            renderPsiScores(psi.desktop, 'psi-d');
        }
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

const files = ['stewardright.html', 'killergrowth.html'];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('SKIP: ' + f); return; }
  var c = fs.readFileSync(f, 'utf8');

  if (c.indexOf('function setPsiView') !== -1) {
    console.log(f + ': already has setPsiView — skipping');
    return;
  }

  // Find the `loadData();` call (the invocation, not definition)
  // We want to inject just before `    loadData();`
  var anchor = '\n    loadData();';
  var idx = c.lastIndexOf(anchor);
  if (idx === -1) {
    console.log(f + ': loadData(); not found');
    return;
  }

  c = c.slice(0, idx) + PSI_RENDER_AND_HISTORY + c.slice(idx);
  fs.writeFileSync(f, c, 'utf8');

  var ok = c.indexOf('function setPsiView') !== -1;
  console.log(f + ': injected=' + ok);
});

console.log('Done.');
