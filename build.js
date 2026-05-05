/**
 * KillerGrowth Client Reporting â€” Build Script
 * Assembles source pages + partials into dist/
 *
 * Usage: node build.js
 *
 * Structure:
 *   _partials/head.html     â†’ injected via <!-- HEAD:Page Title -->
 *   _partials/navbar.html   â†’ injected via <!-- NAVBAR -->
 *   _partials/sidebar.html  â†’ injected via <!-- SIDEBAR -->
 *   _partials/footer.html   â†’ injected via <!-- FOOTER --> (also closes main-container)
 *
 * Page source files:
 *   index.html              â†’ dist/index.html        (landing page, no partials)
 *   [client].html           â†’ dist/[client]/index.html  (client report pages, uses partials)
 *
 * Client pages reference ../src/ and ../layouts/ which resolve correctly from dist/[client]/
 */

const fs   = require('fs');
const path = require('path');

const ROOT  = __dirname;
const DIST  = path.join(ROOT, 'dist');
const PARTS = path.join(ROOT, '_partials');

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function read(p) {
  const buf = fs.readFileSync(p);
  // Strip UTF-8 BOM (EF BB BF) if present — PowerShell adds these
  const start = (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) ? 3 : 0;
  return buf.slice(start).toString('utf8');
}

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }

function copyDir(src, dest) {
  mkdir(dest);
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function injectPartials(html) {
  const head    = read(path.join(PARTS, 'head.html'));
  const navbar  = read(path.join(PARTS, 'navbar.html'));
  const sidebar = read(path.join(PARTS, 'sidebar.html'));
  const footer  = read(path.join(PARTS, 'footer.html'));

  // <!-- HEAD:Page Title Here --> â€” extract the title from the comment
  html = html.replace(/<!-- HEAD:(.*?) -->/, (_, title) => {
    return head.replace('<!-- PAGE_TITLE -->', title.trim());
  });

  html = html.replace('<!-- NAVBAR -->', navbar);
  html = html.replace('<!-- SIDEBAR -->', sidebar);
  html = html.replace('<!-- SCRIPTS -->', '<!-- end content area -->');
  html = html.replace('<!-- FOOTER -->', footer);

  // If page uses <!-- SCRIPTS --> for inline scripts (after the tag was already replaced):
  // handle the pattern: <!-- SCRIPTS --> followed by <script> blocks
  // The source pages put <!-- SCRIPTS --> before the inline script block.
  // footer.html contains the external script tags.
  // We need to merge them: replace <!-- SCRIPTS --><script>...</script> with footer + <script>...</script>
  // This is handled below by the page build process (see buildClientPage).

  return html;
}

function buildClientPage(sourcePath, destDir) {
  let html = read(sourcePath);

  const head    = read(path.join(PARTS, 'head.html'));
  const navbar  = read(path.join(PARTS, 'navbar.html'));
  const sidebar = read(path.join(PARTS, 'sidebar.html'));
  const footer  = read(path.join(PARTS, 'footer.html'));

  // HEAD: extract title from <!-- HEAD:Title -->
  html = html.replace(/<!-- HEAD:(.*?) -->/, (_, title) => {
    return head.replace('<!-- PAGE_TITLE -->', title.trim());
  });

  html = html.replace('<!-- NAVBAR -->', navbar);
  html = html.replace('<!-- SIDEBAR -->', sidebar);

  // <!-- SCRIPTS --> â€” replace with footer content.
  // If there's an inline <script> after <!-- SCRIPTS -->, we keep it.
  // footer.html already contains the external script tags + </body></html>.
  // We need to insert the inline script BEFORE the </body> in footer.
  // Embed report data for this client so the page never needs a fetch
  const clientSlug = path.basename(sourcePath, '.html');
  const dataFile   = path.join(ROOT, 'data', clientSlug + '.json');
  let   dataScript = '';
  if (fs.existsSync(dataFile)) {
    const reportJson = fs.readFileSync(dataFile, 'utf8');
    dataScript = `\n    <script>\n    window.__reportData = ${reportJson};\n    </script>`;
  }

  const scriptsIdx = html.indexOf('<!-- SCRIPTS -->');
  if (scriptsIdx !== -1) {
    const beforeScripts = html.substring(0, scriptsIdx);
    const afterScripts  = html.substring(scriptsIdx + '<!-- SCRIPTS -->'.length);
    // afterScripts may have an inline <script> block + </body></html>
    // footer.html ends with </body></html>, so we insert afterScripts before </body>
    // dataScript injects window.__reportData so loadData() uses it without a fetch
    const footerWithInline = footer.replace('</body>', () => dataScript + afterScripts + '\n</body>');
    html = beforeScripts + footerWithInline;
  }

  mkdir(destDir);
  fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');
}

// â”€â”€ build â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

console.log('Building KillerGrowth Reporting...');

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
mkdir(DIST);

// 1. index.html â†’ dist/index.html (standalone, no partials needed)
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));
console.log('  âœ“ index.html');

// 2. Client report pages: [name].html â†’ dist/[name]/index.html
const sourceFiles = fs.readdirSync(ROOT).filter(f =>
  f.endsWith('.html') &&
  f !== 'index.html' &&
  !f.startsWith('_')
);

for (const file of sourceFiles) {
  const name = path.basename(file, '.html');
  buildClientPage(path.join(ROOT, file), path.join(DIST, name));
  console.log(`  âœ“ ${file} â†’ dist/${name}/index.html`);
}

// 3. Copy shared assets
copyDir(path.join(ROOT, 'src'),     path.join(DIST, 'src'));
console.log('  âœ“ src/ copied');

copyDir(path.join(ROOT, 'layouts'), path.join(DIST, 'layouts'));
console.log('  âœ“ layouts/ copied');

// 4. Copy robots.txt
if (fs.existsSync(path.join(ROOT, 'robots.txt'))) {
  fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(DIST, 'robots.txt'));
  console.log('  âœ“ robots.txt');
}

// 4c. Copy data files
if (fs.existsSync(path.join(ROOT, 'data'))) {
  copyDir(path.join(ROOT, 'data'), path.join(DIST, 'data'));
  console.log('  ✓ data/ copied');
}

// 4b. Copy images
if (fs.existsSync(path.join(ROOT, 'images'))) {
  copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));
  console.log('  ✓ images/ copied');
}

// 5. Copy _redirects
if (fs.existsSync(path.join(ROOT, '_redirects'))) {
  fs.copyFileSync(path.join(ROOT, '_redirects'), path.join(DIST, '_redirects'));
  console.log('  âœ“ _redirects');
}

console.log(`\nDone. Output in dist/ (${sourceFiles.length + 1} HTML pages)`);

