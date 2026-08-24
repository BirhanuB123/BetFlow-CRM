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
  emerald: { bg: "bg-success/10",    icon: "text-success", pill: "bg-success/10 text-success" },
  amber:   { bg: "bg-warning/10",      icon: "text-warning",   pill: "bg-warning/10 text-warning" },
  rose:    { bg: "bg-destructive/10",       icon: "text-destructive",    pill: "bg-destructive/10 text-destructive" },
  blue:    { bg: "bg-info/10",       icon: "text-info",    pill: "bg-info/10 text-info" },
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
                trend === "up" && "bg-success/10 text-success",
                trend === "down" && "bg-destructive/10 text-destructive",
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
