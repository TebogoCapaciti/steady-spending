import { createFileRoute } from "@tanstack/react-router";
import { useFinance, useMonthSummary, monthKey, formatMoney, CATEGORIES, type Category } from "@/lib/finance";
import { CategoryIcon } from "@/components/category-icon";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/budgets")({
  head: () => ({
    meta: [
      { title: "Budgets — Tide" },
      { name: "description", content: "Set monthly budgets per category and track your progress." },
      { property: "og:title", content: "Budgets — Tide" },
      { property: "og:description", content: "Set monthly budgets per category and track your progress." },
    ],
  }),
  component: Budgets,
});

function Budgets() {
  const { budgets, setBudget } = useFinance();
  const { byCategory } = useMonthSummary(monthKey(new Date()));

  const spentByCategory = Object.fromEntries(
    byCategory.map((c) => [c.category.id, c.total]),
  ) as Partial<Record<Category, number>>;

  const totalBudget = Object.values(budgets).reduce((s, b) => s + (b ?? 0), 0);
  const totalSpent = byCategory.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Budgets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatMoney(totalSpent)} spent of {formatMoney(totalBudget)} budgeted this month
        </p>
      </header>

      <div className="space-y-3">
        {CATEGORIES.map((c) => {
          const budget = budgets[c.id] ?? 0;
          const spent = spentByCategory[c.id] ?? 0;
          const ratio = budget > 0 ? spent / budget : 0;
          const color =
            ratio >= 0.9 ? "bg-destructive" : ratio >= 0.7 ? "bg-warning" : "bg-primary";

          return (
            <div key={c.id} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <CategoryIcon category={c.id} className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(spent)} spent
                    {budget > 0 && ` · ${Math.round(ratio * 100)}% used`}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  R
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={budget || ""}
                    placeholder="0"
                    onChange={(e) => {
                      setBudget(c.id, Math.max(0, parseFloat(e.target.value) || 0));
                    }}
                    onBlur={() => toast.success(`${c.label} budget saved`)}
                    className="w-28 rounded-lg border border-input bg-background px-3 py-1.5 text-right text-sm font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </label>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${Math.min(Math.max(ratio * 100, budget > 0 ? 2 : 0), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
