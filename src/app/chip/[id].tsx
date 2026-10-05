import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Screen, Card, H1, H2, Body, Muted, T } from '@/ui';
import { getChip, getDevice } from '@/lib/store';
import { PartLinks } from '@/components/PartLinks';

export default function ChipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chip = getChip(id);

  if (!chip) {
    return (
      <Screen>
        <Card>
          <Body>Chip not found.</Body>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <Card>
          <Muted>
            {chip.vendor} · {chip.kind}
            {chip.year ? ` · ${chip.year}` : ''}
          </Muted>
          <H1 style={{ marginTop: 4 }}>{chip.name}</H1>
          <View style={styles.metaRow}>
            {chip.processNode ? (
              <View style={styles.meta}>
                <Text style={styles.metaLabel}>Process</Text>
                <Text style={styles.metaValue}>{chip.processNode}</Text>
              </View>
            ) : null}
            {chip.foundry ? (
              <View style={styles.meta}>
                <Text style={styles.metaLabel}>Foundry</Text>
                <Text style={styles.metaValue}>{chip.foundry}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        <Card>
          <H2>Specifications</H2>
          {chip.specs.map((s) => (
            <View key={s.label} style={styles.specRow}>
              <Text style={styles.specLabel}>{s.label}</Text>
              <Text style={styles.specValue}>{s.value}</Text>
            </View>
          ))}
        </Card>

        <PartLinks query={`${chip.vendor} ${chip.name}`} title="Find this chip" />

        <H2 style={styles.section}>Found in</H2>        {chip.usedIn.map((deviceId) => {
          const d = getDevice(deviceId);
          if (!d) return null;
          return (
            <Link key={deviceId} href={{ pathname: '/device/[id]', params: { id: d.id } }} asChild>
              <Pressable>
                <Card>
                  <Text style={styles.deviceName}>{d.name}</Text>
                  <Muted>
                    {d.brand} · {d.year}
                  </Muted>
                </Card>
              </Pressable>
            </Link>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', marginTop: 12 },
  meta: {
    flex: 1,
    backgroundColor: T.accentSoft,
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
  },
  metaLabel: { fontSize: 11, color: T.muted, fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 14, color: T.ink, fontWeight: '700', marginTop: 2 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: T.line,
  },
  specLabel: { fontSize: 14, color: T.muted, flex: 1 },
  specValue: { fontSize: 14, color: T.ink, fontWeight: '600', flex: 1.4, textAlign: 'right' },
  section: { marginHorizontal: 14, marginTop: 12, marginBottom: 2 },
  deviceName: { fontSize: 16, fontWeight: '700', color: T.ink },
});
