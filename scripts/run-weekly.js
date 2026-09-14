#!/usr/bin/env node
/**
 * run-weekly.js — Generic weekly pipeline for any client dashboard.
 *
 * Usage:
 *   node scripts/run-weekly.js <slug>
 *   node scripts/run-weekly.js walnut-valley
 *   node scripts/run-weekly.js timnath
 *
 * Steps:
 *   1. Pull all report data → data/<slug>.json
 *   2. Build dashboard HTML
 *   3. Deploy to Cloudflare Pages
 *
 * Reads all credentials from References/credentials.md and local credential files.
 * Safe to run for any client in clients.json — only pulls sources that are configured.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const slug = process.argv[2];

if (!slug) {
  console.error('Usage: node scripts/run-weekly.js <client-slug>');
  console.error('Example: node scripts/run-weekly.js walnut-valley');
  process.exit(1);
}

// Verify slug exists in clients.json
const clients = JSON.parse(fs.readFileSync(path.join(__dirname, 'clients.json'), 'utf8'));
if (!clients[slug]) {
  console.error(`Unknown client slug: "${slug}"`);
  console.error(`Known: ${Object.keys(clients).join(', ')}`);
  process.exit(1);
}

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

async function main() {
  const clientName = clients[slug].name;
  console.log('\n====================================');
  console.log(` ${clientName} — Weekly Dashboard Update`);
  console.log(' ' + new Date().toISOString());
  console.log('====================================');

  // Load credentials
  const credsRaw = fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/workspace/References/credentials.md', 'utf8'
  );

  // Google Service Account
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/credentials/google-service-account.json', 'utf8'
  );

  // Meta system token
  const metaMatch = credsRaw.match(/META_SYSTEM_TOKEN[=:\s]+([^\s\n]+)/)
    || credsRaw.match(/System User Token[\s\S]{0,200}?`([^`]+)`/);
  if (metaMatch) process.env.META_SYSTEM_TOKEN = metaMatch[1].trim();

  // Fathom token
  const fathomMatch = credsRaw.match(/FATHOM_API_TOKEN[=:\s]+([^\s\n]+)/)
    || credsRaw.match(/Fathom[\s\S]{0,300}?Token[:\s]+([A-Za-z0-9_\-]+)/);
  if (fathomMatch) process.env.FATHOM_API_TOKEN = fathomMatch[1].trim();

  // DataForSEO
  const dfsLoginMatch = credsRaw.match(/DATAFORSEO_LOGIN[=:\s]+([^\s\n]+)/);
  const dfsPassMatch = credsRaw.match(/DATAFORSEO_PASSWORD[=:\s]+([^\s\n]+)/);
  if (dfsLoginMatch) process.env.DATAFORSEO_LOGIN = dfsLoginMatch[1].trim();
  if (dfsPassMatch) process.env.DATAFORSEO_PASSWORD = dfsPassMatch[1].trim();

  // Local Falcon
  const lfMatch = credsRaw.match(/LF_API_KEY[=:\s]+([^\s\n]+)/);
  if (lfMatch) process.env.LF_API_KEY = lfMatch[1].trim();

  // GHL
  const ghlMatch = credsRaw.match(/GHL_API_KEY[=:\s]+([^\s\n]+)/);
  if (ghlMatch) process.env.GHL_API_KEY = ghlMatch[1].trim();

  // Google Ads (direct API path)
  const gAdsDtMatch = credsRaw.match(/GOOGLE_ADS_DEVELOPER_TOKEN[=:\s]+([^\s\n]+)/);
  if (gAdsDtMatch) process.env.GOOGLE_ADS_DEVELOPER_TOKEN = gAdsDtMatch[1].trim();
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = '9760213886'; // MCC: Stop Branding

  // GBP OAuth
  const gbpRefreshMatch = credsRaw.match(/\*\*Refresh Token:\*\*\s*([^\s\n]+)/);
  const gbpClientIdMatch = credsRaw.match(/\*\*Client ID:\*\*\s*([\w\-]+\.apps\.googleusercontent\.com)/);
  const gbpClientSecretMatch = credsRaw.match(/\*\*Client Secret:\*\*\s*(GOCSPX-[^\s\n]+)/);
  if (gbpRefreshMatch) process.env.GBP_REFRESH_TOKEN = gbpRefreshMatch[1].trim();
  if (gbpClientIdMatch) process.env.GBP_CLIENT_ID = gbpClientIdMatch[1].trim();
  if (gbpClientSecretMatch) process.env.GBP_CLIENT_SECRET = gbpClientSecretMatch[1].trim();
  // Sheet-based paths (set if SA has access to these sheets)
  process.env.KG_CLIENT_DIRECTORY_SHEET_ID = '1VQD431iyaoigW4PuvCoy064YI0Dc5rYLIgfdysSPIqA';

  // Cloudflare
  const cfMatch = credsRaw.match(/Master API Token[\s\S]*?\*\*Token:\*\* (cfut_\S+)/);
  if (cfMatch) process.env.CLOUDFLARE_API_TOKEN = cfMatch[1].trim();
  process.env.CLOUDFLARE_ACCOUNT_ID = '27cafbbee6f8e1db0d9499405d4755c1';

  // Step 1: Pull data
  console.log(`\n[1/3] Pulling report data for ${clientName}…`);
  run(`node scripts/build-report.js ${slug}`, { env: process.env });

  // Step 2: Build
  console.log('\n[2/3] Building dashboard…');
  run('node build.js');

  // Step 3: Deploy
  console.log('\n[3/3] Deploying to Cloudflare Pages…');
  run('npx wrangler pages deploy dist --project-name killergrowth-reporting --commit-dirty=true');

  console.log('\n====================================');
  console.log(` Done. ${clientName} dashboard updated.`);
  console.log('====================================\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
