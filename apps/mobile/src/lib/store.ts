import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUNDLED } from '@/data';
import type { DataBundle, Device, Chip } from '@/types';
import { fetchBundle } from './serverApi';
import { isDataBundle } from './bundleValidation';
import { useSyncExternalStore } from 'react';

/**
 * Data layer: bundled seed + free auto-refresh.
 *
 * The GitHub Actions pipeline (see /pipeline) rebuilds data/bundle.json
 * whenever it discovers new products. On launch the app tries to fetch the
 * latest bundle through the server (the source repo is private) and caches it locally; if the fetch
 * fails (offline, or URL not configured yet) it falls back to the bundle
 * shipped with the app. Everything works offline.
 *
 * The server serves validated public dataset records only, never credentials.
 */
const CACHE_KEY = 'chipscope.bundle.v1';

let current: DataBundle = BUNDLED;
let refreshPromise: Promise<'updated' | 'current' | 'unavailable'> | undefined;
const subscribers = new Set<() => void>();

export function useBundle(): DataBundle {
  return useSyncExternalStore(
    (listener) => { subscribers.add(listener); return () => { subscribers.delete(listener); }; },
    getBundle,
    getBundle,
  );
}

function replaceBundle(bundle: DataBundle) {
  current = bundle;
  subscribers.forEach((listener) => listener());
}

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
export function refreshFromRemote(): Promise<'updated' | 'current' | 'unavailable'> {
  return refreshPromise ??= refresh();
}

async function refresh(): Promise<'updated' | 'current' | 'unavailable'> {
  await hydrateFromCache();
  try {
    const remote = await fetchBundle();
    if (!isDataBundle(remote)) throw new Error('Invalid remote dataset');
    if (!remote || remote.version <= current.version) {
      // Still hydrate from local cache if it's newer than the bundle.
      await hydrateFromCache();
      return 'current';
    }
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote));
    replaceBundle(remote);
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
    if (isDataBundle(cached) && cached.version > current.version) replaceBundle(cached);
  } catch {
    // Corrupt cache: ignore, bundled data remains.
  }
}
