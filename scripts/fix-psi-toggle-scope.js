/**
 * fix-psi-toggle-scope.js
 * setPsiView is defined inside loadData() so onclick can't reach it.
 * Fix: move it to global scope. loadData() just sets window.__psiHistory then calls it.
 */
const fs = require('fs');

// The global version of setPsiView (goes in script scope, outside loadData)
const GLOBAL_FN = [
  '',
  '    /* PSI trend chart toggle — must be global for onclick */',
  '    window.__psiHistory = [];',
  '    window.__psiView    = \'mobile\';',
  '    function setPsiView(view) {',
  '        window.__psiView = view;',
  '        var mb = document.getElementById(\'psi-toggle-mobile\');',
  '        var db = document.getElementById(\'psi-toggle-desktop\');',
  '        if (mb) { mb.style.background = view === \'mobile\'  ? \'#b8e600\' : \'transparent\'; mb.style.color = view === \'mobile\'  ? \'#111\' : \'#9ca3af\'; mb.style.borderColor = view === \'mobile\'  ? \'#b8e600\' : \'#2a2a2a\'; }',
  '        if (db) { db.style.background = view === \'desktop\' ? \'#b8e600\' : \'transparent\'; db.style.color = view === \'desktop\' ? \'#111\' : \'#9ca3af\'; db.style.borderColor = view === \'desktop\' ? \'#b8e600\' : \'#2a2a2a\'; }',
  '        var hist = window.__psiHistory;',
  '        if (!hist || !hist.length) return;',
  '        var dates = hist.map(function(h) { return h.date; });',
  '        var s = view;',
  '        charts.psiTrend.updateOptions({',
  '            series: [',
  '                { name: \'Performance\',    data: hist.map(function(h) { return (h[s] && h[s].performance    != null) ? h[s].performance    : null; }) },',
  '                { name: \'Accessibility\',  data: hist.map(function(h) { return (h[s] && h[s].accessibility  != null) ? h[s].accessibility  : null; }) },',
  '                { name: \'Best Practices\', data: hist.map(function(h) { return (h[s] && h[s].bestPractices  != null) ? h[s].bestPractices  : null; }) },',
  '                { name: \'SEO\',            data: hist.map(function(h) { return (h[s] && h[s].seo            != null) ? h[s].seo            : null; }) }',
  '            ],',
  '            xaxis: { categories: dates }',
  '        });',
  '    }',
  ''
].join('\n');

// Replacement block inside loadData — just sets history and calls the global
const LOADDATA_BLOCK = [
  '',
  '        /* PSI scores */',
  '        var psi = d.website ? (d.website.psiScores || null) : null;',
  '        if (psi) {',
  '            renderPsiScores(psi.mobile,  \'psi-m\');',
  '            renderPsiScores(psi.desktop, \'psi-d\');',
  '        }',
  '        window.__psiHistory = d.website ? (d.website.psiHistory || []) : [];',
  '        if (window.__psiHistory.length) setPsiView(\'mobile\');',
  ''
].join('\n');

const files = [
  'sunflower.html','dons-heating.html','good-to-be-clean.html',
  'stewardright.html','killergrowth.html'
];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('SKIP: ' + f); return; }
  var c = fs.readFileSync(f, 'utf8');

  // Step 1: strip the entire old local setPsiView block + window.__psiHistory + __psiView lines from inside loadData
  // The block starts with "/* PSI history chart */" or "/* PSI scores + history */"
  // and ends just before "/* Ads spend chart */" or "loadData();" depending on file
  var psiBlockRe = /\n[ \t]*\/\* PSI (?:history chart|scores \+ history) \*\/[\s\S]*?(?=\n[ \t]*\/\* (?:Ads spend chart|PSI scores)\b|\n[ \t]*loadData\(\))/g;
  var before = c.length;
  c = c.replace(psiBlockRe, '\n');
  console.log(f + ': removed old PSI block (' + (before - c.length) + ' chars removed)');

  // Step 2: also strip the "/* PSI scores */" section inserted inside loadData (for steward/kg)
  // Those look like: /* PSI scores */\n        var psi = d.website...
  var psiScoresRe = /\n[ \t]*\/\* PSI scores \*\/\n[ \t]*var psi[\s\S]*?if \(window\.__psiHistory\.length\) setPsiView\('mobile'\);\n/g;
  c = c.replace(psiScoresRe, '\n');

  // Step 3: inject GLOBAL_FN right before `charts.psiTrend = new ApexCharts`
  var initAnchor = '    charts.psiTrend = new ApexCharts';
  if (c.indexOf(initAnchor) !== -1) {
    c = c.replace(initAnchor, GLOBAL_FN + initAnchor);
  } else {
    // fallback: before first charts.X = new ApexCharts
    var firstCharts = c.indexOf('    charts.');
    if (firstCharts !== -1) {
      c = c.slice(0, firstCharts) + GLOBAL_FN + c.slice(firstCharts);
    }
  }

  // Step 4: inject LOADDATA_BLOCK right after `renderPsiScores(psi.desktop, 'psi-d');` call
  // which is the last renderPsiScores call inside loadData
  // We target the existing psi render block and replace it (or add if missing)
  var existingPsiRender = /\n[ \t]*\/\* PSI scores \*\/\n[ \t]*const psi[^}]+psi\.desktop,\s*'psi-d'\);\s*\n[ \t]*\}/m;
  if (existingPsiRender.test(c)) {
    c = c.replace(existingPsiRender, LOADDATA_BLOCK);
  } else if (c.indexOf('renderPsiScores(psi.desktop') !== -1) {
    // replace the existing psi render lines
    var rpRe = /\n[ \t]*\/\* PSI scores \*\/([\s\S]*?)renderPsiScores\(psi\.desktop[^\n]*\n[ \t]*\}/m;
    c = c.replace(rpRe, LOADDATA_BLOCK);
  } else {
    // No existing block — inject before "loadData();" call
    var ldAnchor = '\n    loadData();';
    if (c.indexOf(ldAnchor) !== -1) {
      c = c.replace(ldAnchor, LOADDATA_BLOCK.replace(/\n        /g, '\n    ') + ldAnchor);
    }
  }

  fs.writeFileSync(f, c, 'utf8');

  // Verify
  var globalOk = c.indexOf('function setPsiView') !== -1;
  var insideOk = c.indexOf('function setPsiView') !== -1 && !/loadData[\s\S]*function setPsiView/.test(c.substring(0, c.indexOf('loadData()')));
  var histOk   = c.indexOf('window.__psiHistory') !== -1;
  console.log('  global setPsiView=' + globalOk + ' __psiHistory=' + histOk);
});

console.log('Done.');
