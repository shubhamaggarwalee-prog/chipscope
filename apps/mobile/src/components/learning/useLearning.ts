import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_PROGRESS, getLearningProgress, submitDailyAnswer, toggleSavedFact, type LearningProgress } from '@/lib/learningProgress';
import { useLocalDay } from '@/lib/useLocalDay';

export function useLearning() {
  const day = useLocalDay();
  const [progress, setProgress] = useState<LearningProgress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoaded(false);
    setError(null);
    getLearningProgress()
      .then((p) => { setProgress(p); setLoaded(true); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not read saved progress.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);


  const run = useCallback(async (fn: () => Promise<LearningProgress>) => {
    if (busy.current || !loaded) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try { setProgress(await fn()); }
    catch (e) { setError(e instanceof Error ? `Not saved: ${e.message}` : 'Not saved. Please retry.'); }
    finally { busy.current = false; setPending(false); }
  }, [loaded]);

  const submit = useCallback((i: number) => run(() => submitDailyAnswer(day, i)), [run, day]);
  const toggle = useCallback((id: string) => run(() => toggleSavedFact(id)), [run]);
  return { day, progress, loaded, loading, pending, error, retry: load, submit, toggle, canWrite: loaded && !loading && !pending };
}
