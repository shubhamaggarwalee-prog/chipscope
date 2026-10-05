import { getBundle } from './store';

/**
 * Grounded Q&A over the ChipScope dataset.
 *
 * The whole dataset is serialized as the SOURCE the model may use. The model
 * must cite device/chip ids for every factual claim; after parsing we verify
 * each cited id actually exists and drop claims that cite nothing real.
 * Anything outside the dataset gets an honest "not in the database yet".
 */

const MODEL = 'gpt-4o-mini';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_SOURCE_CHARS = 60000;

const SYSTEM_PROMPT = `You are ChipScope, an expert on consumer-electronics teardowns. You answer ONLY from the SOURCE DATA below (a JSON database of devices, chips, and news built from public teardowns).

OUTPUT — strict JSON only, no markdown fences:
{"answer":"...","citations":["device:id","chip:id", ...]}

RULES:
1. Every factual claim in "answer" must come from the SOURCE DATA. Never use training knowledge, never guess part numbers, vendors, or specs.
2. "citations" lists the ids (e.g. "device:iphone-16-pro-max", "chip:apple-a18-pro") backing the claims. Include every id you relied on; omit ids you did not use.
3. If the question cannot be answered from the SOURCE DATA, say so plainly in "answer" (e.g. "I don't have that device in the database yet — the database covers ...") and return "citations":[].
4. "answer" is 2-6 sentences, plain text, no markdown. Name the source type where useful ("per iFixit's teardown", "per TechInsights' BoM").
5. Distinguish verified facts from reported ones when the data says so.`;

export interface AskResult {
  answer: string;
  citations: string[];
}

function buildSource(): string {
  const b = getBundle();
  const slim = {
    devices: b.devices.map((d) => ({
      id: d.id,
      name: d.name,
      brand: d.brand,
      category: d.category,
      year: d.year,
      tagline: d.tagline,
      components: d.components.map((c) => ({
        category: c.category,
        name: c.name,
        vendor: c.vendor,
        detail: c.detail,
        confidence: c.confidence,
      })),
      repairability: d.repairability,
    })),
    chips: b.chips.map((c) => ({
      id: c.id,
      name: c.name,
      vendor: c.vendor,
      kind: c.kind,
      processNode: c.processNode,
      foundry: c.foundry,
      specs: c.specs,
    })),
    news: b.news.map((n) => ({ date: n.date, title: n.title, summary: n.summary, source: n.source })),
  };
  return JSON.stringify(slim).slice(0, MAX_SOURCE_CHARS);
}

function validCitation(id: string): boolean {
  const b = getBundle();
  if (id.startsWith('device:')) return b.devices.some((d) => d.id === id.slice(7));
  if (id.startsWith('chip:')) return b.chips.some((c) => c.id === id.slice(5));
  return false;
}

export async function askChipScope(question: string, apiKey: string): Promise<AskResult> {
  const q = question.trim();
  if (q.length < 3) throw new Error('Ask a slightly longer question.');
  if (!apiKey) throw new Error('No OpenAI API key set. Add one in About → Settings.');

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `SOURCE DATA:\n${buildSource()}\n\nQUESTION: ${q}`,
          },
        ],
      }),
    });
  } catch {
    throw new Error('Could not reach the OpenAI API. Check your connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('OpenAI rejected the API key (401). Check it in About → Settings.');
    }
    throw new Error(`OpenAI request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error('The AI returned an empty response.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim());
  } catch {
    throw new Error('The AI returned an unparseable response. Try again.');
  }
  const p = parsed as { answer?: unknown; citations?: unknown };
  if (typeof p.answer !== 'string' || !p.answer.trim()) {
    throw new Error('The AI returned an unparseable response. Try again.');
  }
  const citations = Array.isArray(p.citations)
    ? p.citations.filter((c): c is string => typeof c === 'string' && validCitation(c))
    : [];
  return { answer: p.answer.trim(), citations };
}
