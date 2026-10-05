import type { DataBundle, Device, Chip, NewsItem } from '@/types';
import devicesJson from '../../data/devices.json';
import chipsJson from '../../data/chips.json';
import newsJson from '../../data/news.json';

/**
 * Canonical dataset lives in /data/*.json — the GitHub Actions pipeline
 * edits those files directly. This module just re-exports them typed.
 */
export const BUNDLED: DataBundle = {
  version: 1,
  updatedAt: '2026-10-04',
  devices: devicesJson as Device[],
  chips: chipsJson as Chip[],
  news: newsJson as NewsItem[],
};
