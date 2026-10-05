import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Screen, Card, H2, Body, Muted, T } from '@/ui';
import { useBundle, refreshFromRemote, searchAll } from '@/lib/store';
import { getDailyFact } from '@/content/learning';
import { useLocalDay } from '@/lib/useLocalDay';
import { getFavorites } from '@/lib/favorites';
import type { Device, DeviceCategory, NewsItem } from '@/types';

const CATEGORIES: ('All' | 'Saved' | DeviceCategory)[] = [
  'All', 'Saved', 'Phone', 'Laptop', 'Tablet', 'Wearable', 'Audio', 'Console', 'Board', 'Headset',
];

function DeviceRow({ device }: { device: Device }) {
  return (
    <Link href={{ pathname: '/device/[id]', params: { id: device.id } }} asChild>
      <Pressable>
        <Card>
          <View style={styles.rowTop}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.year}>{device.year}</Text>
          </View>
          <Muted>
            {device.brand} · {device.category}
          </Muted>
          <Body style={{ marginTop: 6 }}>{device.tagline}</Body>
          <View style={styles.specRow}>
            {device.highlights.slice(0, 3).map((h) => (
              <View key={h.label} style={styles.spec}>
                <Text style={styles.specLabel}>{h.label}</Text>
                <Text style={styles.specValue} numberOfLines={1}>{h.value}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const [linkError, setLinkError] = useState(false);
  return (
    <Pressable onPress={() => {
      setLinkError(false);
      Linking.openURL(item.url).catch(() => setLinkError(true));
    }}>
      <Card>
        <Muted>{item.date} · {item.source}</Muted>
        <H2 style={{ marginTop: 4 }}>{item.title}</H2>
        <Body>{item.summary}</Body>
        <Muted style={{ marginTop: 6, color: T.accent }}>Read source ↗</Muted>
        {linkError ? <Muted>Could not open the source. Please try again.</Muted> : null}
      </Card>
    </Pressable>
  );
}

export default function Discover() {
  const today = useLocalDay();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [refreshState, setRefreshState] = useState<'idle' | 'updated' | 'unavailable'>('idle');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    refreshFromRemote().then((r) => {
      setRefreshState(r === 'updated' ? 'updated' : r === 'current' ? 'idle' : 'unavailable');
      force((n) => n + 1);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getFavorites().then(setFavorites);
    }, []),
  );

  const bundle = useBundle();
  const { devices } = useMemo(() => searchAll(query), [query, bundle]);
  const filtered = useMemo(() => {
    if (category === 'All') return devices;
    if (category === 'Saved') return devices.filter((d) => favorites.includes(d.id));
    return devices.filter((d) => d.category === category);
  }, [devices, category, favorites]);
  const latest = useMemo(
    () => [...filtered].sort((a, b) => b.year - a.year || a.name.localeCompare(b.name)),
    [filtered],
  );

  return (
    <Screen>
      <FlatList
        data={latest}
        keyExtractor={(d) => d.id}
        ListHeaderComponent={
          <View>
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.search}
                placeholder="Search devices or chips — e.g. “A18 Pro”, “Pixel”, “modem”"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
              />
            </View>
            <TodayPreview />
            {query.trim() ? (
              <ChipResults query={query} />
            ) : null}
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(c) => c}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[styles.catPill, category === item && styles.catPillActive]}
                >
                  <Text style={[styles.catText, category === item && styles.catTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
            {refreshState === 'updated' ? (
              <Muted style={styles.refreshNote}>✓ Database updated with the latest products.</Muted>
            ) : null}
            <H2 style={styles.sectionTitle}>
              {query ? `Devices matching “${query}”` : 'Latest teardowns'}
            </H2>
          </View>
        }
        ListFooterComponent={
          !query ? (
            <View>
              <H2 style={styles.sectionTitle}>Industry news</H2>
              {bundle.news.filter((n) => n.date <= today).sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
              <View style={{ height: 24 }} />
            </View>
          ) : null
        }
        renderItem={({ item }) => <DeviceRow device={item} />}
        ListEmptyComponent={
          <Card>
            <Body>No devices match. Try “iPhone”, “Tensor”, or “Snapdragon”.</Body>
          </Card>
        }
      />
    </Screen>
  );
}

function TodayPreview() {
  const fact = getDailyFact(useLocalDay());
  return (
    <Link href="/today" asChild>
      <Pressable>
        <Card style={{ borderColor: T.accent }}>
          <Muted style={{ color: T.accent, fontWeight: '800' }}>TODAY · {fact.year}</Muted>
          <H2 style={{ marginTop: 4 }}>{fact.title}</H2>
          <Muted numberOfLines={2}>{fact.body}</Muted>
          <Muted style={{ marginTop: 6, color: T.accent }}>Open daily fact and quiz</Muted>
        </Card>
      </Pressable>
    </Link>
  );
}

function ChipResults({ query }: { query: string }) {
  const { chips } = searchAll(query);
  if (chips.length === 0) return null;
  return (
    <View>
      <H2 style={styles.sectionTitle}>Chips</H2>
      {chips.slice(0, 5).map((c) => (
        <Link key={c.id} href={{ pathname: '/chip/[id]', params: { id: c.id } }} asChild>
          <Pressable>
            <Card>
              <Text style={styles.deviceName}>{c.name}</Text>
              <Muted>
                {c.vendor} · {c.kind}
                {c.processNode ? ` · ${c.processNode}` : ''}
              </Muted>
            </Card>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { padding: 14, paddingBottom: 4 },
  search: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  catRow: { paddingHorizontal: 14, paddingVertical: 10 },
  catPill: {
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.card,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 8,
  },
  catPillActive: { backgroundColor: T.accent, borderColor: T.accent },
  catText: { fontSize: 13, fontWeight: '600', color: T.muted },
  catTextActive: { color: '#fff' },
  sectionTitle: { marginHorizontal: 14, marginTop: 10, marginBottom: 2 },
  refreshNote: { marginHorizontal: 14, marginTop: 2, color: T.green },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  deviceName: { fontSize: 17, fontWeight: '700', color: T.ink, flex: 1 },
  year: { fontSize: 13, color: T.muted, fontWeight: '600' },
  specRow: { flexDirection: 'row', marginTop: 10 },
  spec: { flex: 1, marginRight: 8 },
  specLabel: { fontSize: 11, color: T.muted, fontWeight: '700', textTransform: 'uppercase' },
  specValue: { fontSize: 13, color: T.ink, fontWeight: '600', marginTop: 2 },
});
