import * as SecureStore from 'expo-secure-store';

const KEY = 'chipscope.openai.key';

/** The OpenAI key lives in the OS keychain — never in the dataset or logs. */
export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function setApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await SecureStore.deleteItemAsync(KEY);
    return;
  }
  await SecureStore.setItemAsync(KEY, trimmed);
}
