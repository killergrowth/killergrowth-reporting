const fs = require('fs');

['stewardright.html', 'sunflower.html'].forEach(function(f) {
  const c = fs.readFileSync(f, 'utf8');

  // Find loading overlay elements
  const hasPageLoader   = c.includes('page-loader');
  const hasOverlay      = c.includes('loading-overlay');
  const hasSpinner      = c.includes('spinner');

  // Find loadData function body
  const ldStart = c.indexOf('async function loadData');
  var depth = 0, started = false, fnEnd = -1;
  for (var i = ldStart; i < c.length; i++) {
    if (c[i] === '{') { depth++; started = true; }
    else if (c[i] === '}') { depth--; if (started && depth === 0) { fnEnd = i; break; } }
  }
  const ldBody = c.substring(ldStart, fnEnd);
  const ldHidesLoader = ldBody.includes('page-loader') || ldBody.includes('display: none') || ldBody.includes("display:'none'") || ldBody.includes('hidden');

  // Show what element is on screen initially with "Loading..." text
  const loadingTextIdx = c.indexOf('Loading...');
  const loadingCtx = loadingTextIdx !== -1 ? c.substring(loadingTextIdx - 100, loadingTextIdx + 50).replace(/[\r\n]/g, ' ') : 'not found';

  console.log(f + ':');
  console.log('  page-loader:', hasPageLoader, '| loading-overlay:', hasOverlay, '| spinner:', hasSpinner);
  console.log('  loadData hides loader:', ldHidesLoader);
  console.log('  "Loading..." context:', loadingCtx.slice(0, 200));
  console.log('');
});
