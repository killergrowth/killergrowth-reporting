/**
 * fix-steward-final.js
 * Two bugs preventing stewardright.html from loading:
 * 1. `const posts` declared twice → SyntaxError (kills entire page)
 * 2. `makeChartOpts` called but only `mc` is defined in stewardright → ReferenceError
 */
const fs = require('fs');

var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// ── Fix 1: rename duplicate `const posts` (topPosts block) ──
// Rename declaration
var before1 = c.indexOf('const posts = soc.topPosts');
if (before1 === -1) {
  console.log('const posts = soc.topPosts: NOT FOUND (may already be fixed)');
} else {
  c = c.replace('const posts = soc.topPosts || [];', 'const topPosts = soc.topPosts || [];');
  // Fix the if(posts.length) that immediately follows
  c = c.replace('if (topPosts.length) {\n            document.getElementById', 'if (topPosts.length) {\n            document.getElementById'); // already correct shape
  // Fix any remaining posts.length or posts.map in that block
  // The .map call was already renamed to topPosts.map by a prior script run
  // but the if (posts.length) line might still reference `posts`
  c = c.replace(
    'const topPosts = soc.topPosts || [];\n        if (posts.length)',
    'const topPosts = soc.topPosts || [];\n        if (topPosts.length)'
  );
  console.log('Fix 1: renamed const posts → topPosts');
}

// ── Fix 2: replace makeChartOpts with mc (stewardright uses mc not makeChartOpts) ──
var makeChartCount = (c.match(/makeChartOpts/g) || []).length;
if (makeChartCount > 0) {
  c = c.replace(/makeChartOpts/g, 'mc');
  console.log('Fix 2: replaced ' + makeChartCount + ' makeChartOpts → mc');
} else {
  console.log('Fix 2: makeChartOpts not found (already fixed or not present)');
}

fs.writeFileSync(f, c, 'utf8');

// ── Verify ──
var constPostsCount = (c.match(/const posts/g) || []).length;
var makeChartRemain = (c.match(/makeChartOpts/g) || []).length;
var boms = (c.match(/\uFEFF/g) || []).length;
var fffd = (c.match(/\uFFFD/g) || []).length;

console.log('\nVerification:');
console.log('  const posts declarations remaining:', constPostsCount, '(should be 1)');
console.log('  makeChartOpts remaining:', makeChartRemain, '(should be 0)');
console.log('  BOMs:', boms, '| FFFD:', fffd);
