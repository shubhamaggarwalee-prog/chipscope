/** ChipScope data model.
 *
 * Everything the app shows comes from public sources only — no lab work,
 * no paywalled reports. Every component carries a confidence tag:
 * - "verified": confirmed by the manufacturer or multiple independent teardowns
 * - "reported": seen in one reputable teardown/report; treat as likely, not certain
 */

export type Confidence = 'verified' | 'reported';

export type DeviceCategory =
  | 'Phone'
  | 'Laptop'
  | 'Tablet'
  | 'Wearable'
  | 'Audio'
  | 'Console'
  | 'Board'
  | 'Headset';

export interface DataSource {
  label: string;
  /** Omitted when we know the publication but don't have a verified link. */
  url?: string;
}

export interface DeviceComponent {
  /** e.g. "SoC", "Modem", "Memory", "Storage", "Camera", "Display", "Audio", "Power", "Connectivity", "Sensors" */
  category: string;
  /** e.g. "Apple A18 Pro" */
  name: string;
  /** e.g. "Apple" */
  vendor: string;
  /** e.g. '3nm (TSMC N3E)' */
  detail?: string;
  /** Links into the chips database when we have a full profile. */
  chipId?: string;
  confidence: Confidence;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  category: DeviceCategory;
  year: number;
  tagline: string;
  highlights: { label: string; value: string }[];
  components: DeviceComponent[];
  repairability?: string;
  sources: DataSource[];
}

export interface Chip {
  id: string;
  name: string;
  vendor: string;
  /** e.g. "Mobile SoC", "5G Modem", "Memory" */
  kind: string;
  processNode?: string;
  foundry?: string;
  year?: number;
  specs: { label: string; value: string }[];
  /** Device ids that use this chip. */
  usedIn: string[];
  infoUrl?: string;
}

export interface NewsItem {
  id: string;
  date: string; // ISO
  title: string;
  summary: string;
  source: string;
  url: string;
}

export interface DataBundle {
  version: number;
  updatedAt: string; // ISO
  devices: Device[];
  chips: Chip[];
  news: NewsItem[];
}
