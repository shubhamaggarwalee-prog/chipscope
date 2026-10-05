import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDay } from './learningCalendar';

/** Refresh both the learning hub and its home preview after midnight or resume. */
export function useLocalDay(): string {
  const [day, setDay] = useState(localDay);
  useEffect(() => {
    const tick = () => setDay(localDay());
    const timer = setInterval(tick, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  return day;
}
