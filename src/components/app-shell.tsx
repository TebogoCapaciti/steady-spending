import { Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, Target, Settings, Moon, Sun, Waves } from "lucide-react";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { dark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 px-6 pt-7 pb-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Waves className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-sidebar-accent-foreground">
            Tide
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 px-8 py-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
