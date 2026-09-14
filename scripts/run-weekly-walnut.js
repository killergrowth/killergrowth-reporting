#!/usr/bin/env node
/**
 * run-weekly-walnut.js
 *
 * Weekly pipeline for Walnut Valley Meat Market dashboard:
 *   1. Pull all report data (Meta Ads, Fathom) → data/walnut-valley.json
 *   2. Build dashboard HTML
 *   3. Deploy to Cloudflare Pages
 *
 * Active modules: metaAds, website (Fathom)
 * Inactive: seo, googleAds, gbp, social, localFalcon
 *
 * Scheduled via OpenClaw cron — see MEMORY.md / SOP-REPORTING.md.
 * Can also be run manually: node scripts/run-weekly-walnut.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

async function main() {
  console.log('\n====================================');
  console.log(' Walnut Valley Weekly Dashboard Update');
  console.log(' ' + new Date().toISOString());
  console.log('====================================');

  // Load credentials from credentials.md
  const credsRaw = fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/workspace/References/credentials.md', 'utf8'
  );

  // Service account for Google APIs
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/credentials/google-service-account.json', 'utf8'
  );

  // Meta system token
  const metaMatch = credsRaw.match(/Meta.*?System User Token[^\n]*\n[^\n]*\*\*Token:\*\* ([^\s\n]+)/s)
    || credsRaw.match(/META_SYSTEM_TOKEN[=:]\s*([^\s\n]+)/);
  if (metaMatch) process.env.META_SYSTEM_TOKEN = metaMatch[1].trim();

  // Fathom token
  const fathomMatch = credsRaw.match(/Fathom.*?API Token[^\n]*\n[^\n]*\*\*Token:\*\* ([^\s\n]+)/s)
    || credsRaw.match(/FATHOM_API_TOKEN[=:]\s*([^\s\n]+)/);
  if (fathomMatch) process.env.FATHOM_API_TOKEN = fathomMatch[1].trim();

  // Cloudflare token
  const cfMatch = credsRaw.match(/Master API Token[\s\S]*?\*\*Token:\*\* (cfut_\S+)/);
  if (cfMatch) process.env.CLOUDFLARE_API_TOKEN = cfMatch[1].trim();
  process.env.CLOUDFLARE_ACCOUNT_ID = '27cafbbee6f8e1db0d9499405d4755c1';

  // Step 1a: Pull Meta Ads (dedicated walnut script — uses campaign ID directly)
  console.log('\n[1/3] Pulling Meta Ads…');
  run('node scripts/pull-meta-ads-walnut.js', { env: process.env });

  // Step 1b: Pull Fathom web analytics via build-report
  console.log('\n[1b/3] Pulling Fathom analytics…');
  run('node scripts/build-report.js walnut-valley', { env: process.env });

  // Step 2: Build HTML
  console.log('\n[2/3] Building dashboard…');
  run('node build.js');

  // Step 3: Deploy
  console.log('\n[3/3] Deploying to Cloudflare Pages…');
  run('npx wrangler pages deploy dist --project-name killergrowth-reporting --commit-dirty=true');

  console.log('\n====================================');
  console.log(' Done. Walnut Valley dashboard updated.');
  console.log('====================================\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
