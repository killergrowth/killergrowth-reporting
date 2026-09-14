const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const toCheck = [
  'data/sunflower.json',
  'data/316-health.json',
  'data/dons-heating.json',
  'data/work-logs/316-health.json',
  'data/work-logs/dons-heating.json',
  'data/work-logs/sunflower.json',
];

let fixed = 0;
for (const rel of toCheck) {
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) { console.log('MISSING:', rel); continue; }
  const buf = fs.readFileSync(f);
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    fs.writeFileSync(f, buf.slice(3));
    console.log('Fixed BOM:', rel);
    fixed++;
  } else {
    console.log('Clean:', rel);
  }
}
console.log('Total fixed:', fixed);
