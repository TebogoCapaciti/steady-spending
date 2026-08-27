import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowRight, Flame, CalendarDays } from "lucide-react";
import {
  useFinance,
  useMonthSummary,
  monthKey,
  formatMoney,
} from "@/lib/finance";
import { useHabits, dayKey, shiftDay, streakOf } from "@/lib/habits";
import { CategoryIcon, categoryLabel } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Tide" },
      { name: "description", content: "Your monthly money at a glance: income, spending, budgets and trends." },
      { property: "og:title", content: "Dashboard — Tide" },
      { property: "og:description", content: "Your monthly money at a glance: income, spending, budgets and trends." },
    ],
  }),
  component: Dashboard,
});

function lastSixMonths() {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleString("en-ZA", { month: "short" }),
    });
  }
  return months;
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

function Dashboard() {
  const { transactions, budgets, hydrated } = useFinance();
  const { habits } = useHabits();
  const greeting = useGreeting();
  const currentMonth = monthKey(new Date());
  const { income, expenses, net, byCategory } = useMonthSummary(currentMonth);

  const months = lastSixMonths();
  const monthlySpending = months.map((m) => ({
    ...m,
    total: transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === m.key)
      .reduce((s, t) => s + t.amount, 0),
  }));
  const maxSpend = Math.max(...monthlySpending.map((m) => m.total), 1);

  const totalBudget = Object.values(budgets).reduce((s, b) => s + (b ?? 0), 0);
  const budgetUsed = totalBudget > 0 ? Math.min(expenses / totalBudget, 1) : 0;
  const budgetColor =
    budgetUsed >= 0.9 ? "bg-destructive" : budgetUsed >= 0.7 ? "bg-warning" : "bg-primary";

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const maxCategory = Math.max(...byCategory.map((c) => c.total), 1);

  // Weekly summary
  const weekDays = Array.from({ length: 7 }, (_, i) => dayKey(shiftDay(-i)));
  const weekSet = new Set(weekDays);
  const weekTx = transactions.filter((t) => weekSet.has(t.date));
  const weekSpent = weekTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const weekIncome = weekTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevWeekSet = new Set(Array.from({ length: 7 }, (_, i) => dayKey(shiftDay(-(i + 7)))));
  const prevWeekSpent = transactions
    .filter((t) => t.type === "expense" && prevWeekSet.has(t.date))
    .reduce((s, t) => s + t.amount, 0);
  const weekDelta = prevWeekSpent > 0 ? (weekSpent - prevWeekSpent) / prevWeekSpent : 0;
  const today = dayKey();
  const habitsDoneToday = habits.filter((h) => h.done.includes(today)).length;
  const bestStreak = habits.reduce((m, h) => Math.max(m, streakOf(h)), 0);
  const isEmpty = hydrated && transactions.length === 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{greeting}, Tebogo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's your {new Date().toLocaleString("en-ZA", { month: "long", year: "numeric" })} at a glance
        </p>
      </header>

      {isEmpty && (
        <EmptyState
          title="Nothing logged yet"
          description="Add your first income or expense and your summary, charts and budgets will fill in here."
          action={
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add a transaction <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      )}


      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          label="Income"
          value={formatMoney(income)}
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-destructive" />}
          label="Expenses"
          value={formatMoney(expenses)}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5 text-primary" />}
          label="Remaining"
          value={formatMoney(net)}
        />
      </section>

      {totalBudget > 0 && (
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Monthly budget</h2>
            <span className="text-sm text-muted-foreground">
              {formatMoney(expenses)} of {formatMoney(totalBudget)}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
              style={{ width: `${Math.max(budgetUsed * 100, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {budgetUsed >= 1
              ? "You're over budget this month."
              : budgetUsed >= 0.9
                ? "Almost at your limit — time to slow down."
                : budgetUsed >= 0.7
                  ? "Approaching your limit."
                  : "Comfortably within budget."}
          </p>
        </section>
      )}

      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Spending, last 6 months</h2>
        <div className="mt-6 flex h-44 items-end gap-3">
          {monthlySpending.map((m) => (
            <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">
                {m.total > 0 ? formatMoney(m.total) : ""}
              </span>
              <div
                className={`w-full max-w-10 rounded-t-lg ${m.key === currentMonth ? "bg-primary" : "bg-primary/35"}`}
                style={{ height: `${Math.max((m.total / maxSpend) * 100, 3)}%` }}
              />
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Where it went</h2>
          <div className="mt-5 space-y-4">
            {byCategory.length === 0 && (
              <p className="text-sm text-muted-foreground">No expenses logged yet this month.</p>
            )}
            {byCategory.map(({ category, total }) => (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <CategoryIcon category={category.id} className="h-4 w-4 text-primary" />
                    {categoryLabel(category.id)}
                  </span>
                  <span className="text-muted-foreground">{formatMoney(total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(total / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <CategoryIcon category={t.category} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.note || categoryLabel(t.category)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date + "T00:00:00").toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-foreground"}`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatMoney(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
