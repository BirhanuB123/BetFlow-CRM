"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/api";
import { useBranding } from "@/lib/branding-context";

export default function RootPage() {
  const router = useRouter();
  const { systemName } = useBranding();

  useEffect(() => {
    const session = getSession();
    if (session?.accessToken) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 selection:bg-primary selection:text-white">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/betflow-mark.svg"
          alt={systemName}
          width={44}
          height={44}
          priority
          className="h-11 w-11 animate-pulse"
        />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading {systemName}...</span>
        </div>
      </div>
    </div>
  );
}
