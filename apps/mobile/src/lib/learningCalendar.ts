const DAY = 86_400_000;

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Local calendar label, UTC arithmetic: daylight saving cannot skip a day. */
export function dayNumber(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Invalid learning day');
  const [year, month, date] = day.split('-').map(Number);
  const value = Date.UTC(year!, month! - 1, date!);
  if (new Date(value).toISOString().slice(0, 10) !== day) throw new Error('Invalid learning day');
  return Math.floor(value / DAY);
}

export function previousDay(day: string): string {
  return new Date((dayNumber(day) - 1) * DAY).toISOString().slice(0, 10);
}

export function learningStreak(completedDays: string[], today: string): number {
  const completed = new Set(completedDays);
  let day = completed.has(today) ? today : previousDay(today);
  let total = 0;
  while (completed.has(day)) { total++; day = previousDay(day); }
  return total;
}
