const fs = require('fs');
const html = fs.readFileSync('killergrowth.html', 'utf8');

// Check chart container IDs referenced in chart init
const chartSelectors = [
  'chart-organic-traffic',
  'chart-traffic-channels',
  'chart-ads-spend',
  'chart-gbp-views',
  'chart-social-reach',
  'chart-social-engagement',
  'chart-web-sessions'
];

chartSelectors.forEach(id => {
  const inDOM = html.split('id="' + id + '"').length - 1;
  const inScript = html.includes('"#' + id + '"') || html.includes("'#" + id + "'");
  console.log(id + ': DOM=' + (inDOM > 0 ? 'YES' : 'NO') + ' Script=' + (inScript ? 'YES' : 'NO'));
});

// Check what the inline script block looks like - does it have try/catch around chart init?
const inlineStart = html.indexOf('<script>\n    const KG_LIME');
if (inlineStart < 0) {
  const inlineStart2 = html.indexOf('<script>\n    const charts');
  console.log('\nInline script starts with "const charts":', inlineStart2 > 0);
  const snippet = html.substring(inlineStart2, inlineStart2 + 200);
  console.log(snippet);
}
