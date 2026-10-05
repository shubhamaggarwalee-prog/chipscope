import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Screen, Card, H1, Body, Muted, T } from '@/ui';
import { getDailyFact } from '@/content/learning';
import { useLearning } from '@/components/learning/useLearning';
import { DailyFact } from '@/components/learning/DailyFact';
import { DailyQuiz } from '@/components/learning/DailyQuiz';
import { Coverage } from '@/components/learning/Coverage';
import { History } from '@/components/learning/History';
import { Leaders } from '@/components/learning/Leaders';
import { Saved } from '@/components/learning/Saved';
import { Button } from '@/components/learning/common';

type Section = 'Daily' | 'History' | 'Leaders' | 'Saved';
const SECTIONS: Section[] = ['Daily', 'History', 'Leaders', 'Saved'];

export default function Today() {
  const [section, setSection] = useState<Section>('Daily');
  const L = useLearning();
  const fact = useMemo(() => getDailyFact(L.day), [L.day]);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ padding: 14, paddingBottom: 4 }}>
          <H1>Today</H1>
          <Muted>{L.day}. A new fact and question every local day.</Muted>
        </View>
        {L.error ? (
          <Card style={{ borderColor: T.amber, backgroundColor: T.amberSoft }}>
            <Body>{L.error}</Body>
            <Button label="Retry" icon="refresh" onPress={L.retry} disabled={L.loading || L.pending} />
          </Card>
        ) : null}
        {L.loading ? <Card><Muted>Loading your progress...</Muted></Card> : null}
        <View style={{ flexDirection: 'row', marginHorizontal: 14, marginVertical: 8, gap: 6 }} accessibilityRole="tablist">
          {SECTIONS.map((s) => {
            const on = s === section;
            return (
              <Pressable key={s} onPress={() => setSection(s)} accessibilityRole="tab" accessibilityState={{ selected: on }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: on ? T.accent : T.line, backgroundColor: on ? T.accent : T.card }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: on ? '#fff' : T.muted }}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
        {section === 'Daily' ? (
          <>
            <DailyFact fact={fact} saved={L.progress.savedFactIds.includes(fact.id)} canWrite={L.canWrite} onToggle={() => L.toggle(fact.id)} />
            <DailyQuiz key={L.day} day={L.day} progress={L.progress} canWrite={L.canWrite} onSubmit={L.submit} />
            <Coverage day={L.day} />
          </>
        ) : null}
        {section === 'History' ? <History saved={L.progress.savedFactIds} canWrite={L.canWrite} onToggle={L.toggle} /> : null}
        {section === 'Leaders' ? <Leaders /> : null}
        {section === 'Saved' ? <Saved saved={L.progress.savedFactIds} canWrite={L.canWrite} onToggle={L.toggle} /> : null}
        <Card><Text style={{ color: T.muted, fontSize: 12 }}>Your answers, streak and saved facts are stored on this device only. There is no account, and clearing app data resets them.</Text></Card>
      </ScrollView>
    </Screen>
  );
}
