#!/usr/bin/env node
/**
 * run-weekly-timnath.js
 *
 * Weekly pipeline for Timnath Painting ranking dashboard:
 *   1. Pull fresh DFS ranks → data/timnath-dfs-latest.json
 *   2. Pull all report data (GSC, GA4, GBP, etc.) → data/timnath.json
 *   3. Build dashboard HTML
 *   4. Deploy to Cloudflare Pages
 *
 * Scheduled via OpenClaw cron every Monday.
 * Can also be run manually: node scripts/run-weekly-timnath.js
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

async function main() {
  console.log('\n====================================');
  console.log(' Timnath Weekly Dashboard Update');
  console.log(' ' + new Date().toISOString());
  console.log('====================================');

  // Load SA key for build-report
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON =
    require('fs').readFileSync(
      'C:/Users/KillerGrowth/.openclaw/credentials/google-service-account.json',
      'utf8'
    );

  // Step 1: DFS rank pull
  console.log('\n[1/4] Pulling DFS ranks…');
  run('node scripts/pull-dfs-timnath.js');

  // Step 2: Full report data pull
  console.log('\n[2/4] Pulling full report data…');
  run(`node scripts/build-report.js timnath`, {
    env: { ...process.env }
  });

  // Step 3: Build HTML
  console.log('\n[3/4] Building dashboard…');
  run('node build.js');

  // Step 4: Deploy
  console.log('\n[4/4] Deploying to Cloudflare Pages…');
  run('npx wrangler pages deploy dist --project-name killergrowth-reporting --commit-dirty=true');

  console.log('\n====================================');
  console.log(' Done. Timnath dashboard updated.');
  console.log('====================================\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
