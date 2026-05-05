/**
 * KillerGrowth Client Reporting — Build Script
 * Assembles source pages + partials into dist/
 *
 * Usage: node build.js
 *
 * Structure:
 *   _partials/head.html     → injected via <!-- HEAD:Page Title -->
 *   _partials/navbar.html   → injected via <!-- NAVBAR -->
 *   _partials/sidebar.html  → injected via <!-- SIDEBAR -->
 *   _partials/footer.html   → injected via <!-- FOOTER --> (also closes main-container)
 *
 * Page source files:
 *   index.html              → dist/index.html        (landing page, no partials)
 *   [client].html           → dist/[client]/index.html  (client report pages, uses partials)
 *
 * Client pages reference ../src/ and ../layouts/ which resolve correctly from dist/[client]/
 */

const fs   = require('fs');
const path = require('path');

const ROOT  = __dirname;
const DIST  = path.join(ROOT, 'dist');
const PARTS = path.join(ROOT, '_partials');

// ── helpers ──────────────────────────────────────────────────────────────────

function read(p) { return fs.readFileSync(p, 'utf8'); }

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

  // <!-- HEAD:Page Title Here --> — extract the title from the comment
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

  // <!-- SCRIPTS --> — replace with footer content.
  // If there's an inline <script> after <!-- SCRIPTS -->, we keep it.
  // footer.html already contains the external script tags + </body></html>.
  // We need to insert the inline script BEFORE the </body> in footer.
  const scriptsIdx = html.indexOf('<!-- SCRIPTS -->');
  if (scriptsIdx !== -1) {
    const beforeScripts = html.substring(0, scriptsIdx);
    const afterScripts  = html.substring(scriptsIdx + '<!-- SCRIPTS -->'.length);
    // afterScripts may have an inline <script> block + </body></html>
    // footer.html ends with </body></html>, so we insert afterScripts before </body>
    const footerWithInline = footer.replace('</body>', afterScripts + '\n</body>');
    html = beforeScripts + footerWithInline;
  }

  mkdir(destDir);
  fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');
}

// ── build ─────────────────────────────────────────────────────────────────────

console.log('Building KillerGrowth Reporting...');

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
mkdir(DIST);

// 1. index.html → dist/index.html (standalone, no partials needed)
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));
console.log('  ✓ index.html');

// 2. Client report pages: [name].html → dist/[name]/index.html
const sourceFiles = fs.readdirSync(ROOT).filter(f =>
  f.endsWith('.html') &&
  f !== 'index.html' &&
  !f.startsWith('_')
);

for (const file of sourceFiles) {
  const name = path.basename(file, '.html');
  buildClientPage(path.join(ROOT, file), path.join(DIST, name));
  console.log(`  ✓ ${file} → dist/${name}/index.html`);
}

// 3. Copy shared assets
copyDir(path.join(ROOT, 'src'),     path.join(DIST, 'src'));
console.log('  ✓ src/ copied');

copyDir(path.join(ROOT, 'layouts'), path.join(DIST, 'layouts'));
console.log('  ✓ layouts/ copied');

// 4. Copy robots.txt
if (fs.existsSync(path.join(ROOT, 'robots.txt'))) {
  fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(DIST, 'robots.txt'));
  console.log('  ✓ robots.txt');
}

// 5. Copy _redirects
if (fs.existsSync(path.join(ROOT, '_redirects'))) {
  fs.copyFileSync(path.join(ROOT, '_redirects'), path.join(DIST, '_redirects'));
  console.log('  ✓ _redirects');
}

console.log(`\nDone. Output in dist/ (${sourceFiles.length + 1} HTML pages)`);
