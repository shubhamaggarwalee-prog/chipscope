import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyQuiz, LEARNING_FACTS } from '@/content/learning';
import { dayNumber } from './learningCalendar';

export interface QuizAnswer { questionId: string; optionIndex: number; correct: boolean }
export interface LearningProgress {
  answers: Record<string, QuizAnswer>;
  savedFactIds: string[];
}
const KEY = 'chipscope.learning.v1';
export const EMPTY_PROGRESS: LearningProgress = { answers: {}, savedFactIds: [] };
let writes: Promise<unknown> = Promise.resolve();

export async function getLearningProgress(): Promise<LearningProgress> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { answers: {}, savedFactIds: [] };
  const parsed = JSON.parse(raw) as LearningProgress;
  if (!parsed || typeof parsed.answers !== 'object' || !parsed.answers || Array.isArray(parsed.answers)
    || !Array.isArray(parsed.savedFactIds) || parsed.savedFactIds.some((id) => typeof id !== 'string')) {
    throw new Error('Learning progress could not be loaded. Please retry.');
  }
  for (const [day, answer] of Object.entries(parsed.answers)) {
    dayNumber(day);
    if (!answer || typeof answer.questionId !== 'string' || !Number.isInteger(answer.optionIndex)
      || answer.optionIndex < 0 || answer.optionIndex > 2 || typeof answer.correct !== 'boolean') {
      throw new Error('Learning progress could not be loaded. Please retry.');
    }
  }
  return parsed;
}

function change(update: (progress: LearningProgress) => LearningProgress): Promise<LearningProgress> {
  const write = writes.catch(() => {}).then(async () => {
    const next = update(await getLearningProgress());
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  });
  writes = write;
  return write;
}

/** One credited answer per local calendar day; wrong answers still count as learning. */
export function submitDailyAnswer(day: string, optionIndex: number): Promise<LearningProgress> {
  dayNumber(day);
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 2) {
    return Promise.reject(new Error('Choose one of the three answers.'));
  }
  return change((progress) => {
    if (progress.answers[day]) return progress;
    const quiz = getDailyQuiz(day);
    return {
      ...progress,
      answers: {
        ...progress.answers,
        [day]: { questionId: quiz.id, optionIndex, correct: optionIndex === quiz.quiz.correctIndex },
      },
    };
  });
}

export function toggleSavedFact(id: string): Promise<LearningProgress> {
  if (!LEARNING_FACTS.some((fact) => fact.id === id)) return Promise.reject(new Error('Fact not found.'));
  return change((progress) => ({
    ...progress,
    savedFactIds: progress.savedFactIds.includes(id)
      ? progress.savedFactIds.filter((saved) => saved !== id)
      : [...progress.savedFactIds, id],
  }));
}
