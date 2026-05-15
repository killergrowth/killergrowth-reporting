const fs = require('fs');
const c = fs.readFileSync('stewardright.html', 'utf8');
const ldStart = c.indexOf('async function loadData');
const ldCallIdx = c.indexOf('loadData();');
const loadDataBody = c.substring(ldStart, ldCallIdx).replace(/\r/g,'');

// Simulate running loadData with the actual data to find errors
// Load the actual data
const data = require('./data/stewardright.json');

// Check for references to potentially null/missing fields that aren't guarded
const dangerous = [
  { pat: /d\.meta\b/, label: 'd.meta' },
  { pat: /d\.seo\b/, label: 'd.seo' },
  { pat: /d\.website\b/, label: 'd.website' },
  { pat: /d\.gbp\b/, label: 'd.gbp' },
];
dangerous.forEach(({pat, label}) => {
  const matches = [...loadDataBody.matchAll(new RegExp(pat.source, 'g'))];
  const exists = !!data[label.split('.')[1]];
  if (matches.length) console.log(label + ' referenced ' + matches.length + ' times, data present: ' + exists);
});

// Look for the loading hide - what clears the loading state?
const loader = c.indexOf('loader') !== -1 || c.indexOf('loading-overlay') !== -1 || c.indexOf('spinner') !== -1;
console.log('\nLoading state elements:', loader);

// Look at how sunflower clears loading vs stewardright
const sunflower = fs.readFileSync('sunflower.html', 'utf8');
const sfLdStart = sunflower.indexOf('async function loadData');
const sfLdEnd   = sunflower.indexOf('loadData();');
const sfBody = sunflower.substring(sfLdStart, sfLdEnd);
const clearIdx = sfBody.indexOf('none') !== -1;
console.log('Sunflower loadData has display:none in it:', sfBody.indexOf("display.*none") !== -1);

// Find the actual end of loadData in stewardright
const closingBraces = loadDataBody.match(/^\}/gm);
console.log('\nloadData length:', loadDataBody.length, 'chars');
console.log('Last 300 chars of loadData:');
console.log(loadDataBody.slice(-300));
