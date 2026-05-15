/**
 * redesign-psi-section.js
 * Replaces the existing PSI HTML section with a clean unified layout:
 *   - Section title + single Mobile/Desktop toggle (top right)
 *   - 4 KPI score cards in one row
 *   - Line chart in the next row
 * One toggle controls both cards and chart simultaneously.
 */
const fs = require('fs');

// ─────────────────────────────────────────────
// NEW HTML SECTION (replaces entire PSI block)
// ─────────────────────────────────────────────
const NEW_PSI_HTML = [
'                <!-- WEBSITE PERFORMANCE (PSI) -->',
'                <div id="section-website-performance" class="section-title" style="display:flex;align-items:center;justify-content:space-between;">',
'                    <span>Website Performance</span>',
'                    <div style="display:flex;gap:6px;">',
'                        <button id="psi-toggle-mobile"  onclick="setPsiView(\'mobile\')"  style="font-size:12px;font-weight:600;padding:5px 16px;border-radius:6px;border:1px solid #b8e600;background:#b8e600;color:#111;cursor:pointer;">Mobile</button>',
'                        <button id="psi-toggle-desktop" onclick="setPsiView(\'desktop\')" style="font-size:12px;font-weight:600;padding:5px 16px;border-radius:6px;border:1px solid #2a2a2a;background:transparent;color:#9ca3af;cursor:pointer;">Desktop</button>',
'                    </div>',
'                </div>',
'                <div class="row g-3 mb-4">',
'                    <div class="col-lg-3 col-6"><div class="psi-score-card" id="psi-performance"><div class="psi-score-value">&#8211;</div><div class="psi-score-label">Performance</div></div></div>',
'                    <div class="col-lg-3 col-6"><div class="psi-score-card" id="psi-accessibility"><div class="psi-score-value">&#8211;</div><div class="psi-score-label">Accessibility</div></div></div>',
'                    <div class="col-lg-3 col-6"><div class="psi-score-card" id="psi-bestpractices"><div class="psi-score-value">&#8211;</div><div class="psi-score-label">Best Practices</div></div></div>',
'                    <div class="col-lg-3 col-6"><div class="psi-score-card" id="psi-seo"><div class="psi-score-value">&#8211;</div><div class="psi-score-label">SEO</div></div></div>',
'                </div>',
'                <div class="row g-3 mb-5">',
'                    <div class="col-12">',
'                        <div class="kg-card">',
'                            <div style="font-size:14px;font-weight:700;color:#f8fafc;margin-bottom:16px;">Score Trends</div>',
'                            <div id="chart-psi-trend"></div>',
'                        </div>',
'                    </div>',
'                </div>',
''
].join('\n');

// ─────────────────────────────────────────────
// GLOBAL JS (replaces old setPsiView + init)
// ─────────────────────────────────────────────
const GLOBAL_JS = [
'    /* PSI — global so onclick can reach it */',
'    window.__psiScores  = null;',
'    window.__psiHistory = [];',
'    window.__psiView    = \'mobile\';',
'',
'    function setPsiView(view) {',
'        window.__psiView = view;',
'        var mb = document.getElementById(\'psi-toggle-mobile\');',
'        var db = document.getElementById(\'psi-toggle-desktop\');',
'        if (mb) { mb.style.background = view === \'mobile\'  ? \'#b8e600\' : \'transparent\'; mb.style.color = view === \'mobile\'  ? \'#111\' : \'#9ca3af\'; mb.style.borderColor = view === \'mobile\'  ? \'#b8e600\' : \'#2a2a2a\'; }',
'        if (db) { db.style.background = view === \'desktop\' ? \'#b8e600\' : \'transparent\'; db.style.color = view === \'desktop\' ? \'#111\' : \'#9ca3af\'; db.style.borderColor = view === \'desktop\' ? \'#b8e600\' : \'#2a2a2a\'; }',
'        /* Update score cards */',
'        var scores = window.__psiScores ? window.__psiScores[view] : null;',
'        if (scores) renderPsiScores(scores, \'psi\');',
'        /* Update chart */',
'        var hist = window.__psiHistory;',
'        if (!hist || !hist.length || !charts.psiTrend) return;',
'        var s = view;',
'        charts.psiTrend.updateOptions({',
'            series: [',
'                { name: \'Performance\',    data: hist.map(function(h) { return (h[s] && h[s].performance    != null) ? h[s].performance    : null; }) },',
'                { name: \'Accessibility\',  data: hist.map(function(h) { return (h[s] && h[s].accessibility  != null) ? h[s].accessibility  : null; }) },',
'                { name: \'Best Practices\', data: hist.map(function(h) { return (h[s] && h[s].bestPractices  != null) ? h[s].bestPractices  : null; }) },',
'                { name: \'SEO\',            data: hist.map(function(h) { return (h[s] && h[s].seo            != null) ? h[s].seo            : null; }) }',
'            ],',
'            xaxis: { categories: hist.map(function(h) { return h.date; }) }',
'        });',
'    }',
''
].join('\n');

// loadData block — set data then call setPsiView
const LOADDATA_PSI = [
'        /* PSI scores + history */',
'        window.__psiScores  = d.website ? (d.website.psiScores || null) : null;',
'        window.__psiHistory = d.website ? (d.website.psiHistory || []) : [];',
'        if (window.__psiScores || window.__psiHistory.length) setPsiView(\'mobile\');',
''
].join('\n');

// ─────────────────────────────────────────────
// Process each file
// ─────────────────────────────────────────────
const files = [
  'sunflower.html','dons-heating.html','good-to-be-clean.html',
  'stewardright.html','killergrowth.html'
];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('SKIP: ' + f); return; }
  var c = fs.readFileSync(f, 'utf8');

  // ── 1. Replace the entire PSI HTML section ──
  // Match from <!-- WEBSITE PERFORMANCE (PSI) --> to the end of the section
  // (ends just before <!-- NOTES --> or <div id="notes")
  var psiHtmlRe = /[ \t]*<!-- WEBSITE PERFORMANCE \(PSI\) -->[\s\S]*?(?=[ \t]*<!-- NOTES -->|[ \t]*<div id="notes")/;
  if (psiHtmlRe.test(c)) {
    c = c.replace(psiHtmlRe, NEW_PSI_HTML + '                ');
    console.log(f + ': replaced PSI HTML section');
  } else {
    console.log(f + ': WARNING — PSI HTML section not found, skipping HTML replacement');
  }

  // ── 2. Replace global setPsiView + window.__psi* declarations ──
  // Remove old global block (everything from "/* PSI — global" or "/* PSI trend" to closing })
  var oldGlobalRe = /\n[ \t]*\/\* PSI(?:[ \t]*(?:—|trend chart toggle)[^\n]*)?\n[\s\S]*?function setPsiView[\s\S]*?\n[ \t]*\}\n/;
  if (oldGlobalRe.test(c)) {
    c = c.replace(oldGlobalRe, '\n' + GLOBAL_JS);
    console.log(f + ': replaced global setPsiView');
  } else if (c.indexOf('function setPsiView') === -1) {
    // Not there yet — inject before charts.psiTrend init
    var initAnchor = '    charts.psiTrend = new ApexCharts';
    if (c.indexOf(initAnchor) !== -1) {
      c = c.replace(initAnchor, GLOBAL_JS + initAnchor);
    }
    console.log(f + ': injected new global setPsiView');
  }

  // ── 3. Replace/inject the loadData PSI block ──
  // Remove any existing PSI block inside loadData
  var oldLoadDataPsiRe = /\n[ \t]*\/\* PSI (?:scores \+ history|scores|history chart) \*\/[\s\S]*?(?=\n[ \t]*\/\*|\n[ \t]*loadData\(\))/g;
  c = c.replace(oldLoadDataPsiRe, '\n');

  // Also remove orphaned lines
  c = c.replace(/\n[ \t]*window\.__psiHistory[^\n]*\n/g, '\n');
  c = c.replace(/\n[ \t]*window\.__psiScores[^\n]*\n/g, '\n');
  c = c.replace(/\n[ \t]*if \(window\.__psiHistory[^\n]*\n/g, '\n');
  c = c.replace(/\n[ \t]*if \(window\.__psiScores[^\n]*\n/g, '\n');

  // Inject the new loadData PSI block before the psi-related comment area or before loadData()
  // Try to find existing "/* PSI" comment inside loadData to replace
  if (c.indexOf('        /* PSI scores + history */') !== -1) {
    c = c.replace('        /* PSI scores + history */', LOADDATA_PSI);
  } else {
    // Inject before loadData(); invocation
    var ldAnchor = '\n    loadData();';
    if (c.indexOf(ldAnchor) !== -1) {
      c = c.replace(ldAnchor, '\n' + LOADDATA_PSI + ldAnchor);
    }
  }

  fs.writeFileSync(f, c, 'utf8');

  // Verify
  var checks = {
    'section-website-performance': c.indexOf('section-website-performance') !== -1,
    'psi-toggle in section title':  c.indexOf('psi-toggle-mobile') !== -1,
    'single psi-performance card':  c.indexOf('id="psi-performance"') !== -1,
    'no psi-m-performance':         c.indexOf('id="psi-m-performance"') === -1,
    'chart-psi-trend':              c.indexOf('chart-psi-trend') !== -1,
    'global setPsiView':            c.indexOf('function setPsiView') !== -1,
    '__psiScores in loadData':      c.indexOf('__psiScores') !== -1,
    'BOMs':                         (c.match(/\uFEFF/g)||[]).length,
    'FFFD':                         (c.match(/\uFFFD/g)||[]).length,
  };
  var passing = Object.entries(checks).filter(([k,v]) => v === true || v === 0).map(([k]) => k);
  var failing = Object.entries(checks).filter(([k,v]) => v === false || (typeof v === 'number' && v > 0));
  console.log('  PASS: ' + passing.join(', '));
  if (failing.length) console.log('  FAIL: ' + failing.map(([k,v]) => k + '=' + v).join(', '));
});

console.log('\nDone. Run node build.js to verify.');
