import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixFile(filePath) {
  const buf = fs.readFileSync(filePath);

  // Strip UTF-8 BOM if present
  const start = (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) ? 3 : 0;
  const content = buf.slice(start).toString('utf8');

  // Fix double-encoded UTF-8: PowerShell read original UTF-8 bytes as Latin-1, 
  // then wrote them back as UTF-8 again. Undo that by re-interpreting as Latin-1->bytes->UTF-8.
  const fixed = Buffer.from(content, 'latin1').toString('utf8');

  const nonAsciiBefore = (content.match(/[^\x00-\x7F]/g) || []).length;
  const nonAsciiAfter  = (fixed.match(/[^\x00-\x7F]/g) || []).length;

  const useFixed = nonAsciiAfter <= nonAsciiBefore;
  const out = useFixed ? fixed : content;

  // Node fs.writeFileSync writes UTF-8 without BOM
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`${path.basename(filePath)}: BOM stripped, non-ASCII ${nonAsciiBefore} → ${nonAsciiAfter} ${useFixed ? '(roundtrip applied)' : '(no roundtrip needed)'}`);
}

const targets = [
  '_partials/head.html',
  '_partials/navbar.html',
  '_partials/sidebar.html',
  '_partials/footer.html',
  'demo.html',
];

for (const t of targets) {
  fixFile(path.join(__dirname, t));
}

console.log('\nAll done. Now update build.js to also strip BOM at read time (safety net).');
