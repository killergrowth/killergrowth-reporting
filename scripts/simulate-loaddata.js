/**
 * simulate-loaddata.js
 * Tries to detect JS errors in stewardright's loadData by simulating
 * the function execution with mock DOM + the real data file.
 */
const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync('stewardright.html', 'utf8');
const data = JSON.parse(fs.readFileSync(path.join('data', 'stewardright.json'), 'utf8'));

// Extract just the script block
const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd   = html.lastIndexOf('</script>');
const script      = html.substring(scriptStart, scriptEnd);

// Build a minimal DOM mock + run the script
// We'll look for patterns that would throw
const lines = script.split('\n');
let inLoadData = false;
let braceDepth = 0;
let loadDataLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('async function loadData')) {
    inLoadData = true;
  }
  if (inLoadData) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
    }
    loadDataLines.push({ n: i + 1, line });
    if (inLoadData && braceDepth === 0 && loadDataLines.length > 1) {
      break;
    }
  }
}

console.log('loadData spans lines', loadDataLines[0].n, '-', loadDataLines[loadDataLines.length - 1].n);
console.log('Total lines in loadData:', loadDataLines.length);

// Look for patterns that reference d.X without guard
const d = data;
const patterns = [
  { re: /d\.seo\b/, field: 'seo' },
  { re: /d\.meta\b/, field: 'meta' },
  { re: /d\.website\b/, field: 'website' },
  { re: /d\.gbp\b/, field: 'gbp' },
  { re: /d\.ads\b/, field: 'ads' },
  { re: /d\.social\b/, field: 'social' },
];

console.log('\nData field presence:');
patterns.forEach(({re, field}) => {
  const present = data[field] != null;
  const refs = loadDataLines.filter(({line}) => re.test(line));
  if (refs.length) console.log('  d.' + field + ' present=' + present + ', referenced ' + refs.length + ' times');
});

// Look for unguarded property access on null
const dangerous = loadDataLines.filter(({line}) => {
  // Skip comments
  if (line.trim().startsWith('//') || line.trim().startsWith('*')) return false;
  // Check for .X.Y where X might be null
  return /const \w+ = d\.\w+\.\w+/.test(line) || /d\.\w+\.\w+\.\w+/.test(line);
});
if (dangerous.length) {
  console.log('\nPotentially dangerous chained access:');
  dangerous.slice(0, 10).forEach(({n, line}) => console.log('  line ' + n + ': ' + line.trim()));
}

// Check for the loading state removal - does loadData clear a spinner?
const hasHideLoader = loadDataLines.some(({line}) =>
  /display.*none|classList.*remove.*loading|hidden|loader/i.test(line)
);
console.log('\nloadData clears loader:', hasHideLoader);

// Show last 20 lines of loadData  
console.log('\nLast 20 lines of loadData:');
loadDataLines.slice(-20).forEach(({n, line}) => console.log(n + ': ' + line));
