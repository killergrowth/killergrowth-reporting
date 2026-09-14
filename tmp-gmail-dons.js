const { google } = require('googleapis');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync('C:\\Users\\KillerGrowth\\.openclaw\\workspace\\google-oauth-creds.json', 'utf8'));
const token = JSON.parse(fs.readFileSync('C:\\Users\\KillerGrowth\\.openclaw\\workspace\\google-token.json', 'utf8'));

const oauth2Client = new google.auth.OAuth2(creds.client_id, creds.client_secret);
oauth2Client.setCredentials(token);
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

const ids = [
  '1a0465d3c465bc50','1a0393ea80a8fe87','1a039173d7f133c0','1a0390183bca514e',
  '1a030b7d3f7e477c','1a02b919cabe4616','19ffdd50fa61b132','19ffdd2930b7c654'
];

async function run() {
  for (const id of ids) {
    const msg = await gmail.users.messages.get({ userId: 'me', id, format: 'metadata', metadataHeaders: ['Date','Subject'] });
    const headers = msg.data.payload.headers;
    const date = headers.find(h => h.name === 'Date')?.value;
    const subject = headers.find(h => h.name === 'Subject')?.value;
    console.log(`${id} | ${date} | ${subject}`);
  }
}
run().catch(e => console.error(e.message));
