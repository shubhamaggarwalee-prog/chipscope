import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, H2, Body, Muted, T } from '@/ui';
import { getDailyQuiz } from '@/content/learning';
import { learningStreak } from '@/lib/learningCalendar';
import type { LearningProgress } from '@/lib/learningProgress';
import { Button, Source } from './common';

export function DailyQuiz({ day, progress, canWrite, onSubmit }: { day: string; progress: LearningProgress; canWrite: boolean; onSubmit: (i: number) => void }) {
  const answer = progress.answers[day];
  const fact = getDailyQuiz(day, answer?.questionId);
  const [pick, setPick] = useState<number | null>(null);
  const streak = learningStreak(Object.keys(progress.answers), day);
  const q = fact.quiz;
  return (
    <Card>
      <Text style={s.kicker}>DAILY QUIZ</Text>
      <H2>{q.question}</H2>
      {q.options.map((o, i) => {
        const chosen = (answer ? answer.optionIndex : pick) === i;
        const right = answer && i === q.correctIndex;
        return (
          <Pressable key={o} disabled={!!answer || !canWrite} onPress={() => setPick(i)}
            style={[s.opt, chosen && s.sel, right && s.right, answer && chosen && !answer.correct && s.wrong]}>
            <Body style={{ flex: 1 }}>{o}</Body>
            {right ? <Text style={s.tag}>Correct</Text> : answer && chosen ? <Text style={[s.tag, { color: T.amber }]}>Your answer</Text> : null}
          </Pressable>
        );
      })}
      {!answer ? (
        <Button label={canWrite ? 'Submit answer' : 'Please wait'} disabled={pick === null || !canWrite} onPress={() => pick !== null && onSubmit(pick)} />
      ) : (
        <View style={{ marginTop: 10 }}>
          <Body style={{ fontWeight: '700' }}>{answer.correct ? 'Correct.' : `Not quite. The answer: ${q.options[q.correctIndex]}.`}</Body>
          <Muted style={{ marginTop: 4 }}>{fact.body}</Muted>
          <Source source={fact.source} />
          <Muted style={{ marginTop: 8, color: T.green }}>Learning streak: {streak} {streak === 1 ? 'day' : 'days'}. Come back tomorrow for a new fact and question.</Muted>
        </View>
      )}
    </Card>
  );
}
const s = StyleSheet.create({
  kicker: { fontSize: 11, fontWeight: '800', color: T.accent, letterSpacing: 0.6, marginBottom: 4 },
  opt: { flexDirection: 'row', borderWidth: 1, borderColor: T.line, borderRadius: 10, padding: 11, marginTop: 8, alignItems: 'center' },
  sel: { borderColor: T.accent, backgroundColor: T.accentSoft },
  right: { borderColor: T.green, backgroundColor: T.greenSoft },
  wrong: { borderColor: T.amber, backgroundColor: T.amberSoft },
  tag: { fontSize: 11, fontWeight: '800', color: T.green },
});
