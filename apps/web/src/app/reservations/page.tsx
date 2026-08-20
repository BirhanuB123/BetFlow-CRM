"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyReservationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/transactions?tab=reservations");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 text-xs font-semibold">
      Redirecting to Transactions & Finance (Reservations)
    </div>
  );
}
