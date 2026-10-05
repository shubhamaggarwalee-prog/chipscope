import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, H1, H2, Body, Muted, T } from '@/ui';
import { getBundle } from '@/lib/store';
import type { Chip } from '@/types';

/** The TechInsights-style view: who makes the silicon, on what process. */
export default function Silicon() {
  const bundle = getBundle();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const byFoundry = useMemo(() => {
    const m = new Map<string, Chip[]>();
    for (const c of bundle.chips) {
      const key = c.foundry || 'Unknown / fabless';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(c);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [bundle]);

  const byNode = useMemo(() => {
    const m = new Map<string, Chip[]>();
    for (const c of bundle.chips) {
      const key = c.processNode || 'Not disclosed';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(c);
    }
    const rank = (s: string) => parseFloat(s) || 999;
    return [...m.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
  }, [bundle]);

  const tsmcShare = useMemo(() => {
    const withFoundry = bundle.chips.filter((c) => c.foundry);
    const tsmc = withFoundry.filter((c) => c.foundry === 'TSMC').length;
    return withFoundry.length ? Math.round((tsmc / withFoundry.length) * 100) : 0;
  }, [bundle]);

  function Section({
    id,
    title,
    subtitle,
    chips,
  }: {
    id: string;
    title: string;
    subtitle: string;
    chips: Chip[];
  }) {
    const open = openSection === id;
    return (
      <View>
        <Pressable style={styles.row} onPress={() => setOpenSection(open ? null : id)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Muted>{subtitle}</Muted>
          </View>
          <View style={styles.count}>
            <Text style={styles.countText}>{chips.length}</Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={T.muted} />
        </Pressable>
        {open
          ? chips.map((c) => (
              <Link key={c.id} href={{ pathname: '/chip/[id]', params: { id: c.id } }} asChild>
                <Pressable style={styles.chipRow}>
                  <Text style={styles.chipName}>{c.name}</Text>
                  <Muted>
                    {c.vendor} · {c.kind}
                  </Muted>
                </Pressable>
              </Link>
            ))
          : null}
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <Card>
          <H1>Silicon landscape</H1>
          <Body style={{ marginTop: 6 }}>
            Every chip in the database, grouped by who fabricates it and on what process node —
            the foundry view the industry pays TechInsights thousands for.
          </Body>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{bundle.chips.length}</Text>
              <Muted>chips tracked</Muted>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{tsmcShare}%</Text>
              <Muted>made by TSMC</Muted>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{byNode.length}</Text>
              <Muted>process nodes</Muted>
            </View>
          </View>
        </Card>

        <Card>
          <H2>By foundry</H2>
          {byFoundry.map(([foundry, chips]) => (
            <Section
              key={foundry}
              id={`f-${foundry}`}
              title={foundry}
              subtitle={`${chips.length} chip${chips.length === 1 ? '' : 's'}`}
              chips={chips}
            />
          ))}
        </Card>

        <Card>
          <H2>By process node</H2>
          <Muted style={{ marginBottom: 8 }}>Smaller is more advanced. Leading edge today: 3nm.</Muted>
          {byNode.map(([node, chips]) => (
            <Section
              key={node}
              id={`n-${node}`}
              title={node}
              subtitle={`${chips.length} chip${chips.length === 1 ? '' : 's'}`}
              chips={chips}
            />
          ))}
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginTop: 14 },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: T.accentSoft,
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
  },
  statNum: { fontSize: 22, fontWeight: '800', color: T.accent },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.line,
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: T.ink },
  count: {
    backgroundColor: T.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  countText: { fontSize: 13, fontWeight: '700', color: T.accent },
  chipRow: {
    paddingVertical: 9,
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.line,
  },
  chipName: { fontSize: 14, fontWeight: '600', color: T.ink },
});
