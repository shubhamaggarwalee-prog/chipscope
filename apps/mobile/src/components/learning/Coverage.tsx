import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Card, H2, Body, Muted } from '@/ui';
import { useBundle } from '@/lib/store';
import { SourceLink } from './common';

export function Coverage({ day }: { day: string }) {
  const bundle = useBundle();
  const items = useMemo(
    () => bundle.news.filter((item) => item.date <= day).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [bundle, day],
  );
  return (
    <View>
      <H2 style={{ marginHorizontal: 14, marginTop: 14 }}>Latest coverage in the dataset</H2>
      <Muted style={{ marginHorizontal: 14 }}>Dataset updated {bundle.updatedAt}. Items dated through {day}; future-dated entries are hidden. Not a live feed.</Muted>
      {items.length === 0 ? <Card><Body>No coverage recorded in this dataset.</Body></Card> : items.map((n) => (
        <Card key={n.id}>
          <Muted>{n.date} · {n.source}</Muted>
          <H2 style={{ marginTop: 4 }}>{n.title}</H2>
          <Body>{n.summary}</Body>
          <SourceLink url={n.url} label="Read source" />
        </Card>
      ))}
    </View>
  );
}
