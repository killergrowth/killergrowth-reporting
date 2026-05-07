/**
 * auth-sheets-setup.js — One-time OAuth flow for Google Sheets/Drive write access
 * ==================================================================================
 * Run this ONCE to get a refresh token that allows creating and writing Google Sheets.
 * The resulting token is stored in credentials.md for use by onboard-client.js.
 *
 * Usage:
 *   node scripts/auth-sheets-setup.js
 *
 * Then open the URL printed in your browser, authorize with brickley@killergrowth.com,
 * and paste the code back into the terminal.
 *
 * Uses the existing "KG Reporting" OAuth client (same credentials as GSC/GBP).
 */

const http     = require('http');
const { URL }  = require('url');

// KG Reporting OAuth client credentials
// Set via env vars or pass as args:
//   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/auth-sheets-setup.js
//
// Credentials are in: workspace\References\credentials.md (KG Reporting OAuth section)
const CLIENT_ID     = process.env.GOOGLE_OAUTH_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const REDIRECT_URI  = 'http://localhost:3001/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET env vars.');
  console.error('See workspace\\References\\credentials.md — KG Reporting OAuth section.');
  process.exit(1);
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(SCOPES)}&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log('\n=== KG Sheets OAuth Setup ===');
console.log('\n1. Open this URL in your browser (sign in as brickley@killergrowth.com):');
console.log('\n' + authUrl + '\n');
console.log('2. After authorizing, you will be redirected to localhost:3001/oauth2callback');
console.log('3. The token will be printed here automatically.\n');

// Start local server to catch the callback
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, 'http://localhost:3001');
  const code   = url.searchParams.get('code');
  const errMsg = url.searchParams.get('error');

  if (errMsg) {
    console.error('Auth error:', errMsg);
    res.end('Auth error: ' + errMsg);
    server.close();
    return;
  }

  if (!code) {
    res.end('No code received');
    return;
  }

  // Exchange code for tokens
  const body = new URLSearchParams({
    code,
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri:  REDIRECT_URI,
    grant_type:    'authorization_code',
  });

  try {
    const tokenRes  = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.refresh_token) {
      console.error('No refresh_token in response:', JSON.stringify(tokenData));
      res.end('Error: no refresh_token. See console.');
      server.close();
      return;
    }

    console.log('\n=== SUCCESS ===');
    console.log('Refresh token:', tokenData.refresh_token);
    console.log('\nAdd to credentials.md and GitHub Actions secrets:');
    console.log('  GOOGLE_SHEETS_CLIENT_ID     =', CLIENT_ID);
    console.log('  GOOGLE_SHEETS_CLIENT_SECRET =', CLIENT_SECRET);
    console.log('  GOOGLE_SHEETS_REFRESH_TOKEN =', tokenData.refresh_token);
    console.log('\nThen re-run: node scripts/setup-reporting-infra.js');

    res.end('Success! Check your terminal for the refresh token.');
    server.close();
  } catch (e) {
    console.error('Token exchange failed:', e.message);
    res.end('Error exchanging token. See console.');
    server.close();
  }
});

server.listen(3001, () => {
  console.log('Waiting for OAuth callback on http://localhost:3001 ...');
});
