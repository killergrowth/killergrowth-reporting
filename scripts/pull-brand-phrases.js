/**
 * pull-brand-phrases.js — Brand Phrase Extraction via LLM
 *
 * For each tracked keyword, queries ChatGPT and checks if the brand is mentioned.
 * When found, uses GPT-4o to extract key phrases + sentiment from the response.
 * Aggregates phrase counts across all queries.
 *
 * Requires: OPENAI_API_KEY, LF_API_KEY (to pull keywords from campaign)
 */

const LF_BASE = 'https://api.localfalcon.com';

// ─── LLM HELPERS ─────────────────────────────────────────────────────────────

// Perplexity — web-augmented, good for local business queries
async function perplexityChat(messages) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return null; // skip gracefully
  const r = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'sonar', messages, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(`Perplexity error: ${d.error.message}`);
  return d.choices[0].message.content;
}

// OpenAI — for phrase extraction only (structured output)
async function openaiChat(messages, model = 'gpt-4o-mini') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(`OpenAI error: ${d.error.message}`);
  return d.choices[0].message.content;
}

// ─── LF HELPERS ───────────────────────────────────────────────────────────────

async function getLFKeywords(placeId, lfKey, limit = 20) {
  const r = await fetch(`${LF_BASE}/v1/reports/?api_key=${lfKey}&place_id=${placeId}&limit=${limit}`);
  const d = await r.json();
  const reports = d.data?.reports || [];
  // Get unique keywords from AI platform scans
  const aiKws = [...new Set(
    reports
      .filter(r => ['chatgpt', 'gemini', 'aimode'].includes(r.platform))
      .map(r => r.keyword)
  )];
  // Fall back to Google Maps keywords if no AI scans
  if (!aiKws.length) {
    return [...new Set(reports.map(r => r.keyword))].slice(0, 10);
  }
  return aiKws.slice(0, 12);
}

// ─── MENTION DETECTION ────────────────────────────────────────────────────────

function isMentioned(text, brandName) {
  const t = (text || '').toLowerCase();
  const b = brandName.toLowerCase();
  // Check brand name or first word of brand name
  const firstWord = b.split(' ')[0];
  return t.includes(b) || (firstWord.length > 3 && t.includes(firstWord));
}

// ─── PHRASE EXTRACTION ────────────────────────────────────────────────────────

async function extractPhrases(responseText, brandName) {
  const prompt = `You are analyzing an AI assistant response about local businesses.

The response is:
"""
${responseText.substring(0, 2000)}
"""

Extract the key descriptive phrases the AI used when mentioning "${brandName}". 
Focus on attributes, qualities, and characteristics (e.g. "fair pricing", "fast response", "highly rated").
Do NOT include the brand name itself or generic filler.

Return ONLY a JSON array like:
[
  { "phrase": "fair pricing", "sentiment": "Positive" },
  { "phrase": "quick scheduling", "sentiment": "Positive" }
]

Return [] if no meaningful phrases found. Sentiment must be: Positive, Neutral, or Negative.`;

  try {
    const result = await openaiChat([{ role: 'user', content: prompt }], 'gpt-4o-mini');
    // Extract JSON from response
    const match = result.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
  } catch (e) {
    console.warn(`  [Phrases] extraction failed: ${e.message}`);
    return [];
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function pullBrandPhrases(config) {
  const { placeId, brandName, lfApiKey } = config;

  if (!process.env.OPENAI_API_KEY) {
    console.log('[BrandPhrases] OPENAI_API_KEY not set — skipping');
    return null;
  }
  if (!placeId || !lfApiKey) {
    console.log('[BrandPhrases] No LF place_id or API key — skipping');
    return null;
  }

  // 1. Get keywords from LF campaign
  const keywords = await getLFKeywords(placeId, lfApiKey);
  if (!keywords.length) {
    console.log('[BrandPhrases] No keywords found in LF — skipping');
    return null;
  }

  console.log(`[BrandPhrases] Querying ${keywords.length} keywords for "${brandName}"...`);

  // 2. Query ChatGPT for each keyword, extract phrases from mentions
  const phraseMap = {}; // phrase -> { count, sentiment }
  let mentionCount = 0;
  let queryCount   = 0;

  for (const keyword of keywords) {
    queryCount++;
    try {
      // Use Perplexity (web search) for brand discovery — much better for local businesses
      const response = await perplexityChat([
        { role: 'user', content: keyword }
      ]);

      if (!response || !isMentioned(response, brandName)) {
        process.stdout.write('·');
        continue;
      }

      process.stdout.write('✓');
      mentionCount++;

      // Extract phrases from this response
      const phrases = await extractPhrases(response, brandName);
      for (const { phrase, sentiment } of phrases) {
        const key = phrase.toLowerCase().trim();
        if (!key || key.length < 4) continue;
        if (!phraseMap[key]) phraseMap[key] = { phrase: phrase.trim(), count: 0, sentiment };
        phraseMap[key].count++;
        // Prefer Positive/Negative over Neutral if seen either
        if (sentiment !== 'Neutral') phraseMap[key].sentiment = sentiment;
      }

      await new Promise(r => setTimeout(r, 500)); // small delay between calls
    } catch (e) {
      process.stdout.write('!');
    }
  }

  console.log(''); // newline after progress dots

  // 3. Sort by count, return top phrases
  const topPhrases = Object.values(phraseMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const mentionRate = queryCount > 0 ? parseFloat(((mentionCount / queryCount) * 100).toFixed(1)) : 0;

  console.log(`[BrandPhrases] ${mentionCount}/${queryCount} mentions | ${topPhrases.length} phrases extracted`);

  return {
    scannedAt:    new Date().toISOString(),
    queryCount,
    mentionCount,
    mentionRate,
    phrases:      topPhrases
  };
}

module.exports = { pullBrandPhrases };
