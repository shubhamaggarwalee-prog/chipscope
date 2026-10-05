import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Muted, T } from '@/ui';
import type { LearningSource } from '@/content/learning';

export function SourceLink({ url, label }: { url: string; label: string }) {
  const [err, setErr] = useState(false);
  const open = () => {
    setErr(false);
    Linking.openURL(url).catch(() => setErr(true));
  };
  return (
    <>
      <Pressable onPress={open} accessibilityRole="link" style={s.link}>
        <Text style={s.linkText}>{label}</Text>
        <Ionicons name="open-outline" size={14} color={T.accent} />
      </Pressable>
      {err ? <Muted style={{ color: T.amber }}>Could not open this link on this device.</Muted> : null}
    </>
  );
}
export const Source = ({ source }: { source: LearningSource }) => (
  <SourceLink url={source.url} label={`Source: ${source.label}`} />
);

export function Button({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.5 }]}>
      {icon ? <Ionicons name={icon} size={16} color="#fff" /> : null}
      <Text style={s.btnText}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, alignSelf: 'flex-start' },
  linkText: { color: T.accent, fontWeight: '600', fontSize: 13, flexShrink: 1 },
  btn: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: T.accent, borderRadius: 10, paddingVertical: 11, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
