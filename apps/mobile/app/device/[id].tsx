import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View, Linking } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, H1, H2, Body, Muted, ConfidenceBadge, T } from '@/ui';
import { useBundle, getChip } from '@/lib/store';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { PartLinks } from '@/components/PartLinks';
import type { DeviceComponent } from '@/types';

function ComponentRow({ c }: { c: DeviceComponent }) {
  const chip = c.chipId ? getChip(c.chipId) : undefined;
  const inner = (
    <View style={styles.compRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.compCat}>{c.category}</Text>
        <Text style={styles.compName}>{c.name}</Text>
        <Muted>
          {c.vendor}
          {c.detail ? ` · ${c.detail}` : ''}
        </Muted>
      </View>
      <ConfidenceBadge value={c.confidence} />
    </View>
  );
  if (!chip) return <View style={styles.compWrap}>{inner}</View>;
  return (
    <Link href={{ pathname: '/chip/[id]', params: { id: chip.id } }} asChild>
      <Pressable style={styles.compWrap}>{inner}</Pressable>
    </Link>
  );
}

export default function DeviceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const device = useBundle().devices.find((d) => d.id === id);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (id) isFavorite(id).then(setFav);
  }, [id]);

  if (!device) {
    return (
      <Screen>
        <Card>
          <Body>Device not found.</Body>
        </Card>
      </Screen>
    );
  }

  async function onToggleFav() {
    const next = await toggleFavorite(device!.id);
    setFav(next);
  }

  function onShare() {
    const parts = device!.components
      .filter((c) => c.category === 'SoC' || c.category === 'Modem')
      .map((c) => c.name)
      .join(', ');
    Share.share({
      message: `${device!.name} teardown — ${device!.tagline}${parts ? `\nKey silicon: ${parts}` : ''}\nvia ChipScope`,
    }).catch(() => {});
  }

  const groups = device.components.reduce<Record<string, DeviceComponent[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <Screen>
      <ScrollView>
        <Card>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Muted>
                {device.brand} · {device.category} · {device.year}
              </Muted>
              <H1 style={{ marginTop: 4 }}>{device.name}</H1>
            </View>
            <Pressable onPress={onToggleFav} style={styles.iconBtn} hitSlop={8}>
              <Ionicons
                name={fav ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={fav ? T.accent : T.muted}
              />
            </Pressable>
            <Pressable onPress={onShare} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="share-outline" size={24} color={T.muted} />
            </Pressable>
          </View>
          <Body style={{ marginTop: 8 }}>{device.tagline}</Body>
          <View style={styles.hlGrid}>
            {device.highlights.map((h) => (
              <View key={h.label} style={styles.hl}>
                <Text style={styles.hlLabel}>{h.label}</Text>
                <Text style={styles.hlValue}>{h.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <H2 style={styles.section}>What’s inside</H2>
        {Object.entries(groups).map(([cat, comps]) => (
          <View key={cat}>
            {comps.map((c, i) => (
              <ComponentRow key={`${c.name}-${i}`} c={c} />
            ))}
          </View>
        ))}

        {device.repairability ? (
          <Card>
            <H2>Repairability</H2>
            <Body>{device.repairability}</Body>
          </Card>
        ) : null}

        <PartLinks query={`${device.brand} ${device.name} replacement parts`} title="Find parts" />

        <Card>
          <H2>Sources</H2>
          {device.sources.map((s, i) => (
            <Pressable
              key={i}
              disabled={!s.url}
              onPress={() => s.url && Linking.openURL(s.url)}
              style={styles.source}
            >
              <Text style={[styles.sourceLabel, s.url && styles.sourceLink]}>• {s.label}</Text>
              {s.url ? <Muted numberOfLines={1}>{s.url}</Muted> : null}
            </Pressable>
          ))}
          <Muted style={{ marginTop: 8 }}>
            Green = confirmed by the maker or multiple teardowns. Amber = seen in one reputable
            report — likely, not certain.
          </Muted>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 14, marginTop: 12, marginBottom: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBtn: { padding: 6, marginLeft: 4 },
  hlGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  hl: {
    width: '48%',
    backgroundColor: T.accentSoft,
    borderRadius: 10,
    padding: 10,
    marginRight: '2%',
    marginBottom: 8,
  },
  hlLabel: { fontSize: 11, color: T.muted, fontWeight: '700', textTransform: 'uppercase' },
  hlValue: { fontSize: 14, color: T.ink, fontWeight: '700', marginTop: 2 },
  compWrap: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: T.radius,
    padding: 12,
    marginHorizontal: 14,
    marginVertical: 4,
  },
  compRow: { flexDirection: 'row', alignItems: 'center' },
  compCat: { fontSize: 11, color: T.accent, fontWeight: '700', textTransform: 'uppercase' },
  compName: { fontSize: 15, fontWeight: '700', color: T.ink, marginVertical: 2 },
  source: { paddingVertical: 6 },
  sourceLabel: { fontSize: 14, color: T.ink },
  sourceLink: { color: T.accent, fontWeight: '600' },
});
