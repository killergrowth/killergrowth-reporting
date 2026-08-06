// POST /api/admin/save-modules
// Body: { slug: "sunflower", modules: { seo: true, gbp: false, ... } }
// Writes to KG_CONFIG KV as "modules:<slug>"

export async function onRequestPost(context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await context.request.json();
    const { slug, modules } = body;

    if (!slug || typeof modules !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing slug or modules' }), { status: 400, headers: CORS });
    }

    // Whitelist allowed module keys
    const allowed = ['seo', 'googleAds', 'metaAds', 'gbp', 'social', 'website', 'localFalcon'];
    const clean = {};
    for (const k of allowed) {
      if (typeof modules[k] === 'boolean') clean[k] = modules[k];
    }

    await context.env.KG_CONFIG.put(`modules:${slug}`, JSON.stringify(clean));

    return new Response(JSON.stringify({ ok: true, slug, modules: clean }), { status: 200, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
