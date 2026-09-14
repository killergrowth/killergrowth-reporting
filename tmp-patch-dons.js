const fs = require('fs');
const path = 'C:\\Users\\KillerGrowth\\.openclaw\\workspace\\sites\\killergrowth-reporting\\data\\dons-heating.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('Before:', data.seo.leadSignals.formSubmissions);
data.seo.leadSignals.formSubmissions = 8;
fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
const verify = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('After:', verify.seo.leadSignals.formSubmissions);
