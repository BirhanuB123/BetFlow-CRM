import { type ElementType } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: ElementType;
  /** Color theme for the icon background */
  color?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "navy";
  /** Optional trend indicator */
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  className?: string;
};

const colorMap: Record<
  NonNullable<StatCardProps["color"]>,
  { bg: string; icon: string; pill: string }
> = {
  navy:    { bg: "bg-primary/10",  icon: "text-[#233b66]",  pill: "bg-primary/10 text-[#233b66]" },
  indigo:  { bg: "bg-primary/10",     icon: "text-primary",  pill: "bg-primary/10 text-primary" },
  emerald: { bg: "bg-emerald-50",    icon: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700" },
  amber:   { bg: "bg-amber-50",      icon: "text-amber-600",   pill: "bg-amber-50 text-amber-700" },
  rose:    { bg: "bg-rose-50",       icon: "text-rose-600",    pill: "bg-rose-50 text-rose-700" },
  blue:    { bg: "bg-blue-50",       icon: "text-blue-600",    pill: "bg-blue-50 text-blue-700" },
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  color = "navy",
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-slate-500 leading-tight">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              colors.bg,
            )}
          >
            <Icon className={cn("size-4", colors.icon)} />
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
        {value}
      </p>

      {/* Footer row */}
      {(detail ?? trend) && (
        <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                trend === "up" && "bg-emerald-50 text-emerald-700",
                trend === "down" && "bg-rose-50 text-rose-700",
                trend === "flat" && "bg-slate-100 text-slate-500",
              )}
            >
              {trend === "up" && <TrendingUp className="size-3" />}
              {trend === "down" && <TrendingDown className="size-3" />}
              {trend === "flat" && <Minus className="size-3" />}
              {trendLabel}
            </span>
          )}
          {detail && (
            <p className="text-[12px] text-slate-400 font-medium truncate">
              {detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** A responsive 4-column stat row wrapper */
export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}
