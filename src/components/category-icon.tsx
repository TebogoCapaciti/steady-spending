import {
  UtensilsCrossed,
  Car,
  FileText,
  Clapperboard,
  ShoppingBag,
  HeartPulse,
  CircleEllipsis,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/finance";

const ICONS: Record<Category, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Car,
  bills: FileText,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  health: HeartPulse,
  other: CircleEllipsis,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category];
  return <Icon className={className ?? "h-4 w-4"} />;
}

export function categoryLabel(id: Category) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
