const fs = require('fs');
const h = fs.readFileSync('./dist/timnath/index.html', 'utf8');
console.log('mojibake (â€):', h.includes('\u00e2\u20ac'));
console.log('worklog nav:', h.includes('data-s="worklog"'));
console.log('em dash in title:', h.includes('Timnath Painting \u2014 CTAs'));
console.log('wl-title 13px:', h.includes('font-size:13px'));
