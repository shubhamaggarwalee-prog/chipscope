import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen, Card, H1, H2, Body, Muted, ConfidenceBadge, T } from '@/ui';
import { useBundle } from '@/lib/store';
import type { Device } from '@/types';

function keyComponents(d: Device): string[] {
  const pick = (cats: string[]) =>
    d.components.filter((c) => cats.includes(c.category)).map((c) => c.name);
  const soc = pick(['SoC']);
  const modem = pick(['Modem']);
  const mem = pick(['Memory']);
  const cam = pick(['Camera']);
  const display = pick(['Display']);
  const power = pick(['Power']);
  return [...soc, ...modem, ...mem, ...cam, ...display, ...power].slice(0, 6);
}

function DevicePicker({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: Device | null;
  onSelect: (d: Device) => void;
}) {
  const [open, setOpen] = useState(false);
  const devices = useBundle().devices;
  return (
    <View style={{ flex: 1 }}>
      <Muted style={{ marginBottom: 4 }}>{label}</Muted>
      <Pressable style={styles.picker} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.pickerText} numberOfLines={1}>
          {selected ? selected.name : 'Choose device…'}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.list}>
          <ScrollView style={{ maxHeight: 220 }}>
            {devices.map((d) => (
              <Pressable
                key={d.id}
                style={styles.option}
                onPress={() => {
                  onSelect(d);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>
                  {d.name} <Text style={{ color: T.muted }}>· {d.year}</Text>
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function Compare() {
  const bundle = useBundle();
  const [aId, setAId] = useState<string | null>(bundle.devices[0]?.id ?? null);
  const [bId, setBId] = useState<string | null>(bundle.devices[4]?.id ?? null);
  const a = useMemo(() => bundle.devices.find((d) => d.id === aId) ?? null, [bundle, aId]);
  const b = useMemo(() => bundle.devices.find((d) => d.id === bId) ?? null, [bundle, bId]);

  return (
    <Screen>
      <ScrollView>
        <View style={styles.pickers}>
          <DevicePicker label="Device A" selected={a} onSelect={(d) => setAId(d.id)} />
          <View style={{ width: 10 }} />
          <DevicePicker label="Device B" selected={b} onSelect={(d) => setBId(d.id)} />
        </View>

        {a && b ? (
          <View>
            <Card>
              <View style={styles.vsRow}>
                <View style={{ flex: 1 }}>
                  <H1 style={{ fontSize: 19 }}>{a.name}</H1>
                  <Muted>{a.brand} · {a.year}</Muted>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <H1 style={{ fontSize: 19, textAlign: 'right' }}>{b.name}</H1>
                  <Muted>{b.brand} · {b.year}</Muted>
                </View>
              </View>
            </Card>

            <H2 style={styles.section}>Headline specs</H2>
            <Card>
              {['SoC', 'Process', 'Modem', 'RAM'].map((label) => {
                const av = a.highlights.find((h) => h.label === label)?.value ?? '—';
                const bv = b.highlights.find((h) => h.label === label)?.value ?? '—';
                return (
                  <View key={label} style={styles.cmpRow}>
                    <Text style={[styles.cmpVal, { textAlign: 'left' }]}>{av}</Text>
                    <Text style={styles.cmpLabel}>{label}</Text>
                    <Text style={[styles.cmpVal, { textAlign: 'right' }]}>{bv}</Text>
                  </View>
                );
              })}
            </Card>

            <H2 style={styles.section}>Key components</H2>
            {(() => {
              const ka = keyComponents(a);
              const kb = keyComponents(b);
              const rows = Math.max(ka.length, kb.length);
              return (
                <Card>
                  {Array.from({ length: rows }).map((_, i) => (
                    <View key={i} style={styles.cmpRow}>
                      <Text style={[styles.cmpVal, { textAlign: 'left' }]}>{ka[i] ?? '—'}</Text>
                      <Text style={styles.cmpDot}>•</Text>
                      <Text style={[styles.cmpVal, { textAlign: 'right' }]}>{kb[i] ?? '—'}</Text>
                    </View>
                  ))}
                </Card>
              );
            })()}

            <Card>
              <H2>Confidence</H2>
              <Body>
                Components marked <Text style={{ fontWeight: '700' }}>Verified</Text> are confirmed
                by the maker or multiple teardowns; <Text style={{ fontWeight: '700' }}>Reported</Text>{' '}
                comes from a single reputable report.
              </Body>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <ConfidenceBadge value="verified" />
                <View style={{ width: 8 }} />
                <ConfidenceBadge value="reported" />
              </View>
            </Card>
          </View>
        ) : (
          <Card>
            <Body>Pick two devices to compare their internals.</Body>
          </Card>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickers: { flexDirection: 'row', padding: 14, zIndex: 10 },
  picker: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: { fontSize: 14, fontWeight: '600', color: T.ink },
  list: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    marginTop: 4,
  },
  option: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.line },
  optionText: { fontSize: 14, color: T.ink },
  vsRow: { flexDirection: 'row', alignItems: 'center' },
  vs: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 8,
  },
  section: { marginHorizontal: 14, marginTop: 12, marginBottom: 2 },
  cmpRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.line },
  cmpVal: { flex: 1, fontSize: 13, color: T.ink, fontWeight: '600' },
  cmpLabel: { width: 64, textAlign: 'center', fontSize: 11, color: T.muted, fontWeight: '700', textTransform: 'uppercase' },
  cmpDot: { width: 64, textAlign: 'center', color: T.muted },
});
