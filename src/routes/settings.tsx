import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useFinance } from "@/lib/finance";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Tide" },
      { name: "description", content: "Appearance and data settings for Tide." },
      { property: "og:title", content: "Settings — Tide" },
      { property: "og:description", content: "Appearance and data settings for Tide." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { dark, toggle } = useTheme();
  const { transactions, resetData } = useFinance();

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Make Tide feel like yours</p>
      </header>

      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              {dark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </span>
            <div>
              <p className="text-sm font-semibold">Dark mode</p>
              <p className="text-xs text-muted-foreground">
                {dark ? "Currently using the dark theme" : "Currently using the light theme"}
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            role="switch"
            aria-checked={dark}
            aria-label="Toggle dark mode"
            className={`relative h-7 w-12 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow transition-all ${dark ? "left-6" : "left-1"}`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <RotateCcw className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Reset demo data</p>
              <p className="text-xs text-muted-foreground">
                {transactions.length} transactions stored locally in your browser
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetData();
              toast.success("Demo data restored");
            }}
            className="rounded-xl border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Reset
          </button>
        </div>
      </section>
    </div>
  );
}
