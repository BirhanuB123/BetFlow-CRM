"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/language-context";

export default function UnitsRedirectPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/projects");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-500 font-semibold">
      {t("units.title")}...
    </div>
  );
}
