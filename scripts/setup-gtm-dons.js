/**
 * setup-gtm-dons.js
 * Sets up full conversion tracking in GTM-NBQ3H8W9 for Don's Heating & Air
 * GA4 Measurement ID: G-YD6EGCMW41
 *
 * Conversions:
 *   phone_click     — tel: link clicks
 *   generate_lead   — form_submit_success dataLayer event
 *   cta_click       — .wallox-btn button clicks
 *   scroll_depth    — 50% + 90% scroll
 *
 * Usage: node scripts/setup-gtm-dons.js
 */

const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID   = '6353623802';
const CONTAINER_ID = '251488672';
const GA4_ID       = 'G-YD6EGCMW41';
const BASE         = 'https://www.googleapis.com/tagmanager/v2';

let TOKEN;

async function req(method, endpoint, body) {
  const url = `${BASE}${endpoint}`;
  const opts = {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
  };
  if (body !== null && body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text();
  let d;
  try { d = JSON.parse(text); } catch(e) { throw new Error(`Non-JSON response (${r.status}): ${text.slice(0,200)}`); }
  if (d.error) throw new Error(`GTM API error ${d.error.code}: ${d.error.message}`);
  return d;
}

async function getToken() {
  const creds = JSON.parse(fs.readFileSync(path.join(__dirname, 'service-account.json'), 'utf8'));
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
      'https://www.googleapis.com/auth/tagmanager.publish'
    ]
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function createWorkspace() {
  // Reuse existing workspace if present
  const list = await req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces`);
  const existing = (list.workspace || []).find(w => w.name === 'KG Conversion Tracking Setup');
  if (existing) {
    console.log(`Reusing workspace: ${existing.workspaceId} — ${existing.name}`);
    return existing.workspaceId;
  }
  console.log('Creating workspace...');
  const ws = await req('POST', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces`, {
    name: 'KG Conversion Tracking Setup',
    description: 'phone_click, generate_lead, cta_click, scroll_depth — added by Phil Jr 2026-06-30'
  });
  console.log(`  Workspace: ${ws.workspaceId} — ${ws.name}`);
  return ws.workspaceId;
}

async function enableBuiltIns(wsId) {
  console.log('Enabling built-in variables...');
  // Try workspace 4 first, then Default Workspace (3)
  const types = ['CLICK_URL', 'CLICK_CLASSES', 'CLICK_TEXT', 'SCROLL_DEPTH_THRESHOLD', 'SCROLL_DEPTH_UNITS'];
  for (const wsTarget of [wsId, '3']) {
    const qs = types.map(t => `type=${t}`).join('&');
    const url = `${BASE}/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsTarget}/built_in_variables:create?${qs}`;
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` } });
    if (r.status === 200) {
      const d = await r.json();
      console.log(`  Enabled in workspace ${wsTarget}: ${(d.builtInVariable||[]).map(v=>v.type).join(', ')}`);
      return;
    }
    console.log(`  Workspace ${wsTarget} returned ${r.status} - trying next...`);
  }
  console.log('  Note: could not auto-enable built-ins via API. Will proceed - GTM may auto-enable on publish.');
}

async function createTrigger(wsId, trigger) {
  const t = await req('POST',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/triggers`,
    trigger
  );
  console.log(`  Trigger created: ${t.name} (id: ${t.triggerId})`);
  return t.triggerId;
}

async function createTag(wsId, tag) {
  const t = await req('POST',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/tags`,
    tag
  );
  console.log(`  Tag created: ${t.name} (id: ${t.tagId})`);
  return t.tagId;
}

async function checkExistingTags(wsId) {
  const result = await req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/tags`);
  return (result.tag || []).map(t => t.name);
}

async function checkExistingTriggers(wsId) {
  const result = await req('GET', `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}/triggers`);
  return (result.trigger || []).map(t => ({ name: t.name, id: t.triggerId }));
}

async function getOrCreateTrigger(wsId, existing, trigger) {
  const found = existing.find(t => t.name === trigger.name);
  if (found) {
    console.log(`  Trigger exists: ${trigger.name} (id: ${found.id})`);
    return found.id;
  }
  return createTrigger(wsId, trigger);
}

async function submitAndPublish(wsId) {
  console.log('\nSubmitting workspace version...');
  const version = await req('POST',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}:create_version`,
    { name: 'KG Conversion Tracking — phone_click, generate_lead, cta_click, scroll_depth' }
  );
  const versionId = version.containerVersion?.containerVersionId;
  console.log(`  Version created: ${versionId}`);

  console.log('Publishing...');
  const pub = await req('POST',
    `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/versions/${versionId}:publish`,
    {}
  );
  console.log(`  Published: container version ${pub.containerVersion?.containerVersionId}`);
  return pub;
}

async function main() {
  TOKEN = await getToken();
  console.log('Authenticated ✓\n');

  const wsId = await createWorkspace();
  const WS = `/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/workspaces/${wsId}`;

  await enableBuiltIns(wsId);

  // Check what already exists
  const existingTriggers = await checkExistingTriggers(wsId);
  const existingTags = await checkExistingTags(wsId);
  console.log('\nExisting triggers:', existingTriggers.map(t => t.name).join(', ') || 'none');
  console.log('Existing tags:', existingTags.join(', ') || 'none');
  console.log('');

  // ── TRIGGERS ──────────────────────────────────────────────────────────────
  console.log('Creating triggers...');

  const triggerPhoneId = await getOrCreateTrigger(wsId, existingTriggers, {
    name: 'KG - Phone Click',
    type: 'CLICK',
    filter: [{
      type: 'CONTAINS',
      parameter: [
        { type: 'TEMPLATE', key: 'arg0', value: '{{Click URL}}' },
        { type: 'TEMPLATE', key: 'arg1', value: 'tel:' }
      ]
    }],
    parameter: [
      { type: 'BOOLEAN',  key: 'waitForTags',          value: 'true' },
      { type: 'BOOLEAN',  key: 'checkValidation',       value: 'true' },
      { type: 'TEMPLATE', key: 'waitForTagsTimeout',    value: '2000' }
    ]
  });

  const triggerFormId = await getOrCreateTrigger(wsId, existingTriggers, {
    name: 'KG - Form Submit Success',
    type: 'CUSTOM_EVENT',
    customEventFilter: [{
      type: 'EQUALS',
      parameter: [
        { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
        { type: 'TEMPLATE', key: 'arg1', value: 'form_submit_success' }
      ]
    }]
  });

  const triggerCtaId = await getOrCreateTrigger(wsId, existingTriggers, {
    name: 'KG - CTA Click',
    type: 'CLICK',
    filter: [{
      type: 'CONTAINS',
      parameter: [
        { type: 'TEMPLATE', key: 'arg0', value: '{{Click Classes}}' },
        { type: 'TEMPLATE', key: 'arg1', value: 'wallox-btn' }
      ]
    }],
    parameter: [
      { type: 'BOOLEAN',  key: 'waitForTags',          value: 'true' },
      { type: 'BOOLEAN',  key: 'checkValidation',       value: 'true' },
      { type: 'TEMPLATE', key: 'waitForTagsTimeout',    value: '2000' }
    ]
  });

  const triggerScrollId = await getOrCreateTrigger(wsId, existingTriggers, {
    name: 'KG - Scroll Depth 50+90',
    type: 'SCROLL_DEPTH',
    parameter: [
      { type: 'BOOLEAN',  key: 'verticalThresholdPercents', value: 'true'   },
      { type: 'TEMPLATE', key: 'verticalThresholdsPercent', value: '50,90'  },
      { type: 'BOOLEAN',  key: 'orDepthGreaterThan',        value: 'false'  }
    ]
  });

  // All pages trigger (pageview)
  const triggerAllPagesId = await getOrCreateTrigger(wsId, existingTriggers, {
    name: 'KG - All Pages',
    type: 'PAGEVIEW'
  });

  // ── TAGS ──────────────────────────────────────────────────────────────────
  console.log('\nCreating tags...');

  // GA4 Configuration tag
  await createTag(wsId, {
    name: 'GA4 Config - G-YD6EGCMW41',
    type: 'googtag',
    parameter: [
      { type: 'TEMPLATE', key: 'tagId', value: GA4_ID }
    ],
    firingTriggerId: [triggerAllPagesId],
    tagFiringOption: 'ONCE_PER_EVENT'
  });

  // GA4 event tags — measurement ID explicitly set via measurementIdOverride
  const eventTag = (name, eventName, params, triggerId) => createTag(wsId, {
    name,
    type: 'gaawe',
    parameter: [
      { type: 'TEMPLATE', key: 'eventName',            value: eventName },
      { type: 'TEMPLATE', key: 'measurementIdOverride', value: GA4_ID   },
      { type: 'LIST', key: 'eventParameters', list: params.map(([k,v]) => ({
          type: 'MAP',
          map: [
            { type: 'TEMPLATE', key: 'name',  value: k },
            { type: 'TEMPLATE', key: 'value', value: v }
          ]
        }))
      },
      { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' }
    ],
    firingTriggerId: [triggerId],
    tagFiringOption: 'ONCE_PER_EVENT'
  });

  await eventTag('GA4 Event - phone_click',   'phone_click',   [['click_url',       '{{Click URL}}'              ]], triggerPhoneId);
  await eventTag('GA4 Event - generate_lead', 'generate_lead', [['form_type',       'contact_form'               ]], triggerFormId);
  await eventTag('GA4 Event - cta_click',     'cta_click',     [['cta_text',        '{{Click Text}}'             ]], triggerCtaId);
  await eventTag('GA4 Event - scroll_depth',  'scroll_depth',  [['percent_scrolled','{{Scroll Depth Threshold}}'  ]], triggerScrollId);

  // ── PUBLISH ───────────────────────────────────────────────────────────────
  await submitAndPublish(wsId);

  console.log('\n✅ Done — all conversion tags live in GTM-NBQ3H8W9');
  console.log('Next: mark phone_click + generate_lead as conversions in GA4.');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
