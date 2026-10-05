import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Card, H1, H2, Body, Muted, T } from '@/ui';
import { getApiKey, setApiKey } from '@/lib/apiKey';
import { getBundle } from '@/lib/store';

const DATA_SOURCES = [
  'iFixit teardowns — board-level photos naming the chips inside hundreds of devices (CC BY-NC-SA community content, linked with attribution).',
  'FCC certification filings — internal photos, block diagrams, and test reports filed before launch; the richest free source of “what’s inside”.',
  'Manufacturer datasheets and spec pages — process nodes, foundries, and official specs.',
  'WikiChip — community semiconductor encyclopedia for architectures and process history.',
  'Tech press and analyst reporting — TechInsights’ public BoM summaries, TechanaLye (Japan), Yole Group / System Plus (France), and outlets like Tom’s Hardware.',
  'Patent filings and kernel device trees — the paper trail behind unannounced silicon.',
];

export default function About() {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState<boolean | null>(null);
  const bundle = getBundle();

  useEffect(() => {
    getApiKey().then((k) => {
      setSaved(!!k);
      if (k) setKey('••••••••' + k.slice(-4));
    });
  }, []);

  async function save() {
    const v = key.includes('•') ? '' : key;
    if (key.includes('•')) return; // masked placeholder — unchanged
    await setApiKey(v);
    setSaved(!!v.trim());
  }

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
          <H2>AI answers — your key</H2>
          <Muted>
            The Ask tab runs on your own OpenAI key (gpt-4o-mini, a fraction of a cent per
            question). It’s stored in your phone’s keychain and never leaves the app except to
            OpenAI.
          </Muted>
          <TextInput
            style={styles.keyInput}
            placeholder="sk-…"
            value={key}
            onChangeText={setKey}
            autoCapitalize="none"
            secureTextEntry
          />
          <Pressable style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>{saved ? 'Update key' : 'Save key'}</Text>
          </Pressable>
          {saved ? <Muted style={{ marginTop: 6, color: T.green }}>✓ Key saved.</Muted> : null}
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
            A free GitHub Actions pipeline watches iFixit’s newest teardowns, FCC filings, tech
            press, and TechInsights’ public announcements for new products. When it finds one, it
            drafts a database entry for review and refreshes the news feed. The app checks for a
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
