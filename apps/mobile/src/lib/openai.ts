import { askQuestion } from './serverApi';
import type { AskResult } from './askTypes';
export type { AskResult } from './askTypes';

/** The shared OpenAI key is used only by the server, never by this app. */
export async function askChipScope(question: string): Promise<AskResult> {
  const q = question.trim();
  if (q.length < 3) throw new Error('Ask a slightly longer question.');
  if (q.length > 1000) throw new Error('Keep your question under 1,000 characters.');
  try {
    return await askQuestion({ question: q });
  } catch (error) {
    const failure = error as { data?: { message?: string }; name?: string };
    if (failure.data?.message) throw new Error(failure.data.message);
    if (failure.name === 'TimeoutError' || failure.name === 'AbortError') {
      throw new Error('The answer took too long. Please try again.');
    }
    throw new Error('Could not reach Ask AI. Check your connection and try again.');
  }
}
