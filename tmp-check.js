const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\KillerGrowth\\.openclaw\\workspace\\sites\\killergrowth-reporting\\dist\\dons-heating\\index.html', 'utf8');
const match = html.match(/window\.__reportData\s*=\s*(\{.{0,500})/);
if (match) {
  try {
    // Extract just enough to find formSubmissions
    const snippet = html.match(/formSubmissions["\s:]+(\d+)/);
    console.log('formSubmissions in dist:', snippet ? snippet[1] : 'NOT FOUND');
    const period = html.match(/"period":"([^"]+)"/);
    console.log('period:', period ? period[1] : 'not found');
    const genAt = html.match(/"generatedAt":"([^"]+)"/);
    console.log('generatedAt:', genAt ? genAt[1] : 'not found');
  } catch(e) { console.log(e.message); }
}
