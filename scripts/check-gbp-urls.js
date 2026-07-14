const REFRESH_TOKEN = process.env.GBP_REFRESH_TOKEN;
const CLIENT_ID = '895603761184-9dvjq9bmfv1jqeloehsn6f3ol7ik4eha.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

async function getToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token' })
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('Token failed: ' + JSON.stringify(d));
  return d.access_token;
}

const BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';

const LOCATIONS = [
  { name: 'Dons El Dorado',  id: 'locations/10335100439021151406', targetUrl: 'https://donsheatingandair.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_eldorado' },
  { name: 'Dons Emporia',    id: 'locations/18381657189612737217', targetUrl: 'https://donsheatingandair.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_emporia' },
  { name: 'Dons Hillsboro',  id: 'locations/13662902595561295554', targetUrl: 'https://donsheatingandair.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_hillsboro' },
  { name: 'GTBC',            id: 'locations/8016896371328465572',  targetUrl: 'https://goodtobeclean.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp' }
];

async function main() {
  const token = await getToken();
  const h = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  for (const loc of LOCATIONS) {
    // Check current URL
    const r = await fetch(BASE + '/' + loc.id + '?readMask=websiteUri,title', { headers: h });
    const text = await r.text();
    let d;
    try { d = JSON.parse(text); } catch(e) { console.log(loc.name + ': Non-JSON response', r.status, text.slice(0,200)); continue; }
    if (d.error) { console.log(loc.name + ': API error -', d.error.message); continue; }
    
    console.log('\n' + loc.name + ' (' + d.title + ')');
    console.log('  Current:', d.websiteUri || '(none)');
    console.log('  Target: ', loc.targetUrl);
    
    if (d.websiteUri === loc.targetUrl) {
      console.log('  Status: already correct, skipping');
      continue;
    }

    // Update
    const upd = await fetch(BASE + '/' + loc.id + '?updateMask=websiteUri', {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ websiteUri: loc.targetUrl })
    });
    const updText = await upd.text();
    let updD;
    try { updD = JSON.parse(updText); } catch(e) { console.log('  Update non-JSON:', upd.status, updText.slice(0,200)); continue; }
    if (updD.error) { console.log('  Update error:', updD.error.message); continue; }
    console.log('  Updated ✓ ->', updD.websiteUri);
  }
}

main().catch(e => console.error(e.message));
