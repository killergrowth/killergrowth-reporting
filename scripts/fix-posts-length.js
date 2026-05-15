const fs = require('fs');
var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// Find all remaining `posts.length` and `posts.map` references AFTER the topPosts declaration
// The first `posts` (postsPublished) should remain; only the topPosts block references need fixing
var topPostsIdx = c.indexOf('const topPosts = soc.topPosts');
if (topPostsIdx === -1) {
  console.log('topPosts declaration not found!');
  process.exit(1);
}

// Everything after the topPosts declaration — replace posts.length and posts.map
var before = c.slice(0, topPostsIdx);
var after  = c.slice(topPostsIdx);

// In the `after` section, rename posts. → topPosts. where it refers to the topPosts var
after = after.replace('if (posts.length)', 'if (topPosts.length)');
after = after.replace('ptbody.innerHTML = posts.map', 'ptbody.innerHTML = topPosts.map');

c = before + after;
fs.writeFileSync(f, c, 'utf8');

// Verify
var lines = c.split('\n');
var issues = lines.map((l,i) => ({n:i+1,l})).filter(({l}) =>
  l.includes('const posts') || l.includes('posts.length') || l.includes('posts.map')
);
console.log('Remaining posts references:');
issues.forEach(({n,l}) => console.log('  line ' + n + ': ' + l.trim()));
if (issues.length === 1 && issues[0].l.includes('const posts = soc.postsPublished')) {
  console.log('CLEAN — only the postsPublished const remains (correct)');
}
