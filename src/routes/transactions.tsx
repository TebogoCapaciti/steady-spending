import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useFinance, formatMoney, CATEGORIES, type Category } from "@/lib/finance";
import { CategoryIcon, categoryLabel } from "@/components/category-icon";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Tide" },
      { name: "description", content: "Log and review your income and expenses." },
      { property: "og:title", content: "Transactions — Tide" },
      { property: "og:description", content: "Log and review your income and expenses." },
    ],
  }),
  component: Transactions,
});

function Transactions() {
  const { transactions, addTransaction, removeTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const visible = sorted.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {transactions.length} entries logged
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add transaction
        </button>
      </header>

      <div className="flex gap-2">
        {(["all", "expense", "income"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {visible.length === 0 && (
          <li className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
            Nothing here yet — add your first transaction.
          </li>
        )}
        {visible.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CategoryIcon category={t.category} className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.note || categoryLabel(t.category)}</p>
              <p className="text-xs text-muted-foreground">
                {categoryLabel(t.category)} ·{" "}
                {new Date(t.date + "T00:00:00").toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-foreground"}`}
            >
              {t.type === "income" ? "+" : "−"}
              {formatMoney(t.amount)}
            </span>
            <button
              onClick={() => {
                removeTransaction(t.id);
                toast("Transaction removed");
              }}
              aria-label="Delete transaction"
              className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {showForm && <AddTransactionForm onClose={() => setShowForm(false)} onAdd={addTransaction} />}
    </div>
  );
}

function AddTransactionForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (t: { type: "income" | "expense"; amount: number; category: Category; note: string; date: string }) => void;
}) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    onAdd({ type, amount: value, category, note: note.trim(), date });
    toast.success("Transaction added");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add transaction</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors ${
                type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium">
          Amount (ZAR)
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Groceries at Woolworths"
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save transaction
        </button>
      </form>
    </div>
  );
}
