import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Card, H2, Body, Muted, T } from '@/ui';
import { INDUSTRY_LEADERS, CONTENT_REVIEWED_ON } from '@/content/learning';
import { useBundle } from '@/lib/store';
import { Source } from './common';

export function Leaders() {
  const { chips } = useBundle();
  return (
    <View>
      <H2 style={{ marginHorizontal: 14, marginTop: 14 }}>Industry leaders by sector</H2>
      <Muted style={{ marginHorizontal: 14 }}>Each profile covers a different sector and period. They are not one ranking. Content reviewed {CONTENT_REVIEWED_ON}.</Muted>
      {INDUSTRY_LEADERS.map((l) => {
        const related = l.id === 'tsmc' ? chips.filter((c) => c.foundry === 'TSMC')
          : l.id === 'nvidia' ? chips.filter((c) => c.vendor === 'NVIDIA') : [];
        return (
          <Card key={l.id}>
            <Muted style={{ fontWeight: '700' }}>{l.segment}</Muted>
            <H2 style={{ marginTop: 2 }}>{l.name}: {l.headline}</H2>
            <Body>{l.explanation}</Body>
            <Muted style={{ marginTop: 6 }}>Reporting period: {l.period}</Muted>
            <Source source={l.source} />
            {l.id === 'asml' ? <Muted style={{ marginTop: 6 }}>No ASML chip profile exists in this dataset.</Muted> : null}
            {related.slice(0, 4).map((c) => (
              <Link key={c.id} href={{ pathname: '/chip/[id]', params: { id: c.id } }} asChild>
                <Pressable style={{ marginTop: 8 }}><Text style={{ color: T.accent, fontWeight: '600' }}>View chip: {c.name}</Text></Pressable>
              </Link>
            ))}
          </Card>
        );
      })}
    </View>
  );
}
