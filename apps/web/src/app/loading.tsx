import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";

export default function GlobalModuleLoading() {
  return (
    <DashboardShell title="Loading Module..." description="Fetching platform data" active="">
      <div className="space-y-4 animate-pulse">
        <div className="h-14 w-full rounded-xl bg-slate-200/70" />
        <div className="h-96 w-full rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
          <TableSkeleton rows={8} cols={6} />
        </div>
      </div>
    </DashboardShell>
  );
}
