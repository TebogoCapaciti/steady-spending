import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "bills", label: "Bills" },
  { id: "entertainment", label: "Entertainment" },
  { id: "shopping", label: "Shopping" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "savings", label: "Savings" },
  { id: "health", label: "Health" },
  { id: "other", label: "Other" },

] as const;

export type Category = (typeof CATEGORIES)[number]["id"];

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO yyyy-mm-dd
}

export type Budgets = Partial<Record<Category, number>>;

export function monthKey(date: string | Date) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMoney(amount: number) {
  // Deterministic formatting so SSR and client render identical strings.
  const rounded = Math.round(Math.abs(amount));
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount < 0 ? "−" : ""}R ${grouped}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedTransactions(): Transaction[] {
  const seed: Array<[string, "income" | "expense", number, Category, number]> = [
    ["Salary", "income", 32000, "other", 25],
    ["Salary", "income", 32000, "other", 55],
    ["Groceries at Woolworths", "expense", 1450, "food", 2],
    ["Dinner with friends", "expense", 620, "food", 5],
    ["Coffee & pastries", "expense", 180, "food", 8],
    ["Uber to office", "expense", 145, "transport", 3],
    ["Gautrain pass", "expense", 900, "transport", 10],
    ["Fuel", "expense", 1100, "transport", 12],
    ["Rent", "expense", 9500, "bills", 6],
    ["Electricity", "expense", 1150, "bills", 9],
    ["Fibre internet", "expense", 899, "bills", 14],
    ["Cinema tickets", "expense", 340, "entertainment", 7],
    ["Streaming subscriptions", "expense", 299, "subscriptions", 16],
    ["Gym membership", "expense", 650, "subscriptions", 11],
    ["Transfer to savings", "expense", 3000, "savings", 24],
    ["New running shoes", "expense", 2200, "shopping", 18],
    ["Pharmacy", "expense", 420, "health", 20],
    ["Groceries", "expense", 1600, "food", 33],
    ["Rent", "expense", 9500, "bills", 36],
    ["Concert ticket", "expense", 850, "entertainment", 40],
    ["Freelance project", "income", 6000, "other", 45],
  ];
  return seed.map(([note, type, amount, category, ago], i) => ({
    id: `seed-${i}`,
    type,
    amount,
    category,
    note,
    date: daysAgo(ago),
  }));
}

const defaultBudgets: Budgets = {
  food: 6000,
  transport: 2500,
  bills: 12000,
  entertainment: 2000,
  shopping: 3000,
  subscriptions: 1200,
  savings: 4000,
  health: 1000,
};


const STORAGE_KEY = "tide-finance-v1";

interface FinanceState {
  transactions: Transaction[];
  budgets: Budgets;
  hydrated: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  setBudget: (category: Category, amount: number) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceState | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budgets>(defaultBudgets);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTransactions(parsed.transactions ?? []);
        setBudgets(parsed.budgets ?? defaultBudgets);
      } else {
        setTransactions(seedTransactions());
      }
    } catch {
      setTransactions(seedTransactions());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgets }));
  }, [transactions, budgets, hydrated]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      { ...t, id: crypto.randomUUID() },
      ...prev,
    ]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setBudget = useCallback((category: Category, amount: number) => {
    setBudgets((prev) => ({ ...prev, [category]: amount }));
  }, []);

  const resetData = useCallback(() => {
    setTransactions(seedTransactions());
    setBudgets(defaultBudgets);
  }, []);

  const value = useMemo(
    () => ({ transactions, budgets, hydrated, addTransaction, removeTransaction, setBudget, resetData }),
    [transactions, budgets, hydrated, addTransaction, removeTransaction, setBudget, resetData],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function useMonthSummary(month: string) {
  const { transactions } = useFinance();
  return useMemo(() => {
    const inMonth = transactions.filter((t) => monthKey(t.date) === month);
    const income = inMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = inMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const byCategory = CATEGORIES.map((c) => ({
      category: c,
      total: inMonth
        .filter((t) => t.type === "expense" && t.category === c.id)
        .reduce((s, t) => s + t.amount, 0),
    })).filter((c) => c.total > 0);
    return { income, expenses, net: income - expenses, byCategory, transactions: inMonth };
  }, [transactions, month]);
}
