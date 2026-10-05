import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen, Card, H1, H2, Body, Muted, T } from '@/ui';
import { useBundle } from '@/lib/store';

const DATA_SOURCES = [
  'iFixit teardowns — board-level photos naming the chips inside hundreds of devices (CC BY-NC-SA community content, linked with attribution).',
  'FCC certification filings — internal photos, block diagrams, and test reports filed before launch; the richest free source of “what’s inside”.',
  'Manufacturer datasheets and spec pages — process nodes, foundries, and official specs.',
  'WikiChip — community semiconductor encyclopedia for architectures and process history.',
  'Tech press and analyst reporting — TechInsights’ public BoM summaries, TechanaLye (Japan), Yole Group / System Plus (France), and outlets like Tom’s Hardware.',
  'Patent filings and kernel device trees — the paper trail behind unannounced silicon.',
];

export default function About() {
  const bundle = useBundle();

  return (
    <Screen>
      <ScrollView>
        <Card>
          <H1>ChipScope</H1>
          <Body style={{ marginTop: 8 }}>
            Free teardown intelligence: what’s inside the world’s electronics, built entirely from
            public sources — no lab, no paywall. Search any device to see its chips, compare
            internals, and ask the AI anything about the database.
          </Body>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{bundle.devices.length}</Text>
              <Muted>devices</Muted>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{bundle.chips.length}</Text>
              <Muted>chips</Muted>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>
                {bundle.devices.reduce((n, d) => n + d.components.length, 0)}
              </Text>
              <Muted>components</Muted>
            </View>
          </View>
        </Card>

        <Card>
          <H2>Free AI answers</H2>
          <Muted>
            Ask AI is free to use — no personal API key or payment is required.
            Questions and relevant public database records are sent to OpenAI through
            ChipScope’s server. No chat history is stored on our server. Daily usage limits apply.
          </Muted>
        </Card>

        <Card>
          <H2>Where the data comes from</H2>
          {DATA_SOURCES.map((s, i) => (
            <Text key={i} style={styles.sourceItem}>• {s}</Text>
          ))}
        </Card>

        <Card>
          <H2>How updates work</H2>
          <Body>
            The weekly GitHub pipeline checks iFixit and TechInsights’ public listings for new
            teardown coverage. It queues discoveries for human review and refreshes the news
            feed. Unreviewed drafts never replace curated device records. The app checks for a
            new database on launch and updates itself — no app-store update needed.
          </Body>
          <Muted style={{ marginTop: 8 }}>
            Honest limits: without a lab we can’t do die decaps or process cross-sections. Every
            component is tagged Verified or Reported so you know what’s solid and what’s single-source.
          </Muted>
        </Card>

        <Card>
          <H2>Other players in this space</H2>
          <Body>
            TechInsights (Ottawa, Canada) is the incumbent — 100K+ lab teardowns behind a paywall.
            Yole Group / System Plus (France) and TechanaLye (Japan, ~100 devices a year) do similar
            lab work. iFixit (US) is the biggest open teardown community. ChipScope’s bet: the
            public 80% of that knowledge, free, in your pocket.
          </Body>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginTop: 14 },
  stat: { flex: 1, alignItems: 'center', backgroundColor: T.accentSoft, borderRadius: 10, padding: 10, marginRight: 8 },
  statNum: { fontSize: 22, fontWeight: '800', color: T.accent },
  keyInput: {
    backgroundColor: T.bg,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 10,
  },
  saveBtn: { backgroundColor: T.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sourceItem: { fontSize: 14, lineHeight: 21, color: T.ink, marginTop: 6 },
});
