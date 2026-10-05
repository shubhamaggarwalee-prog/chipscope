import React from 'react';
import { View } from 'react-native';
import { Card, H2, Body, Muted } from '@/ui';
import { LEARNING_FACTS } from '@/content/learning';
import { Source } from './common';
import { SaveButton } from './DailyFact';

export function Saved({ saved, canWrite, onToggle }: { saved: string[]; canWrite: boolean; onToggle: (id: string) => void }) {
  const facts = LEARNING_FACTS.filter((f) => saved.includes(f.id));
  return (
    <View>
      <H2 style={{ marginHorizontal: 14, marginTop: 14 }}>Saved facts</H2>
      {facts.length === 0 ? <Card><Body>Nothing saved yet. Tap the bookmark on any fact to keep it here.</Body></Card> : facts.map((f) => (
        <Card key={f.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Muted>{f.year}</Muted>
            <SaveButton saved disabled={!canWrite} onPress={() => onToggle(f.id)} />
          </View>
          <H2>{f.title}</H2>
          <Body>{f.whyItMatters}</Body>
          <Source source={f.source} />
        </Card>
      ))}
    </View>
  );
}
