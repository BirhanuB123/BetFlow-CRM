"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/language-context";

export default function LegacyReservationsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/transactions?tab=reservations");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 text-xs font-semibold">
      {t("transactions.tabReservations")}...
    </div>
  );
}
