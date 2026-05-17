const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');

module.exports = () => {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const { domain, keyword } = req.body;
      if (!domain) return res.status(400).json({ error: 'domain is required' });

      const result = await runAigenAudit(domain, keyword || null);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};

async function runAigenAudit(domain, keyword) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const keywordLine = keyword
    ? `3. Does ${domain} appear as a relevant result when someone searches for "${keyword}"? Why or why not?`
    : `3. What types of searches or topics would ${domain} be relevant for?`;

  const prompt = `You are an AI knowledge auditor. Answer the following questions about the website "${domain}" based solely on your training knowledge. Be specific and honest about what you do and don't know.

1. Do you have "${domain}" in your knowledge base as a notable or recognizable website? Describe what you know about it (purpose, industry, audience, reputation).
2. How well-established does this website appear to be based on your knowledge? (e.g. very well-known, moderately known, niche, unknown)
${keywordLine}
4. From an AI-generative optimization perspective, what would improve this site's likelihood of being cited or recommended by AI systems?

Respond in structured JSON with these exact keys:
{
  "known": true/false,
  "summary": "what you know about the site",
  "recognition_level": "well-known | moderately-known | niche | unknown",
  "keyword_relevance": "your assessment of keyword relevance",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "confidence": 0-100
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    parsed = { known: false, summary: raw, recognition_level: 'unknown', keyword_relevance: null, recommendations: [], confidence: 0 };
  }

  const citationScore = computeCitationScore(parsed);

  return {
    domain,
    keyword: keyword || null,
    citation_score: citationScore,
    known: parsed.known ?? false,
    recognition_level: parsed.recognition_level ?? 'unknown',
    summary: parsed.summary ?? '',
    keyword_relevance: parsed.keyword_relevance ?? null,
    recommendations: parsed.recommendations ?? [],
    ai_confidence: parsed.confidence ?? 0,
    model: 'claude-sonnet-4-6',
    tokens_used: message.usage.input_tokens + message.usage.output_tokens,
  };
}

function computeCitationScore(parsed) {
  let score = 0;

  if (parsed.known) score += 40;

  const levelScores = { 'well-known': 35, 'moderately-known': 20, 'niche': 10, 'unknown': 0 };
  score += levelScores[parsed.recognition_level] ?? 0;

  if (parsed.confidence) score += Math.round(parsed.confidence * 0.25);

  return Math.min(100, score);
}
