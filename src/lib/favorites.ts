import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'chipscope.favorites.v1';

async function read(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function getFavorites(): Promise<string[]> {
  return read();
}

export async function isFavorite(id: string): Promise<boolean> {
  return (await read()).includes(id);
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const favs = await read();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(id);
}
