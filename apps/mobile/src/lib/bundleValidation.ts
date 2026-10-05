import type { DataBundle } from '@/types';

type RecordValue = Record<string, unknown>;
const object = (v: unknown): v is RecordValue => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: RecordValue, keys: string[]) => keys.every((k) => typeof v[k] === 'string');
const arrayOf = (v: unknown, check: (v: unknown) => boolean) => Array.isArray(v) && v.every(check);
const optionalString = (v: unknown) => v === undefined || typeof v === 'string';
const pair = (v: unknown) => object(v) && strings(v, ['label', 'value']);
const categories = new Set(['Phone', 'Laptop', 'Tablet', 'Wearable', 'Audio', 'Console', 'Board', 'Headset']);

/** Reject incomplete downloads/corrupt cache before replacing usable offline data. */
export function isDataBundle(v: unknown): v is DataBundle {
  if (!object(v) || !Number.isInteger(v.version) || (v.version as number) < 1 || typeof v.updatedAt !== 'string') return false;
  return arrayOf(v.devices, (d) => object(d)
    && strings(d, ['id', 'name', 'brand', 'category', 'tagline'])
    && categories.has(d.category as string) && Number.isInteger(d.year)
    && optionalString(d.repairability)
    && arrayOf(d.highlights, pair)
    && arrayOf(d.sources, (s) => object(s) && strings(s, ['label']) && optionalString(s.url))
    && arrayOf(d.components, (c) => object(c)
      && strings(c, ['category', 'name', 'vendor'])
      && (c.confidence === 'verified' || c.confidence === 'reported')
      && optionalString(c.detail) && optionalString(c.chipId)))
    && arrayOf(v.chips, (c) => object(c)
      && strings(c, ['id', 'name', 'vendor', 'kind'])
      && arrayOf(c.specs, pair) && arrayOf(c.usedIn, (id) => typeof id === 'string')
      && optionalString(c.processNode) && optionalString(c.foundry)
      && optionalString(c.infoUrl) && (c.year === undefined || Number.isInteger(c.year)))
    && arrayOf(v.news, (n) => object(n) && strings(n, ['id', 'date', 'title', 'summary', 'source', 'url']));
}
