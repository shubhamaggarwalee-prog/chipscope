import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, H2, Body, Muted, T } from '@/ui';
import type { LearningFact } from '@/content/learning';
import { Source } from './common';

export function SaveButton({ saved, disabled, onPress }: { saved: boolean; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityLabel={saved ? 'Unsave fact' : 'Save fact'} style={{ opacity: disabled ? 0.5 : 1, padding: 4 }}>
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={T.accent} />
    </Pressable>
  );
}

export function DailyFact({ fact, saved, canWrite, onToggle }: { fact: LearningFact; saved: boolean; canWrite: boolean; onToggle: () => void }) {
  return (
    <Card style={{ borderColor: T.accent }}>
      <View style={s.top}>
        <Text style={s.kicker}>FACT OF THE DAY · {fact.year}</Text>
        <SaveButton saved={saved} disabled={!canWrite} onPress={onToggle} />
      </View>
      <H2>{fact.title}</H2>
      <Body>{fact.body}</Body>
      <View style={s.why}><Muted style={{ color: T.ink }}>Why it matters: {fact.whyItMatters}</Muted></View>
      <Source source={fact.source} />
    </Card>
  );
}
const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontSize: 11, fontWeight: '800', color: T.accent, letterSpacing: 0.6 },
  why: { backgroundColor: T.accentSoft, borderRadius: 10, padding: 10, marginTop: 10 },
});
