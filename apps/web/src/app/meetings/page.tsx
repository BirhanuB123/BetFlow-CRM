"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MeetingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/activities?tab=meetings");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-500">
      Redirecting to Activities…
    </div>
  );
}
