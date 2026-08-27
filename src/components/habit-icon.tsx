import { Activity, BookOpen, Droplet, Wallet, Sun, Moon, Leaf, type LucideIcon } from "lucide-react";
import type { HabitIcon as HabitIconId } from "@/lib/habits";

const ICONS: Record<HabitIconId, LucideIcon> = {
  activity: Activity,
  book: BookOpen,
  droplet: Droplet,
  wallet: Wallet,
  sun: Sun,
  moon: Moon,
  leaf: Leaf,
};

export function HabitIcon({ icon, className }: { icon: HabitIconId; className?: string }) {
  const Icon = ICONS[icon] ?? Activity;
  return <Icon className={className ?? "h-4 w-4"} />;
}
