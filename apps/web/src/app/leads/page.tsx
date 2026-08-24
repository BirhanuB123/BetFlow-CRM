"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/language-context";

export default function LeadsRedirectPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/pipeline?tab=leads");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-500">
      {t("nav.leads")}...
    </div>
  );
}
