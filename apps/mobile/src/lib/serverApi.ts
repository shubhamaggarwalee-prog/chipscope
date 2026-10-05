import { askChipScopeQuestion, getChipScopeBundle, setBaseUrl } from '@workspace/api-client-react';

const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (explicitUrl || domain) setBaseUrl(explicitUrl || `https://${domain}`);

async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>, milliseconds: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try { return await run(controller.signal); } finally { clearTimeout(timer); }
}

export const fetchBundle = () => withTimeout(
  (signal) => getChipScopeBundle({ signal }), 15_000,
);
export const askQuestion = (input: { question: string }) => withTimeout(
  (signal) => askChipScopeQuestion(input, { signal }), 45_000,
);
