/**
 * fix-steward-loaddata-scope.js
 * The PSI data assignment block (window.__psiScores = d.website...) was injected
 * OUTSIDE async function loadData(), so `d` is not defined → ReferenceError → blank dashboard.
 * 
 * Fix:
 *  1. Remove the PSI block that's outside loadData
 *  2. Insert it inside loadData, just before the closing }
 */
const fs = require('fs');

var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// ── Find the closing } of loadData ──
// loadData starts at the first occurrence of 'async function loadData'
var ldDefIdx = c.indexOf('async function loadData');
var depth = 0;
var started = false;
var fnEnd = -1;
for (var i = ldDefIdx; i < c.length; i++) {
  if (c[i] === '{') { depth++; started = true; }
  else if (c[i] === '}') {
    depth--;
    if (started && depth === 0) { fnEnd = i; break; }
  }
}
console.log('loadData closes at:', fnEnd);
console.log('Context:', c.substring(fnEnd - 50, fnEnd + 3));

// ── Remove the PSI block that's outside loadData ──
// It looks like:  \n\n        /* PSI scores + history */\n        window.__psiScores... setPsiView
var psiOutsideRe = /\n\n[ \t]*\/\* PSI scores \+ history \*\/\n[ \t]*window\.__psiScores[^\n]*\n[ \t]*window\.__psiHistory[^\n]*\n[ \t]*if \([^)]+\) setPsiView\([^)]+\);\n/;
var match = psiOutsideRe.exec(c);
if (match) {
  console.log('Found PSI block outside loadData at:', match.index, '(loadData ends at', fnEnd, ')');
  // Remove it
  c = c.replace(psiOutsideRe, '\n');
  console.log('Removed PSI block from outside loadData');
} else {
  console.log('WARNING: PSI block outside loadData not found with regex — trying manual search');
  var psiIdx = c.indexOf('/* PSI scores + history */');
  if (psiIdx > fnEnd) {
    console.log('PSI block at ' + psiIdx + ' is after fnEnd ' + fnEnd + ' — removing it');
    var psiEnd = c.indexOf('setPsiView(\'mobile\');', psiIdx) + "setPsiView('mobile');".length;
    c = c.slice(0, psiIdx) + c.slice(psiEnd + 1);
  }
}

// ── Re-find loadData close after removal ──
ldDefIdx = c.indexOf('async function loadData');
depth = 0; started = false; fnEnd = -1;
for (var i = ldDefIdx; i < c.length; i++) {
  if (c[i] === '{') { depth++; started = true; }
  else if (c[i] === '}') {
    depth--;
    if (started && depth === 0) { fnEnd = i; break; }
  }
}
console.log('loadData re-closes at:', fnEnd);

// ── Insert PSI data block inside loadData before its closing } ──
var PSI_INSIDE = [
'',
'        /* PSI scores + history */',
'        window.__psiScores  = d.website ? (d.website.psiScores || null) : null;',
'        window.__psiHistory = d.website ? (d.website.psiHistory || []) : [];',
'        if (window.__psiScores || window.__psiHistory.length) setPsiView(\'mobile\');',
'    '
].join('\n');

c = c.slice(0, fnEnd) + PSI_INSIDE + c.slice(fnEnd);
console.log('Inserted PSI block inside loadData');

fs.writeFileSync(f, c, 'utf8');

// ── Verify ──
var finalLdDefIdx = c.indexOf('async function loadData');
var finalDepth = 0; var finalStarted = false; var finalFnEnd = -1;
for (var i = finalLdDefIdx; i < c.length; i++) {
  if (c[i] === '{') { finalDepth++; finalStarted = true; }
  else if (c[i] === '}') {
    finalDepth--;
    if (finalStarted && finalDepth === 0) { finalFnEnd = i; break; }
  }
}
var psiInside  = c.indexOf('/* PSI scores + history */');
var psiInFn    = psiInside < finalFnEnd && psiInside > finalLdDefIdx;
var dContentOk = c.indexOf('document.addEventListener') > finalFnEnd;
var boms       = (c.match(/\uFEFF/g)||[]).length;
var fffd       = (c.match(/\uFFFD/g)||[]).length;

console.log('\nVerification:');
console.log('  PSI block inside loadData:', psiInFn);
console.log('  DOMContentLoaded outside loadData:', dContentOk);
console.log('  BOMs:', boms, '| FFFD:', fffd);
