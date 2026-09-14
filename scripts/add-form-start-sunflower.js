/**
 * add-form-start-sunflower.js
 * Adds form_start trigger + GA4 tag to GTM-P52V4GWP workspace
 * and creates a new version ready to publish.
 */
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

const ACCOUNT_ID   = '6367272801';
const CONTAINER_ID = '258982828';
const GA4_ID       = 'G-JXZJM5L4H5';
const BASE         = 'https://www.googleapis.com/tagmanager/v2';

async function main() {
  const creds = JSON.parse(fs.readFileSync(
    'C:/Users/KillerGrowth/.openclaw/credentials/google-service-account.json', 'utf8'
  ));
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers'],
    clientOptions: { subject: 'phil@killergrowth.com' }
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();

  const req = async (m, e, b) => {
    const r = await fetch(BASE + e, {
      method: m,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: b ? JSON.stringify(b) : undefined
    });
    const d = await r.json();
    if (d.error) throw new Error(`${d.error.code}: ${d.error.message}`);
    return d;
  };

  console.log('Authenticated ✓');

  // Find or create workspace
  const wsList = await req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces`);
  let ws = (wsList.workspace || []).find(w => w.name === 'KG Conversion Tracking Setup');
  if (!ws) {
    ws = await req('POST', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces`, {
      name: 'KG Conversion Tracking Setup',
      description: 'KG tracking tags'
    });
  }
  const wsId = ws.workspaceId;
  console.log(`Workspace: ${wsId} — ${ws.name}`);

  // Check existing
  const [{ trigger: existingTriggers = [] }, { tag: existingTags = [] }] = await Promise.all([
    req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/triggers`),
    req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/tags`)
  ]);

  const triggerNames = existingTriggers.map(t => ({ name: t.name, id: t.triggerId }));
  const tagNames     = existingTags.map(t => t.name);
  console.log('\nExisting triggers:', triggerNames.map(t => t.name).join(', ') || 'none');
  console.log('Existing tags:    ', tagNames.join(', ') || 'none');

  // ── Form Start Trigger ──────────────────────────────────────────────
  let triggerFormStartId;
  const existingFST = triggerNames.find(t => t.name === 'KG - Form Start');
  if (existingFST) {
    console.log(`\n✓ Trigger exists: KG - Form Start (id: ${existingFST.id})`);
    triggerFormStartId = existingFST.id;
  } else {
    console.log('\nCreating trigger: KG - Form Start...');
    const t = await req('POST',
      `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/triggers`,
      {
        name: 'KG - Form Start',
        type: 'FORM_SUBMISSION',
        parameter: [
          { type: 'BOOLEAN',  key: 'waitForTags',        value: 'true'  },
          { type: 'BOOLEAN',  key: 'checkValidation',    value: 'false' },
          { type: 'TEMPLATE', key: 'waitForTagsTimeout', value: '2000'  }
        ]
      }
    );
    console.log(`✓ Trigger created: ${t.name} (id: ${t.triggerId})`);
    triggerFormStartId = t.triggerId;
  }

  // ── Form Start Tag ──────────────────────────────────────────────────
  if (tagNames.includes('GA4 Event - form_start')) {
    console.log('✓ Tag exists: GA4 Event - form_start');
  } else {
    console.log('Creating tag: GA4 Event - form_start...');
    const t = await req('POST',
      `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/tags`,
      {
        name: 'GA4 Event - form_start',
        type: 'gaawe',
        parameter: [
          { type: 'TEMPLATE', key: 'eventName',             value: 'form_start' },
          { type: 'TEMPLATE', key: 'measurementIdOverride', value: GA4_ID },
          { type: 'LIST', key: 'eventParameters', list: [
            { type: 'MAP', map: [
              { type: 'TEMPLATE', key: 'name',  value: 'form_id'   },
              { type: 'TEMPLATE', key: 'value', value: '{{Form ID}}' }
            ]},
            { type: 'MAP', map: [
              { type: 'TEMPLATE', key: 'name',  value: 'page_path' },
              { type: 'TEMPLATE', key: 'value', value: '{{Page Path}}' }
            ]}
          ]},
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' }
        ],
        firingTriggerId: [triggerFormStartId],
        tagFiringOption: 'ONCE_PER_EVENT'
      }
    );
    console.log(`✓ Tag created: ${t.name} (id: ${t.tagId})`);
  }

  // ── Enable Form ID + Page Path built-ins ──────────────────────────
  try {
    const builtins = await req('GET',
      `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/built_in_variables`
    );
    const enabledBuiltins = (builtins.builtInVariable || []).map(v => v.type);
    const needBuiltins = ['FORM_ID', 'PAGE_PATH'].filter(n => !enabledBuiltins.includes(n.toLowerCase().replace(/_/g, '')));
    if (needBuiltins.length > 0) {
      const qs = needBuiltins.map(t => `type=${t}`).join('&');
      const r = await fetch(
        `${BASE}/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/built_in_variables:create?${qs}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const text = await r.text();
      try { const d = JSON.parse(text); if (!d.error) console.log(`✓ Built-ins enabled: ${(d.builtInVariable||[]).map(v=>v.type).join(', ')}`); }
      catch { console.log('⚠️  Built-in enable: check manually in GTM (Form ID, Page Path)'); }
    } else {
      console.log('✓ Built-ins already enabled (Form ID, Page Path)');
    }
  } catch { console.log('⚠️  Built-in check skipped — enable Form ID + Page Path manually in GTM if needed'); }

  // ── Create version ────────────────────────────────────────────────────
  console.log('\nCreating version...');
  const v = await req('POST',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}:create_version`,
    { name: 'KG Tracking — add form_start', notes: 'form_start trigger + GA4 tag. Phil Jr 2026-07-28.' }
  );
  const versionId = v.containerVersion?.containerVersionId;
  console.log(`✓ Version created: ${versionId}`);
  console.log('\n→ ACTION: Publish version in GTM to go live.');
  console.log('  GTM-P52V4GWP → Versions → version '+versionId+' → Publish');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
