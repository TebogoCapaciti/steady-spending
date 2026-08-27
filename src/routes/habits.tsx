import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import {
  useHabits,
  dayKey,
  shiftDay,
  streakOf,
  HABIT_ICONS,
  type HabitIcon as HabitIconId,
} from "@/lib/habits";
import { HabitIcon } from "@/components/habit-icon";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits — Tide" },
      {
        name: "description",
        content: "Build daily habits, check them off and watch your streaks grow.",
      },
      { property: "og:title", content: "Habits — Tide" },
      {
        property: "og:description",
        content: "Build daily habits, check them off and watch your streaks grow.",
      },
    ],
  }),
  component: Habits,
});

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = shiftDay(-(6 - i));
    return {
      key: dayKey(d),
      label: d.toLocaleDateString("en-ZA", { weekday: "narrow" }),
    };
  });
}

function Habits() {
  const { habits, hydrated, addHabit, removeHabit, toggleHabit } = useHabits();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<HabitIconId>("activity");
  const [adding, setAdding] = useState(false);

  const days = lastSevenDays();
  const today = dayKey();
  const doneToday = habits.filter((h) => h.done.includes(today)).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Habits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {habits.length > 0
              ? `${doneToday} of ${habits.length} done today`
              : "Small daily wins, tracked simply"}
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New habit
        </button>
      </header>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addHabit(name.trim(), icon);
            setName("");
            setAdding(false);
          }}
          className="rounded-2xl bg-card p-5 shadow-sm"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Walk 5,000 steps"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {HABIT_ICONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setIcon(id)}
                aria-label={id}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  icon === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground hover:bg-muted"
                }`}
              >
                <HabitIcon icon={id} />
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add habit
            </button>
          </div>
        </form>
      )}

      {hydrated && habits.length === 0 && !adding && (
        <EmptyState
          title="No habits yet"
          description="Create your first daily habit — exercise, reading, or a no-spend day — and start a streak."
          action={
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New habit
            </button>
          }
        />
      )}

      <div className="space-y-3">
        {habits.map((habit) => {
          const streak = streakOf(habit);
          const checked = habit.done.includes(today);
          return (
            <div key={habit.id} className="group rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  aria-label={checked ? `Undo ${habit.name}` : `Complete ${habit.name}`}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    checked
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground hover:bg-muted"
                  }`}
                >
                  {checked ? <Check className="h-4.5 w-4.5" /> : <HabitIcon icon={habit.icon} className="h-4.5 w-4.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{habit.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className={`h-3.5 w-3.5 ${streak > 0 ? "text-warning" : ""}`} />
                    {streak > 0 ? `${streak} day streak` : "No streak yet"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {days.map((d) => {
                    const on = habit.done.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        onClick={() => toggleHabit(habit.id, d.key)}
                        title={d.key}
                        aria-label={`${habit.name} on ${d.key}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-medium transition-colors ${
                          on ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => removeHabit(habit.id)}
                  aria-label={`Delete ${habit.name}`}
                  className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
