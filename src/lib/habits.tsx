import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  /** ISO yyyy-mm-dd dates on which the habit was completed */
  done: string[];
}

export const HABIT_ICONS = [
  "activity",
  "book",
  "droplet",
  "wallet",
  "sun",
  "moon",
  "leaf",
] as const;
export type HabitIcon = (typeof HABIT_ICONS)[number];

const STORAGE_KEY = "tide-habits-v1";

export function dayKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function shiftDay(days: number, from: Date = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

function seedHabits(): Habit[] {
  const base: Array<[string, HabitIcon, number[]]> = [
    ["Exercise", "activity", [0, 1, 2, 4, 5]],
    ["Read 20 pages", "book", [0, 1, 3]],
    ["Drink 2L water", "droplet", [0, 1, 2, 3, 4]],
    ["No-spend day", "wallet", [1, 3, 6]],
  ];
  return base.map(([name, icon, offsets], i) => ({
    id: `habit-${i}`,
    name,
    icon,
    done: offsets.map((o) => dayKey(shiftDay(-o))),
  }));
}

export function streakOf(habit: Habit) {
  const set = new Set(habit.done);
  let streak = 0;
  // Allow today to be unchecked without breaking yesterday's streak.
  let start = set.has(dayKey()) ? 0 : 1;
  for (let i = start; i < 400; i++) {
    if (set.has(dayKey(shiftDay(-i)))) streak++;
    else break;
  }
  return streak;
}

interface HabitState {
  habits: Habit[];
  hydrated: boolean;
  addHabit: (name: string, icon: HabitIcon) => void;
  removeHabit: (id: string) => void;
  toggleHabit: (id: string, date?: string) => void;
  resetHabits: () => void;
}

const HabitContext = createContext<HabitState | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setHabits(raw ? (JSON.parse(raw) as Habit[]) : seedHabits());
    } catch {
      setHabits(seedHabits());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits, hydrated]);

  const addHabit = useCallback((name: string, icon: HabitIcon) => {
    setHabits((prev) => [...prev, { id: crypto.randomUUID(), name, icon, done: [] }]);
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleHabit = useCallback((id: string, date?: string) => {
    const key = date ?? dayKey();
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              done: h.done.includes(key) ? h.done.filter((d) => d !== key) : [...h.done, key],
            }
          : h,
      ),
    );
  }, []);

  const resetHabits = useCallback(() => setHabits(seedHabits()), []);

  const value = useMemo(
    () => ({ habits, hydrated, addHabit, removeHabit, toggleHabit, resetHabits }),
    [habits, hydrated, addHabit, removeHabit, toggleHabit, resetHabits],
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitProvider");
  return ctx;
}
