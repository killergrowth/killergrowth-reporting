#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'data', 'work-logs');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let total = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  const raw = fs.readFileSync(fp, 'utf8').replace(/^\uFEFF/, '');
  const entries = JSON.parse(raw);
  let changed = 0;
  const cleaned = entries.map(e => {
    let t = e.title || '';
    const orig = t;
    // Fix mojibake em-dash / smart quote sequences
    t = t.replace(/\u00e2\u20ac\u201d/g, '\u2014').replace(/\u00e2\u20ac\u201c/g, '\u2014');
    t = t.replace(/\u00e2\u20ac\u2122/g, '\u2019').replace(/\u00e2\u20ac\u0153/g, '\u201c');
    t = t.replace(/\u00e2\u20ac/g, '"');
    t = t.replace(/[\u00e2\u0080\uFFFD]/g, '');
    // Literal rendered mojibake fallback
    t = t.replace(/\u00e2\u0080\u0094/g, '\u2014');
    t = t.replace(/\s{2,}/g, ' ').trim();
    if (t !== orig) { e.title = t; changed++; }
    return e;
  });
  if (changed > 0) {
    fs.writeFileSync(fp, JSON.stringify(cleaned, null, 2) + '\n', 'utf8');
    console.log(f + ': fixed ' + changed + ' entries');
    total += changed;
  }
}
console.log('Total fixed: ' + total + ' across ' + files.length + ' files');
