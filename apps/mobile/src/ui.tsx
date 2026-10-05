import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import type { Confidence } from '@/types';

export const T = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  accent: '#1D4ED8',
  accentSoft: '#EFF6FF',
  green: '#047857',
  greenSoft: '#ECFDF5',
  amber: '#B45309',
  amberSoft: '#FFFBEB',
  radius: 14,
};

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Muted({ children, style, numberOfLines }: { children: React.ReactNode; style?: TextStyle; numberOfLines?: number }) {
  return <Text style={[styles.muted, style]} numberOfLines={numberOfLines}>{children}</Text>;
}

export function ConfidenceBadge({ value }: { value: Confidence }) {
  const verified = value === 'verified';
  return (
    <View style={[styles.badge, verified ? styles.badgeGreen : styles.badgeAmber]}>
      <Text style={[styles.badgeText, verified ? styles.badgeTextGreen : styles.badgeTextAmber]}>
        {verified ? 'Verified' : 'Reported'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  card: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: T.line,
  },
  h1: { fontSize: 26, fontWeight: '800', color: T.ink },
  h2: { fontSize: 17, fontWeight: '700', color: T.ink, marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: T.ink },
  muted: { fontSize: 13, lineHeight: 19, color: T.muted },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeGreen: { backgroundColor: T.greenSoft },
  badgeAmber: { backgroundColor: T.amberSoft },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextGreen: { color: T.green },
  badgeTextAmber: { color: T.amber },
});
