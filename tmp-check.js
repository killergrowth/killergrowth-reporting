var fs = require('fs');
var html = fs.readFileSync('dist/killergrowth/index.html', 'utf8');
console.log('Has loadData:', html.includes('loadData'));
console.log('Footer chart duplication gone:', !html.includes('const months ='));
console.log('Has sub-nav items (bad):', html.includes('Ad Performance'));
console.log('Has direct sidebar links (good):', html.includes('section-ads-overview'));
console.log('Has adSpend in data (good):', html.includes('killergrowth.json'));
