// GET /api/admin/get-modules?slug=sunflower
// Returns the saved module state for a client from KV

export async function onRequestGet(context) {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const slug = new URL(context.request.url).searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: CORS });

  const val = await context.env.KG_CONFIG.get(`modules:${slug}`);
  const modules = val ? JSON.parse(val) : null;

  return new Response(JSON.stringify({ slug, modules }), { status: 200, headers: CORS });
}
