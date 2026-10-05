import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, H2, Body, Muted, T } from '@/ui';
import { LEARNING_FACTS } from '@/content/learning';
import { Source } from './common';
import { SaveButton } from './DailyFact';

export function History({ saved, canWrite, onToggle }: { saved: string[]; canWrite: boolean; onToggle: (id: string) => void }) {
  const facts = [...LEARNING_FACTS].sort((a, b) => a.year - b.year);
  return (
    <View>
      <H2 style={{ marginHorizontal: 14, marginTop: 14 }}>Semiconductor history</H2>
      <Muted style={{ marginHorizontal: 14 }}>A curated timeline of milestones, not news.</Muted>
      {facts.map((f) => (
        <Card key={f.id}>
          <View style={s.row}>
            <Text style={s.year}>{f.year} · {f.topic}</Text>
            <SaveButton saved={saved.includes(f.id)} disabled={!canWrite} onPress={() => onToggle(f.id)} />
          </View>
          <H2>{f.title}</H2>
          <Body>{f.body}</Body>
          <Source source={f.source} />
        </Card>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  year: { fontSize: 12, fontWeight: '800', color: T.accent },
});
