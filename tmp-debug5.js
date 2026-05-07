var fs = require('fs');
var html = fs.readFileSync('dist/killergrowth/index.html', 'utf8');
console.log('Has __reportData:', html.includes('window.__reportData'));
console.log('Has 938.84:', html.includes('938.84'));
console.log('Has adSpend fmt:', html.includes("fmt(o.adSpend, '$')"));
var dataStart = html.indexOf('window.__reportData');
if (dataStart > 0) {
  console.log('Data snippet:', html.substring(dataStart, dataStart + 80));
}
