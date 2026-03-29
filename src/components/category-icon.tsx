import { Utensils, Car, ReceiptText, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Food: { icon: Utensils, color: "text-orange-600", bg: "bg-orange-100" },
  Transport: { icon: Car, color: "text-blue-600", bg: "bg-blue-100" },
  Bills: { icon: ReceiptText, color: "text-purple-600", bg: "bg-purple-100" },
  Shopping: { icon: ShoppingBag, color: "text-pink-600", bg: "bg-pink-100" },
  Other: { icon: Package, color: "text-slate-600", bg: "bg-slate-100" },
};

export { categoryConfig };

export function CategoryIcon({ category, className, size = 20 }: CategoryIconProps) {
  const config = categoryConfig[category] ?? categoryConfig["Other"];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center justify-center rounded-xl p-2.5", config.bg, className)}>
      <Icon size={size} className={config.color} strokeWidth={2.5} />
    </div>
  );
}
