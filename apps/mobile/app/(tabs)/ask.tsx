import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
} from 'react-native';
import { Link } from 'expo-router';
import { Screen, Card, H2, Body, Muted, T } from '@/ui';
import { getBundle } from '@/lib/store';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { askChipScope, type AskResult } from '@/lib/openai';

interface Turn {
  role: 'user' | 'ai';
  text: string;
  citations?: string[];
}

const SUGGESTIONS = [
  'Which phones use a TSMC 3nm chip?',
  'What modem is in the iPhone 16 Pro Max?',
  'Compare the Tensor G4 and Snapdragon 8 Elite.',
  'What did TechInsights find inside the Huawei Mate 60 Pro?',
];

export default function Ask() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    setTurns((t) => [...t, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const result: AskResult = await askChipScope(q);
      setTurns((t) => [...t, { role: 'ai', text: result.answer, citations: result.citations }]);
    } catch (e) {
      setTurns((t) => [
        ...t,
        { role: 'ai', text: e instanceof Error ? e.message : 'Something went wrong.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
        <Card>
          <H2>Ask the database</H2>
          <Muted>
            Answers come only from the teardown database — devices, chips, and industry news
            collected from public sources. Anything outside it gets an honest “not yet”.
          </Muted>
          <Muted style={{ marginTop: 6 }}>Free to use. No API key needed. Daily limits keep AI available to everyone.</Muted>
          <View style={styles.suggestRow}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.suggest} onPress={() => send(s)} disabled={busy}>
                <Text style={styles.suggestText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {turns.map((t, i) =>
          t.role === 'user' ? (
            <View key={i} style={styles.userBubble}>
              <Text style={styles.userText}>{t.text}</Text>
            </View>
          ) : (
            <Card key={i}>
              <Body>{t.text}</Body>
              {t.citations && t.citations.length > 0 ? (
                <View style={styles.cites}>
                  {t.citations.map((c) => {
                    const [kind, id] = c.split(':');
                    if (kind === 'news') {
                      const item = getBundle().news.find((n) => n.id === id);
                      return item ? (
                        <Pressable key={c} style={styles.cite} onPress={() => Linking.openURL(item.url)}>
                          <Text style={styles.citeText}>Source: {item.source} ↗</Text>
                        </Pressable>
                      ) : null;
                    }
                    const href =
                      kind === 'device'
                        ? { pathname: '/device/[id]' as const, params: { id } }
                        : { pathname: '/chip/[id]' as const, params: { id } };
                    return (
                      <Link key={c} href={href} asChild>
                        <Pressable style={styles.cite}>
                          <Text style={styles.citeText}>
                            {kind === 'device' ? 'Device' : 'Chip'}: {id}
                          </Text>
                        </Pressable>
                      </Link>
                    );
                  })}
                </View>
              ) : null}
            </Card>
          ),
        )}
        {busy ? (
          <View style={styles.loading}>
            <ActivityIndicator color={T.accent} />
            <Muted style={{ marginLeft: 8 }}>Checking the database…</Muted>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about any chip or device…"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
          maxLength={1000}
          editable={!busy}
        />
        <Pressable style={[styles.send, { opacity: busy || !input.trim() ? 0.5 : 1 }]} onPress={() => send(input)} disabled={busy || !input.trim()}>
          <Text style={styles.sendText}>Ask</Text>
        </Pressable>
      </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  suggest: {
    backgroundColor: T.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestText: { fontSize: 13, color: T.accent, fontWeight: '600' },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: T.accent,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginVertical: 4,
    maxWidth: '85%',
  },
  userText: { color: '#fff', fontSize: 15 },
  cites: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  cite: {
    backgroundColor: T.accentSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  citeText: { fontSize: 12, color: T.accent, fontWeight: '700' },
  loading: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: T.card,
    borderTopWidth: 1,
    borderTopColor: T.line,
  },
  input: {
    flex: 1,
    backgroundColor: T.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  send: { backgroundColor: T.accent, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
