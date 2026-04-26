// ============================================================
// geminiService.js — Real Gemini AI Triage
// Model: gemini-flash-lite-latest 
// Features: Promise dedup, session cache, single call guarantee
// ============================================================

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL      = 'gemini-flash-lite-latest';
const ENDPOINT   =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `${MODEL}:generateContent?key=${GEMINI_KEY}`;

// Layer 1: Permanent result cache for this browser session
const resultCache = new Map();

// Layer 2: In-flight deduplication — same message = same Promise
const inFlightMap = new Map();

// Layer 3: Minimum gap between calls to different messages
let lastCallTs    = 0;
const COOLDOWN_MS = 2000;

function buildPrompt(message) {
  return `You are an emergency triage AI for a hotel venue.
Analyze the guest emergency message below.
Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Guest message: "${message}"

Return exactly this structure:
{
  "type": "fire",
  "severity": 4,
  "responderTeam": "fire_dept",
  "confidence": 0.93,
  "broadcastSuggestion": "Please evacuate calmly via nearest stairs.",
  "summary": "Guest reports fire and smoke on floor 3."
}

STRICT RULES:
- type: MUST be one of → fire | medical | security | flood | earthquake | power | other
- severity: MUST be integer 1 to 5 (1=minor, 2=moderate, 3=serious, 4=critical, 5=life-threatening)
- responderTeam: MUST be one of → security | medical | maintenance | management | fire_dept
- confidence: float between 0.0 and 1.0
- broadcastSuggestion: calming message for all guests, maximum 12 words
- summary: one sentence summary for staff, maximum 20 words
OUTPUT ONLY THE JSON OBJECT. No other text.`;
}

function parseResponse(raw, message) {
  if (!raw?.trim()) throw new Error('Empty response from Gemini');

  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON found in: ${cleaned.slice(0, 80)}`);

  const parsed = JSON.parse(match[0]);

  const validTypes = ['fire','medical','security','flood','earthquake','power','other'];
  const validTeams = ['security','medical','maintenance','management','fire_dept'];

  return {
    type:    validTypes.includes(parsed.type) ? parsed.type : 'other',
    severity: Math.max(1, Math.min(5, parseInt(parsed.severity) || 3)),
    responderTeam: validTeams.includes(parsed.responderTeam)
      ? parsed.responderTeam : 'security',
    confidence: Math.max(0, Math.min(1, parseFloat(parsed.confidence) || 0.5)),
    broadcastSuggestion: parsed.broadcastSuggestion ||
      'Please stay calm and follow staff instructions.',
    summary: parsed.summary || `Emergency reported: ${message.slice(0, 50)}`,
    triaged: true,
  };
}

async function callGeminiAPI(message) {
  const elapsed = Date.now() - lastCallTs;
  if (elapsed < COOLDOWN_MS) {
    await new Promise(r => setTimeout(r, COOLDOWN_MS - elapsed));
  }
  lastCallTs = Date.now();

  console.log(' [Gemini] Firing ONE API call — model:', MODEL);

  const response = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(message) }] }],
      generationConfig: {
        temperature:     0.1,
        maxOutputTokens: 256,
        topP:            0.8,
      },
    }),
  });

  console.log(' [Gemini] HTTP Status:', response.status);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini ${response.status}: ${errData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  console.log(' [Gemini] Raw response:', raw);

  return parseResponse(raw, message);
}

export async function triageIncident(message) {
  if (!message?.trim()) return fallback('empty');
  const cacheKey = message.trim().toLowerCase();

  console.log(' [Gemini] triageIncident called');
  console.log(' [Gemini] Key loaded:', !!GEMINI_KEY,
    GEMINI_KEY ? GEMINI_KEY.slice(0, 8) + '...' : 'MISSING');

  if (!GEMINI_KEY) {
    console.error(' VITE_GEMINI_API_KEY missing from .env.local');
    return fallback(message);
  }

  if (resultCache.has(cacheKey)) {
    console.log(' [Gemini] Cache hit — no API call');
    return resultCache.get(cacheKey);
  }

  if (inFlightMap.has(cacheKey)) {
    console.log(' [Gemini] Dedup — joining in-flight request');
    return inFlightMap.get(cacheKey);
  }

  console.log(' [Gemini] Starting fresh API call');

  const promise = callGeminiAPI(message)
    .then(result => {
      console.log(' [Gemini] Triage complete:', result);
      resultCache.set(cacheKey, result);
      inFlightMap.delete(cacheKey);
      return result;
    })
    .catch(err => {
      console.error(' [Gemini] Failed:', err.message);
      inFlightMap.delete(cacheKey);
      const fb = fallback(message);
      resultCache.set(cacheKey, fb);
      return fb;
    });

  inFlightMap.set(cacheKey, promise);
  return promise;
}

function fallback(message) {
  console.warn(' [Gemini] Using fallback');
  return {
    type:                'unknown',
    severity:            3,
    responderTeam:       'security',
    confidence:          0,
    broadcastSuggestion: 'Please stay calm and await staff instructions.',
    summary: `Manual review required. Message: "${
      typeof message === 'string' ? message.slice(0, 50) : 'unknown'
    }"`,
    triaged: true,
  };
}

export function clearTriageCache() {
  resultCache.clear();
  inFlightMap.clear();
  console.log(' [Gemini] Cache cleared');
}