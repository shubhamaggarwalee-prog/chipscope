import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, H2, Muted, T } from '@/ui';
import { DISTRIBUTORS, openParts, isEarning } from '@/lib/affiliate';

/**
 * "Find parts" card — affiliate plumbing.
 * Shown on chip pages (query = chip name) and device pages (query = device name).
 */
export function PartLinks({ query, title }: { query: string; title: string }) {
  return (
    <Card>
      <H2>{title}</H2>
      <Muted>Search live distributor stock for this part.</Muted>
      <View style={styles.grid}>
        {DISTRIBUTORS.map((d) => (
          <Pressable key={d.id} style={styles.btn} onPress={() => openParts(d, query)}>
            <Ionicons name="cart-outline" size={18} color={T.accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.name}>{d.name}</Text>
              <Text style={styles.blurb}>{d.blurb}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={T.muted} />
          </Pressable>
        ))}
      </View>
      <Muted style={styles.disclosure}>
        {isEarning()
          ? 'Affiliate links — purchases may earn us a commission at no cost to you. That’s what keeps ChipScope free.'
          : 'Shopping links — add affiliate IDs in src/lib/affiliate.ts to earn commission and keep ChipScope free.'}
      </Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { marginTop: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.accentSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: '700', color: T.ink },
  blurb: { fontSize: 12, color: T.muted, marginTop: 1 },
  disclosure: { marginTop: 4, fontSize: 12 },
});
