# Tide

A personal finance and habit tracker with a clean, minimal interface. Log income and expenses, track spending against monthly budgets per category, and build daily habits with streak tracking — all in one calm, teal-and-charcoal dashboard.

## Features

- **Dashboard** — time-of-day greeting, income/expenses/remaining at a glance, a 6-month spending trend chart, category breakdown, recent activity, and a monthly budget progress bar that shifts from green to amber to red as you approach your limit
- **Transactions** — log income and expenses across 9 categories (Food, Transport, Bills, Entertainment, Shopping, Subscriptions, Savings, Health, Other)
- **Budgets** — set a monthly limit per category and track spend against it in real time
- **Habits** — create daily habits, check them off, and track streaks over a rolling 7-day view
- **Settings** — dark mode toggle and data reset
- **Dark mode** — full light/dark theme support throughout

All data is stored locally in the browser (`localStorage`) — no account or backend required.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components on top of [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/) for data visualization
- [Vite](https://vite.dev/) + [Bun](https://bun.sh/)

## Getting Started

Requires [Bun](https://bun.sh/) (or Node.js + npm).

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

Then open the local dev server URL shown in your terminal.

### Other scripts

```sh
bun run build      # production build
bun run preview    # preview the production build locally
bun run lint       # run eslint
bun run format     # run prettier
```

## Project Structure

```
src/
├── components/       # shared UI (app shell, icons, empty states, shadcn/ui primitives)
├── lib/
│   ├── finance.tsx   # transactions & budgets state, category definitions, money formatting
│   ├── habits.tsx    # habits state, streak calculation
│   └── theme.tsx     # dark mode
├── routes/           # file-based routes: dashboard, transactions, budgets, habits, settings
└── styles.css        # design tokens and Tailwind theme
```
