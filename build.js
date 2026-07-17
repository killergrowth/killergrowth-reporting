const { injectScripts, loadSiteScripts } = require('./scripts/inject-scripts');
const SITE_ID = 'killergrowth-reporting';
/**
 * KillerGrowth Reporting — Build Script v2
 *
 * Two modes:
 *   TEMPLATE mode  — source file contains <!-- TEMPLATE -->
 *                    Injects CLIENT_CONFIG + window.__reportData into the master template
 *   LEGACY mode    — source file uses <!-- HEAD / NAVBAR / SIDEBAR / SCRIPTS --> partials
 *
 * Usage: node build.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT  = __dirname;
const DIST  = path.join(ROOT, 'dist');
const PARTS = path.join(ROOT, '_partials');
const TEMPLATE_MARKER = '<!-- TEMPLATE -->';

// ── helpers ──────────────────────────────────────────────────────────────────

function read(p) {
  const buf = fs.readFileSync(p);
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

// ── TEMPLATE MODE build ───────────────────────────────────────────────────────

function buildTemplatePage(sourcePath, destDir) {
  const source = read(sourcePath);
  const markerIdx = source.indexOf(TEMPLATE_MARKER);
  if (markerIdx === -1) return false; // not a template page

  // Everything before <!-- TEMPLATE --> is the config block (CLIENT_CONFIG + CLIENT_ROSTER)
  const configBlock = source.substring(0, markerIdx).trim();

  // Load data JSON (bake into page so it works offline / before fetch)
  const clientSlug = path.basename(sourcePath, '.html');
  const dataFile   = path.join(ROOT, 'data', clientSlug + '.json');
  let dataScript   = '<script>window.__reportData = null;</script>';
  if (fs.existsSync(dataFile)) {
    const reportData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    // Merge work-logs/<slug>.json into workLog at build time
    const workLogFile = path.join(ROOT, 'data', 'work-logs', clientSlug + '.json');
    if (fs.existsSync(workLogFile)) {
      try { reportData.workLog = JSON.parse(fs.readFileSync(workLogFile, 'utf8')); } catch { /* keep existing */ }
    }
    dataScript = `<script>\nwindow.__reportData = ${JSON.stringify(reportData)};\n</script>`;
  }

  // Read master template
  const template = read(path.join(PARTS, 'report-template.html'));

  // Inject config + data at <!-- CLIENT_INJECT -->
  const inject = configBlock + '\n' + dataScript;
  const html = template.replace('<!-- CLIENT_INJECT -->', inject);

  mkdir(destDir);
  const injectedHtml = injectScripts(html, loadSiteScripts(SITE_ID));

  fs.writeFileSync(path.join(destDir, 'index.html'), injectedHtml, 'utf8');
  return true;
}

// ── LEGACY MODE build (kept for backward compat) ─────────────────────────────

function buildLegacyPage(sourcePath, destDir) {
  let html = read(sourcePath);

  const head    = read(path.join(PARTS, 'head.html'));
  const navbar  = read(path.join(PARTS, 'navbar.html'));
  const sidebar = read(path.join(PARTS, 'sidebar.html'));
  const footer  = read(path.join(PARTS, 'footer.html'));

  html = html.replace(/<!-- HEAD:(.*?) -->/, (_, title) =>
    head.replace('<!-- PAGE_TITLE -->', title.trim())
  );
  html = html.replace('<!-- NAVBAR -->', navbar);
  html = html.replace('<!-- SIDEBAR -->', sidebar);

  const clientSlug = path.basename(sourcePath, '.html');
  const dataFile   = path.join(ROOT, 'data', clientSlug + '.json');
  let dataScript = '';
  if (fs.existsSync(dataFile)) {
    const reportData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    // Merge work-logs/<slug>.json into workLog at build time
    const workLogFile = path.join(ROOT, 'data', 'work-logs', clientSlug + '.json');
    if (fs.existsSync(workLogFile)) {
      try { reportData.workLog = JSON.parse(fs.readFileSync(workLogFile, 'utf8')); } catch { /* keep existing */ }
    }
    dataScript = `\n    <script>\n    window.__reportData = ${JSON.stringify(reportData)};\n    </script>`;
  }

  const scriptsIdx = html.indexOf('<!-- SCRIPTS -->');
  if (scriptsIdx !== -1) {
    const before = html.substring(0, scriptsIdx);
    const after  = html.substring(scriptsIdx + '<!-- SCRIPTS -->'.length);
    const footerWithInline = footer.replace('</body>', () => dataScript + after + '\n</body>');
    html = before + footerWithInline;
  }

  mkdir(destDir);
  html = injectScripts(html, loadSiteScripts(SITE_ID));

  fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');
}

// ── BUILD ─────────────────────────────────────────────────────────────────────

console.log('Building KillerGrowth Reporting...');

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
mkdir(DIST);

// 1. index.html → dist/index.html (landing page, no partials)
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));
console.log('  ✓ index.html');

// 1b. admin.html → dist/admin/index.html (internal admin page, no partials)
if (fs.existsSync(path.join(ROOT, 'admin.html'))) {
  mkdir(path.join(DIST, 'admin'));
  let adminHtml = read(path.join(ROOT, 'admin.html'));
  adminHtml = injectScripts(adminHtml, loadSiteScripts(SITE_ID));
  fs.writeFileSync(path.join(DIST, 'admin', 'index.html'), adminHtml, 'utf8');
  console.log('  ✓ admin.html → dist/admin/index.html');
}

// 2. Client pages
const sourceFiles = fs.readdirSync(ROOT).filter(f =>
  f.endsWith('.html') &&
  f !== 'index.html' &&
  f !== 'admin.html' &&
  !f.startsWith('_')
);

for (const file of sourceFiles) {
  const name    = path.basename(file, '.html');
  const dest    = path.join(DIST, name);
  const srcPath = path.join(ROOT, file);

  const wasTemplate = buildTemplatePage(srcPath, dest);
  if (!wasTemplate) buildLegacyPage(srcPath, dest);

  console.log(`  ✓ ${file} → dist/${name}/index.html (${wasTemplate ? 'template' : 'legacy'})`);
}

// 3. Copy assets
if (fs.existsSync(path.join(ROOT, 'src'))) {
  copyDir(path.join(ROOT, 'src'), path.join(DIST, 'src'));
  console.log('  ✓ src/ copied');
}
if (fs.existsSync(path.join(ROOT, 'layouts'))) {
  copyDir(path.join(ROOT, 'layouts'), path.join(DIST, 'layouts'));
  console.log('  ✓ layouts/ copied');
}
if (fs.existsSync(path.join(ROOT, 'images'))) {
  copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));
  console.log('  ✓ images/ copied');
}
if (fs.existsSync(path.join(ROOT, 'data'))) {
  copyDir(path.join(ROOT, 'data'), path.join(DIST, 'data'));
  console.log('  ✓ data/ copied');
}
if (fs.existsSync(path.join(ROOT, 'robots.txt'))) {
  fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(DIST, 'robots.txt'));
  console.log('  ✓ robots.txt');
}
if (fs.existsSync(path.join(ROOT, '_redirects'))) {
  fs.copyFileSync(path.join(ROOT, '_redirects'), path.join(DIST, '_redirects'));
  console.log('  ✓ _redirects');
}

// 4. Standalone sub-pages
const pagesDir = path.join(ROOT, 'pages');
if (fs.existsSync(pagesDir)) {
  let n = 0;
  for (const clientDir of fs.readdirSync(pagesDir)) {
    const clientPath = path.join(pagesDir, clientDir);
    if (!fs.statSync(clientPath).isDirectory()) continue;
    for (const file of fs.readdirSync(clientPath)) {
      if (!file.endsWith('.html')) continue;
      const slug = path.basename(file, '.html');
      const d    = path.join(DIST, clientDir, slug);
      mkdir(d);
      fs.copyFileSync(path.join(clientPath, file), path.join(d, 'index.html'));
      n++;
    }
  }
  if (n) console.log(`  ✓ ${n} standalone sub-page(s)`);
}

console.log(`\nDone — ${sourceFiles.length + 1} pages in dist/`);
