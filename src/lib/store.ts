import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUNDLED } from '@/data';
import type { DataBundle, Device, Chip } from '@/types';

/**
 * Data layer: bundled seed + free auto-refresh.
 *
 * The GitHub Actions pipeline (see /pipeline) rebuilds data/bundle.json
 * whenever it discovers new products. On launch the app tries to fetch the
 * latest bundle from REMOTE_BUNDLE_URL and caches it locally; if the fetch
 * fails (offline, or URL not configured yet) it falls back to the bundle
 * shipped with the app. Everything works offline.
 *
 * To enable auto-updates: fork the repo, let the pipeline run, and set
 * REMOTE_BUNDLE_URL to your raw.githubusercontent.com bundle URL.
 * See README.md for the one-time setup.
 */
const REMOTE_BUNDLE_URL = ''; // e.g. 'https://raw.githubusercontent.com/YOU/chipscope/main/data/bundle.json'
const CACHE_KEY = 'chipscope.bundle.v1';

let current: DataBundle = BUNDLED;
let remoteChecked = false;

export function getBundle(): DataBundle {
  return current;
}

export function getDevice(id: string): Device | undefined {
  return current.devices.find((d) => d.id === id);
}

export function getChip(id: string): Chip | undefined {
  return current.chips.find((c) => c.id === id);
}

export function searchAll(query: string): { devices: Device[]; chips: Chip[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { devices: current.devices, chips: current.chips };
  const devices = current.devices.filter((d) =>
    `${d.name} ${d.brand} ${d.category} ${d.year}`.toLowerCase().includes(q),
  );
  const chips = current.chips.filter((c) =>
    `${c.name} ${c.vendor} ${c.kind} ${c.processNode ?? ''}`.toLowerCase().includes(q),
  );
  return { devices, chips };
}

/** One attempt per launch to pull the latest pipeline-built bundle. */
export async function refreshFromRemote(): Promise<'updated' | 'current' | 'unavailable'> {
  if (remoteChecked || !REMOTE_BUNDLE_URL) return 'unavailable';
  remoteChecked = true;
  try {
    const res = await fetch(REMOTE_BUNDLE_URL, { headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) return 'unavailable';
    const remote = (await res.json()) as DataBundle;
    if (!remote || remote.version <= current.version) {
      // Still hydrate from local cache if it's newer than the bundle.
      await hydrateFromCache();
      return 'current';
    }
    current = remote;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote));
    return 'updated';
  } catch {
    await hydrateFromCache();
    return 'unavailable';
  }
}

async function hydrateFromCache(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const cached = JSON.parse(raw) as DataBundle;
    if (cached && cached.version > current.version) current = cached;
  } catch {
    // Corrupt cache: ignore, bundled data remains.
  }
}
