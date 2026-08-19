"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnitsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/projects");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-500">
      Redirecting to Projects…
    </div>
  );
}
