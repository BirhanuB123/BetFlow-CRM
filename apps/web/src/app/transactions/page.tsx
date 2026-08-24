"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo, Suspense } from "react";
import { BookmarkCheck, ScrollText, Coins } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReservationsView } from "@/components/views/reservations-view";
import { ContractsView } from "@/components/views/contracts-view";
import { PaymentsView } from "@/components/views/payments-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

type TabKey = "reservations" | "contracts" | "payments";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const activeTab: TabKey = useMemo(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "contracts") return "contracts";
    if (tabParam === "payments") return "payments";
    return "reservations";
  }, [searchParams]);

  const setTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`/transactions?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4">
      {/* Shared Header Chrome & Tab Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("reservations")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "reservations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <BookmarkCheck className="size-4" />
            {t("transactions.tabReservations")}
          </button>

          <button
            type="button"
            onClick={() => setTab("contracts")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "contracts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <ScrollText className="size-4" />
            {t("transactions.tabContracts")}
          </button>

          <button
            type="button"
            onClick={() => setTab("payments")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "payments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <Coins className="size-4" />
            {t("transactions.tabPayments")}
          </button>
        </div>
      </div>

      {/* Render Active View Component */}
      {activeTab === "reservations" && <ReservationsView />}
      {activeTab === "contracts" && <ContractsView />}
      {activeTab === "payments" && <PaymentsView />}
    </div>
  );
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  return (
    <DashboardShell
      title={t("transactions.title")}
      description={t("transactions.subtitle")}
      active="Transactions"
    >
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading transactions...</div>}>
        <TransactionsContent />
      </Suspense>
    </DashboardShell>
  );
}
